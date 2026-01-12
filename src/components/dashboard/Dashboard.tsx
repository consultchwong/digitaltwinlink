import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Bot, Link2, MessageCircle, Settings, Menu, X, Moon, Sun, LogOut, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Character, Mission } from "@/types/character";
import { CharacterEditorModal } from "@/components/character/CharacterEditorModal";
import { MissionSelectorModal } from "@/components/mission/MissionSelectorModal";
import { CharacterV3Data } from "@/types/character";
import { useAuth } from "@/hooks/useAuth";
import { useCharacters, DbCharacter } from "@/hooks/useCharacters";
import { useSessions, DbSession } from "@/hooks/useSessions";
import { toast } from "sonner";

interface DashboardProps {
  isGuest?: boolean;
}

export function Dashboard({ isGuest }: DashboardProps) {
  const { user, signOut } = useAuth();
  const { characters, isLoading: charactersLoading, createCharacter } = useCharacters();
  const { sessions, isLoading: sessionsLoading, createSession } = useSessions();
  
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<DbCharacter | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleCreateCharacter = async (v3Data: CharacterV3Data, avatarUrl?: string, backgroundUrl?: string) => {
    if (isGuest) {
      toast.error("Please sign in to create characters");
      return;
    }
    await createCharacter(v3Data.name, v3Data, avatarUrl, backgroundUrl);
  };

  const handleSelectCharacterForMission = (character: DbCharacter) => {
    setSelectedCharacter(character);
    setIsMissionModalOpen(true);
  };

  const handleMissionCreate = async (mission: Mission) => {
    if (!selectedCharacter) return;
    if (isGuest) {
      toast.error("Please sign in to create sessions");
      return;
    }
    await createSession(selectedCharacter.id, mission);
  };

  const copySessionLink = (token: string) => {
    const link = `${window.location.origin}/s/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-electric-cyan flex items-center justify-center">
            🔗
          </div>
          <span className="font-semibold">DigitalTwinLink</span>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-border bg-card p-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-electric-cyan flex items-center justify-center shadow-glow">
              🔗
            </div>
            <span className="text-lg font-bold">DigitalTwinLink</span>
          </div>

          <nav className="flex-1 space-y-1">
            <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-primary/10 text-primary font-medium">
              <Bot className="w-5 h-5" />
              Characters
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
              <Link2 className="w-5 h-5" />
              Sessions
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
              <MessageCircle className="w-5 h-5" />
              Messages
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
              <Settings className="w-5 h-5" />
              Settings
            </a>
          </nav>

          <div className="mt-auto space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </Button>
            {user && (
              <Button variant="ghost" size="sm" className="w-full justify-start text-destructive" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          >
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="w-72 min-h-screen border-r border-border bg-card p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-electric-cyan flex items-center justify-center">
                    🔗
                  </div>
                  <span className="text-lg font-bold">DigitalTwinLink</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <nav className="space-y-1">
                <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-primary/10 text-primary font-medium">
                  <Bot className="w-5 h-5" />
                  Characters
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
                  <Link2 className="w-5 h-5" />
                  Sessions
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  Messages
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
                  <Settings className="w-5 h-5" />
                  Settings
                </a>
              </nav>
            </motion.aside>
          </motion.div>
        )}

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8">
          {/* Welcome banner for guests */}
          {isGuest && (
            <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-sm text-primary">
                You're browsing as a guest. Sign in to save your characters and create shareable links.
              </p>
            </div>
          )}

          {/* Characters section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Your Characters</h2>
                <p className="text-muted-foreground">Reusable AI personas for your missions</p>
              </div>
              <Button variant="hero" onClick={() => setIsCharacterModalOpen(true)}>
                <Plus className="w-4 h-4" />
                New Character
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {characters.map((character, i) => (
                <motion.div
                  key={character.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-glow/20 transition-all cursor-pointer"
                  onClick={() => handleSelectCharacterForMission(character)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-electric-cyan flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {character.avatar_url ? (
                        <img src={character.avatar_url} alt={character.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        "🤖"
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{character.name}</h3>
                      <div className="flex gap-1">
                        {character.v3_data.tags?.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{character.v3_data.description}</p>
                </motion.div>
              ))}

              {/* Add character card */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: characters.length * 0.1 }}
                onClick={() => setIsCharacterModalOpen(true)}
                className="flex flex-col items-center justify-center gap-3 bg-card/50 border border-dashed border-border rounded-xl p-8 hover:border-primary/50 hover:bg-card transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <span className="text-muted-foreground">Create Character</span>
              </motion.button>
            </div>
          </section>

          {/* Sessions section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Recent Sessions</h2>
                <p className="text-muted-foreground">Track your mission progress</p>
              </div>
              <Button variant="outline">View All</Button>
            </div>

            {sessions.length === 0 ? (
              <div className="text-center py-12 bg-card/50 border border-dashed border-border rounded-xl">
                <p className="text-muted-foreground">No sessions yet. Create a character and start a mission!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session, i) => {
                  const character = characters.find((c) => c.id === session.character_id);
                  return (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-electric-cyan flex items-center justify-center">
                        🤖
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{session.mission.mission_title}</h3>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              session.status === "completed"
                                ? "bg-success/10 text-success"
                                : session.status === "active"
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {session.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {character?.name} • {session.mission.mission_type.replace("_", " ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => copySessionLink(session.link_token)}
                          title="Copy link"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => window.open(`/s/${session.link_token}`, "_blank")}
                          title="Open session"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Modals */}
      <CharacterEditorModal
        isOpen={isCharacterModalOpen}
        onClose={() => setIsCharacterModalOpen(false)}
        onSave={handleCreateCharacter}
      />
      <MissionSelectorModal
        isOpen={isMissionModalOpen}
        onClose={() => {
          setIsMissionModalOpen(false);
          setSelectedCharacter(null);
        }}
        onSelect={handleMissionCreate}
      />
    </div>
  );
}
