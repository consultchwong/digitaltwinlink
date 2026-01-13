import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useCharacters, DbCharacter } from "@/hooks/useCharacters";
import { useSessions, DbSession } from "@/hooks/useSessions";
import { TopBar } from "./TopBar";
import { SessionList } from "./SessionList";
import { EmptyChatPanel } from "./EmptyChatPanel";
import { CharacterModal } from "./CharacterModal";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { MissionSelectorModal } from "@/components/mission/MissionSelectorModal";
import { Character, Mission } from "@/types/character";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface DashboardProps {
  isGuest?: boolean;
}

export function Dashboard({ isGuest }: DashboardProps) {
  const { user } = useAuth();
  const { characters, isLoading: charactersLoading, createCharacter, updateCharacter, deleteCharacter } = useCharacters();
  const { sessions, isLoading: sessionsLoading, createSession } = useSessions();
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedSession, setSelectedSession] = useState<DbSession | null>(null);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [selectedCharacterForMission, setSelectedCharacterForMission] = useState<DbCharacter | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const isMobile = useIsMobile();

  useEffect(() => {
    // Initialize dark mode
    document.documentElement.classList.add("dark");
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleNewSession = () => {
    if (characters.length === 0) {
      setIsCharacterModalOpen(true);
    } else if (characters.length === 1) {
      setSelectedCharacterForMission(characters[0]);
      setIsMissionModalOpen(true);
    } else {
      setIsCharacterModalOpen(true);
    }
  };

  const handleSelectCharacterForMission = (character: DbCharacter) => {
    setSelectedCharacterForMission(character);
    setIsCharacterModalOpen(false);
    setIsMissionModalOpen(true);
  };

  const handleCreateMission = async (mission: Mission) => {
    if (!selectedCharacterForMission) return;
    
    const newSession = await createSession(selectedCharacterForMission.id, mission);
    if (newSession) {
      setSelectedSession(newSession);
      setIsMissionModalOpen(false);
      setSelectedCharacterForMission(null);
      if (isMobile) {
        setShowSidebar(false);
      }
    }
  };

  const handleSelectSession = (session: DbSession) => {
    setSelectedSession(session);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleBackToList = () => {
    setSelectedSession(null);
    setShowSidebar(true);
  };

  // Get character for selected session
  const getSessionCharacter = (session: DbSession): Character => {
    const dbChar = characters.find((c) => c.id === session.character_id);
    if (dbChar) {
      return {
        id: dbChar.id,
        name: dbChar.name,
        avatar_url: dbChar.avatar_url || undefined,
        background_url: dbChar.background_url || undefined,
        v3_data: dbChar.v3_data,
        created_at: dbChar.created_at,
        updated_at: dbChar.updated_at,
      };
    }
    // Fallback character
    return {
      id: session.character_id,
      name: "Unknown",
      v3_data: {
        name: "Unknown",
        description: "",
        personality: "",
        tags: [],
        first_mes: "Hello!",
      },
      created_at: session.created_at,
      updated_at: session.created_at,
    };
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Bar */}
      <TopBar
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenCharacters={() => setIsCharacterModalOpen(true)}
        showMenuButton={isMobile && !showSidebar}
        onToggleSidebar={() => setShowSidebar(true)}
      />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Session Sidebar */}
        <AnimatePresence mode="wait">
          {(showSidebar || !isMobile) && (
            <motion.div
              initial={isMobile ? { x: -300 } : false}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "border-r border-border shrink-0",
                isMobile ? "absolute inset-y-14 left-0 z-20 w-80" : "w-80 lg:w-96"
              )}
            >
              <SessionList
                sessions={sessions}
                characters={characters}
                selectedSessionId={selectedSession?.id}
                isLoading={sessionsLoading || charactersLoading}
                onSelectSession={handleSelectSession}
                onNewSession={handleNewSession}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay for mobile */}
        {isMobile && showSidebar && selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSidebar(false)}
            className="absolute inset-0 z-10 bg-black/50"
          />
        )}

        {/* Chat Panel */}
        <div className="flex-1 min-w-0">
          {selectedSession ? (
            <ChatInterface
              character={getSessionCharacter(selectedSession)}
              mission={selectedSession.mission}
              sessionId={selectedSession.id}
              onBack={isMobile ? handleBackToList : undefined}
            />
          ) : (
            <EmptyChatPanel
              onNewSession={handleNewSession}
              onOpenCharacters={() => setIsCharacterModalOpen(true)}
              hasCharacters={characters.length > 0}
            />
          )}
        </div>
      </div>

      {/* Character Modal */}
      <CharacterModal
        isOpen={isCharacterModalOpen}
        onClose={() => setIsCharacterModalOpen(false)}
        characters={characters}
        onDeleteCharacter={deleteCharacter}
        onSelectForMission={handleSelectCharacterForMission}
      />

      {/* Mission Modal */}
      <MissionSelectorModal
        isOpen={isMissionModalOpen}
        onClose={() => {
          setIsMissionModalOpen(false);
          setSelectedCharacterForMission(null);
        }}
        onSelect={handleCreateMission}
        character={selectedCharacterForMission || undefined}
      />
    </div>
  );
}
