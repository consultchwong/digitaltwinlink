import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MoreVertical, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Character, Mission, ChatMessage } from "@/types/character";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/hooks/use-toast";

interface ChatInterfaceProps {
  character: Character;
  mission: Mission;
  sessionId?: string;
  onBack?: () => void;
}

export function ChatInterface({ character, mission, sessionId, onBack }: ChatInterfaceProps) {
  const { settings } = useSettings();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat with first message
  useEffect(() => {
    if (!isInitialized && character.v3_data?.first_mes) {
      const initialMessage: ChatMessage = {
        id: "initial",
        session_id: sessionId || "demo",
        role: "assistant",
        content: character.v3_data.first_mes,
        suggested_options: getSuggestedOptions(mission.mission_type),
        created_at: new Date().toISOString(),
      };
      setMessages([initialMessage]);
      setIsInitialized(true);
    }
  }, [character, mission, sessionId, isInitialized]);

  function getSuggestedOptions(missionType: string): string[] {
    switch (missionType) {
      case "schedule_meeting":
        return ["Monday", "Tuesday", "Wednesday", "Any day works"];
      case "collect_info":
        return ["Start now", "Tell me more", "What do you need?"];
      case "negotiate":
        return ["Let's discuss", "What are the terms?", "I'm ready"];
      default:
        return ["Continue", "Tell me more", "Let's start"];
    }
  }

  const streamChat = async (userMessages: Array<{ role: string; content: string }>) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`;
    
    const response = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: userMessages,
        character: {
          name: character.name,
          personality: character.v3_data?.personality || "",
          description: character.v3_data?.description || "",
          first_mes: character.v3_data?.first_mes || "",
        },
        mission: {
          mission_type: mission.mission_type,
          mission_title: mission.mission_title,
          initial_details: mission.initial_details,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        toast({
          title: "Rate limit exceeded",
          description: "Please wait a moment and try again.",
          variant: "destructive",
        });
      } else if (response.status === 402) {
        toast({
          title: "Credits required",
          description: "Please add credits to continue using AI.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorData.error || "Failed to get AI response",
          variant: "destructive",
        });
      }
      throw new Error(errorData.error || "Failed to get AI response");
    }

    return response;
  };

  const parseSSEStream = async (
    response: Response,
    onDelta: (text: string) => void,
    onDone: () => void,
    provider: string
  ) => {
    const reader = response.body?.getReader();
    if (!reader) {
      onDone();
      return;
    }

    const decoder = new TextDecoder();
    let textBuffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        // Parse SSE format
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            onDone();
            return;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            
            // Handle different provider formats
            if (provider === "gemini") {
              // Gemini direct API format
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) onDelta(text);
            } else {
              // OpenAI-compatible format (Groq, Lovable AI)
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) onDelta(content);
            }
          } catch {
            // Incomplete JSON, put back and wait
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    onDone();
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      session_id: sessionId || "demo",
      role: "user",
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Build message history for API
    const apiMessages = [...messages, userMessage]
      .filter(m => m.role === "user" || m.role === "assistant")
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const response = await streamChat(apiMessages);
      
      let assistantContent = "";
      const assistantId = (Date.now() + 1).toString();

      // Create initial assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          session_id: sessionId || "demo",
          role: "assistant" as const,
          content: "",
          created_at: new Date().toISOString(),
        },
      ]);

      await parseSSEStream(
        response,
        (delta) => {
          assistantContent += delta;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: assistantContent }
                : m
            )
          );
        },
        () => {
          // Add suggested options at the end
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, suggested_options: getSuggestedOptions(mission.mission_type) }
                : m
            )
          );
          setIsTyping(false);
        },
        settings?.ai_provider || "default"
      );
    } catch (error) {
      console.error("Chat error:", error);
      setIsTyping(false);
    }
  };

  const handleQuickReply = (option: string) => {
    handleSendMessage(option);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-electric-cyan flex items-center justify-center text-xl">
          {character.avatar_url ? (
            <img src={character.avatar_url} alt={character.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            "🤖"
          )}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold">{character.name}</h2>
          <p className="text-xs text-muted-foreground truncate">Mission: {mission.mission_title}</p>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/10">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-success font-medium">Active</span>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>

      {/* Mission Banner */}
      <div className="px-4 py-3 bg-primary/5 border-b border-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-primary">{mission.mission_type.replace("_", " ").toUpperCase()}</span>
            <p className="text-sm text-muted-foreground">{mission.mission_title}</p>
          </div>
          <span className="text-xs text-muted-foreground">In Progress</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-electric-cyan flex items-center justify-center text-sm flex-shrink-0">
                  🤖
                </div>
              )}
              <div className={`max-w-[80%] ${message.role === "user" ? "order-1" : ""}`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-secondary text-secondary-foreground rounded-bl-md"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && messages[messages.length - 1]?.role !== "assistant" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-electric-cyan flex items-center justify-center text-sm">
              🤖
            </div>
            <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
                <span className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
                <span className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Options */}
      {messages.length > 0 && messages[messages.length - 1].suggested_options && !isTyping && (
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-2">
            {messages[messages.length - 1].suggested_options?.map((option) => (
              <Button
                key={option}
                variant="outline"
                size="sm"
                onClick={() => handleQuickReply(option)}
                className="flex-shrink-0 rounded-full"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-full bg-background"
            disabled={isTyping}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="rounded-full" 
            disabled={!input.trim() || isTyping}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
