import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useCharacters, DbCharacter } from "@/hooks/useCharacters";
import { useSessions, DbSession } from "@/hooks/useSessions";
import { TopBar } from "./TopBar";
import { SessionList } from "./SessionList";
import { EmptyChatPanel } from "./EmptyChatPanel";
import { CharacterEditor } from "./CharacterEditor";
import { CharacterModal } from "./CharacterModal";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { MissionSelectorModal } from "@/components/mission/MissionSelectorModal";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { Character, Mission, CharacterV3Data } from "@/types/character";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface DashboardProps {
  isGuest?: boolean;
}

type ViewMode = "chat" | "character-editor" | "settings";

export function Dashboard({ isGuest }: DashboardProps) {
  const { user } = useAuth();
  const { characters, isLoading: charactersLoading, createCharacter, updateCharacter, deleteCharacter } = useCharacters();
  const { sessions, isLoading: sessionsLoading, createSession } = useSessions();
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedSession, setSelectedSession] = useState<DbSession | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("chat");
  const [editingCharacter, setEditingCharacter] = useState<DbCharacter | null>(null);
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [selectedCharacterForMission, setSelectedCharacterForMission] = useState<DbCharacter | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const isMobile = useIsMobile();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Auto-hide sidebar on mobile when a session is selected
  useEffect(() => {
    if (isMobile && selectedSession) {
      setShowSidebar(false);
    }
  }, [isMobile, selectedSession]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleNewSession = () => {
    if (characters.length === 0) {
      // No characters, open character editor
      setEditingCharacter(null);
      setViewMode("character-editor");
    } else if (characters.length === 1) {
      // Single character, go directly to mission
      setSelectedCharacterForMission(characters[0]);
      setIsMissionModalOpen(true);
    } else {
      // Multiple characters, select one first for mission
      setSelectedCharacterForMission(characters[0]);
      setIsMissionModalOpen(true);
    }
  };

  const handleOpenCharacterEditor = (character?: DbCharacter) => {
    setIsCharacterModalOpen(false); // Close modal first
    setEditingCharacter(character || null);
    setViewMode("character-editor");
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleOpenCharacterModal = () => {
    setIsCharacterModalOpen(true);
  };

  const handleSaveCharacter = async (
    v3Data: CharacterV3Data,
    avatarUrl?: string,
    backgroundUrl?: string
  ) => {
    if (editingCharacter) {
      await updateCharacter(editingCharacter.id, {
        name: v3Data.name,
        v3_data: v3Data,
        avatar_url: avatarUrl,
        background_url: backgroundUrl,
      });
    } else {
      const newCharacter = await createCharacter(v3Data.name, v3Data, avatarUrl, backgroundUrl);
      // After creating, ask for mission
      if (newCharacter) {
        setSelectedCharacterForMission(newCharacter);
        setIsMissionModalOpen(true);
      }
    }
    setViewMode("chat");
    setEditingCharacter(null);
  };

  const handleCancelEditor = () => {
    setViewMode("chat");
    setEditingCharacter(null);
  };

  const handleCreateMission = async (mission: Mission) => {
    if (!selectedCharacterForMission) return;
    
    const newSession = await createSession(selectedCharacterForMission.id, mission);
    if (newSession) {
      setSelectedSession(newSession);
      setIsMissionModalOpen(false);
      setSelectedCharacterForMission(null);
      setViewMode("chat");
      if (isMobile) {
        setShowSidebar(false);
      }
    }
  };

  const handleSelectSession = (session: DbSession) => {
    setSelectedSession(session);
    setViewMode("chat");
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleBackToList = () => {
    setSelectedSession(null);
    setShowSidebar(true);
  };

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

  const handleOpenSettings = () => {
    setViewMode("settings");
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleCloseSettings = () => {
    setViewMode("chat");
  };

  const renderMainContent = () => {
    if (viewMode === "settings") {
      return (
        <SettingsPanel onBack={handleCloseSettings} />
      );
    }

    if (viewMode === "character-editor") {
      return (
        <CharacterEditor
          editingCharacter={editingCharacter}
          onSave={handleSaveCharacter}
          onCancel={handleCancelEditor}
        />
      );
    }

    if (selectedSession) {
      return (
        <ChatInterface
          character={getSessionCharacter(selectedSession)}
          mission={selectedSession.mission}
          sessionId={selectedSession.id}
          onBack={isMobile ? handleBackToList : undefined}
        />
      );
    }

    return (
      <EmptyChatPanel
        onNewSession={handleNewSession}
        onOpenCharacters={() => handleOpenCharacterEditor()}
        hasCharacters={characters.length > 0}
      />
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Bar */}
      <TopBar
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenCharacters={handleOpenCharacterModal}
        onNewCharacter={() => handleOpenCharacterEditor()}
        onOpenSettings={handleOpenSettings}
        showMenuButton={isMobile && !showSidebar}
        onToggleSidebar={() => setShowSidebar(true)}
      />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Session Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <>
              {/* Overlay for mobile */}
              {isMobile && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowSidebar(false)}
                  className="fixed inset-0 z-20 bg-black/50"
                  style={{ top: 56 }}
                />
              )}
              <motion.div
                initial={isMobile ? { x: "-100%" } : { opacity: 1 }}
                animate={{ x: 0, opacity: 1 }}
                exit={isMobile ? { x: "-100%" } : { opacity: 1 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={cn(
                  "border-r border-border bg-sidebar-background shrink-0 z-30",
                  isMobile 
                    ? "fixed left-0 top-14 bottom-0 w-[280px]" 
                    : "relative w-80 lg:w-96"
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
            </>
          )}
        </AnimatePresence>

        {/* Main Panel */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {renderMainContent()}
        </div>
      </div>

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

      {/* Character Modal */}
      <CharacterModal
        isOpen={isCharacterModalOpen}
        onClose={() => setIsCharacterModalOpen(false)}
        characters={characters}
        onDeleteCharacter={deleteCharacter}
        onEditCharacter={handleOpenCharacterEditor}
        onAddCharacter={() => handleOpenCharacterEditor()}
      />
    </div>
  );
}
