import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Filter, MessageSquare } from "lucide-react";
import { DbSession } from "@/hooks/useSessions";
import { DbCharacter } from "@/hooks/useCharacters";
import { SessionCard } from "./SessionCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface SessionListProps {
  sessions: DbSession[];
  characters: DbCharacter[];
  selectedSessionId?: string;
  isLoading?: boolean;
  onSelectSession: (session: DbSession) => void;
  onNewSession: () => void;
}

export function SessionList({
  sessions,
  characters,
  selectedSessionId,
  isLoading,
  onSelectSession,
  onNewSession,
}: SessionListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const getCharacter = (characterId: string) => {
    return characters.find((c) => c.id === characterId);
  };

  const filteredSessions = sessions.filter((session) => {
    if (!searchQuery) return true;
    const character = getCharacter(session.character_id);
    const searchLower = searchQuery.toLowerCase();
    return (
      character?.name.toLowerCase().includes(searchLower) ||
      session.mission?.mission_title?.toLowerCase().includes(searchLower)
    );
  });

  const handleCopyLink = (session: DbSession) => {
    const link = `${window.location.origin}/s/${session.link_token}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="flex flex-col h-full bg-sidebar-background">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-sidebar-foreground">Chats</h2>
          <Button
            size="sm"
            variant="ghost"
            onClick={onNewSession}
            className="text-sidebar-primary hover:text-sidebar-primary"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-sidebar-accent border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Session List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="space-y-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              {searchQuery ? "No chats found" : "No conversations yet"}
            </p>
            {!searchQuery && (
              <Button size="sm" onClick={onNewSession}>
                <Plus className="w-4 h-4 mr-2" />
                Start a chat
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                character={getCharacter(session.character_id)}
                isSelected={session.id === selectedSessionId}
                onClick={() => onSelectSession(session)}
                onCopyLink={() => handleCopyLink(session)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
