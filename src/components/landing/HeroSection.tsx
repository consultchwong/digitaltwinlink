import { motion } from "framer-motion";
import { ArrowRight, Bot, Link2, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function HeroSection({ onGetStarted, onSignIn }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-glow opacity-50" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-electric-cyan/10 rounded-full blur-[128px]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              AI-Powered Character Conversations
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Create AI Characters.{" "}
              <span className="text-gradient">Share Links.</span>{" "}
              Complete Missions.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              Build reusable AI personas that guide conversations toward specific goals—
              scheduling meetings, collecting feedback, closing deals, and more.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                variant="hero"
                size="xl"
                onClick={onGetStarted}
                className="group"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="hero-secondary"
                size="xl"
                onClick={onSignIn}
              >
                Sign in with Google
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12 justify-center lg:justify-start">
              {[
                { value: "10K+", label: "Sessions Created" },
                { value: "95%", label: "Mission Success" },
                { value: "50+", label: "Use Cases" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <ChatDemo />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ChatDemo() {
  const messages = [
    {
      role: "assistant" as const,
      content: "Hi! I'm Alex, your meeting scheduler. I noticed you wanted to connect with Sarah about the Q1 roadmap. When works best for you this week?",
      avatar: "🤖",
    },
    {
      role: "user" as const,
      content: "How about Thursday afternoon?",
    },
    {
      role: "assistant" as const,
      content: "Thursday afternoon works! I have these slots available:",
      avatar: "🤖",
      options: ["2:00 PM", "3:30 PM", "4:00 PM"],
    },
  ];

  return (
    <div className="relative">
      {/* Glow behind card */}
      <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-electric-cyan/20 rounded-3xl blur-2xl opacity-50" />
      
      {/* Chat window */}
      <div className="relative bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border bg-surface-elevated">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-electric-cyan flex items-center justify-center text-xl">
            🤖
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Alex - Meeting Scheduler</h3>
            <p className="text-xs text-muted-foreground">Mission: Schedule Q1 Roadmap Call</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-muted-foreground">Active</span>
          </div>
        </div>

        {/* Messages */}
        <div className="p-4 space-y-4 min-h-[320px] bg-background">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.3 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-electric-cyan flex items-center justify-center text-sm flex-shrink-0">
                  {msg.avatar}
                </div>
              )}
              <div className={`max-w-[80%] ${msg.role === "user" ? "order-1" : ""}`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-secondary text-secondary-foreground rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.options && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {msg.options.map((opt) => (
                      <motion.button
                        key={opt}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.4 }}
                        className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                      >
                        {opt}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
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
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-surface-elevated">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 bg-background border border-border rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              readOnly
            />
            <Button variant="hero" size="icon" className="rounded-full">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Floating features */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
        className="absolute -left-4 top-1/4 bg-card border border-border rounded-xl p-3 shadow-lg"
      >
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">AI Characters</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="absolute -right-4 top-1/2 bg-card border border-border rounded-xl p-3 shadow-lg"
      >
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-electric-cyan" />
          <span className="text-sm font-medium">Shareable Links</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="absolute -bottom-4 left-1/4 bg-card border border-border rounded-xl p-3 shadow-lg"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-success" />
          <span className="text-sm font-medium">Mission Focus</span>
        </div>
      </motion.div>
    </div>
  );
}
