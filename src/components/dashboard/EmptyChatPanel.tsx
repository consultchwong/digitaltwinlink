import { motion } from "framer-motion";
import { MessageSquare, Plus, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyChatPanelProps {
  onNewSession: () => void;
  onOpenCharacters: () => void;
  hasCharacters: boolean;
}

export function EmptyChatPanel({
  onNewSession,
  onOpenCharacters,
  hasCharacters,
}: EmptyChatPanelProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-background p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-glow opacity-30 pointer-events-none" />

        {/* Icon */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-electric-cyan/20 animate-pulse" />
          <div className="absolute inset-2 rounded-full bg-card flex items-center justify-center border border-border">
            <MessageSquare className="w-10 h-10 text-primary" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2">Welcome to DigitalTwinLink</h2>
        <p className="text-muted-foreground mb-8">
          Create AI characters and send mission-focused chat links to collect information or schedule meetings.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {hasCharacters ? (
            <Button onClick={onNewSession} size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Start New Chat
            </Button>
          ) : (
            <Button onClick={onOpenCharacters} size="lg" className="gap-2">
              <Users className="w-5 h-5" />
              Create Your First Character
            </Button>
          )}
        </div>

        {/* Feature hints */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-4 rounded-lg bg-card border border-border">
            <Users className="w-6 h-6 text-primary mb-2" />
            <h4 className="font-medium text-sm mb-1">Create Characters</h4>
            <p className="text-xs text-muted-foreground">
              Design AI personalities for different tasks
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <Sparkles className="w-6 h-6 text-primary mb-2" />
            <h4 className="font-medium text-sm mb-1">Set Missions</h4>
            <p className="text-xs text-muted-foreground">
              Define goals like scheduling or data collection
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <MessageSquare className="w-6 h-6 text-primary mb-2" />
            <h4 className="font-medium text-sm mb-1">Share Links</h4>
            <p className="text-xs text-muted-foreground">
              Send chat links and track conversations
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
