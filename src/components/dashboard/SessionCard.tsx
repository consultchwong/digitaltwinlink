import { motion } from "framer-motion";
import { Check, Clock, MessageCircle, Copy } from "lucide-react";
import { DbSession } from "@/hooks/useSessions";
import { DbCharacter } from "@/hooks/useCharacters";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface SessionCardProps {
  session: DbSession;
  character?: DbCharacter;
  isSelected?: boolean;
  onClick: () => void;
  onCopyLink?: () => void;
}

export function SessionCard({
  session,
  character,
  isSelected,
  onClick,
  onCopyLink,
}: SessionCardProps) {
  const statusIcon = {
    active: <Clock className="w-3 h-3 text-warning" />,
    completed: <Check className="w-3 h-3 text-success" />,
    expired: <Clock className="w-3 h-3 text-muted-foreground" />,
  };

  const getLastMessage = () => {
    // For now show the mission title as preview
    return session.mission?.mission_title || "New conversation";
  };

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyLink?.();
  };

  return (
    <motion.div
      whileHover={{ backgroundColor: "hsl(var(--accent) / 0.5)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 cursor-pointer border-b border-border/50 transition-colors",
        isSelected && "bg-accent"
      )}
    >
      {/* Avatar */}
      <Avatar className="w-12 h-12 shrink-0">
        <AvatarImage src={character?.avatar_url || undefined} />
        <AvatarFallback className="bg-primary/10 text-primary font-medium">
          {character?.name?.charAt(0) || "?"}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm truncate">
            {character?.name || "Unknown Character"}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatDistanceToNow(new Date(session.created_at), { addSuffix: false })}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-sm text-muted-foreground truncate flex-1">
            {getLastMessage()}
          </p>
          <div className="flex items-center gap-1 shrink-0">
            {statusIcon[session.status]}
          </div>
        </div>
      </div>

      {/* Copy button (visible on hover) */}
      {onCopyLink && (
        <button
          onClick={handleCopyClick}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-muted transition-opacity"
          title="Copy session link"
        >
          <Copy className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
    </motion.div>
  );
}
