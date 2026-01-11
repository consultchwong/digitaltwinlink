import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, MoreVertical, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Character, Mission, ChatMessage } from "@/types/character";

interface ChatInterfaceProps {
  character: Character;
  mission: Mission;
  sessionId?: string;
  onBack?: () => void;
}

const demoMessages: ChatMessage[] = [
  {
    id: "1",
    session_id: "demo",
    role: "assistant",
    content: "Hi there! I'm Alex, and I'll be helping you schedule a meeting with Sarah about the Q1 Roadmap. What days work best for you this week?",
    suggested_options: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    created_at: new Date().toISOString(),
  },
];

export function ChatInterface({ character, mission, sessionId, onBack }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(demoMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

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

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        session_id: sessionId || "demo",
        role: "assistant",
        content: `Great choice! I have a few time slots available. Which one works best for you?`,
        suggested_options: ["10:00 AM", "2:00 PM", "4:00 PM"],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickReply = (option: string) => {
    handleSendMessage(option);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
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
              transition={{ delay: index * 0.1 }}
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
        {isTyping && (
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
                variant="chat"
                size="sm"
                onClick={() => handleQuickReply(option)}
                className="flex-shrink-0"
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
          />
          <Button type="submit" variant="hero" size="icon" className="rounded-full" disabled={!input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
