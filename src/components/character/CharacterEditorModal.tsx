import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bot, Camera, Image, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CharacterV3Data, CharacterBookEntry } from "@/types/character";

interface CharacterEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (character: CharacterV3Data) => void;
}

const defaultCharacter: CharacterV3Data = {
  name: "",
  description: "",
  personality: "",
  tags: [],
  first_mes: "",
  alternate_greetings: [],
  mes_example: "",
  character_book: { entries: [] },
  system_prompt: "",
  post_history_instructions: "",
  scenario: "",
  creator_notes: "",
};

export function CharacterEditorModal({ isOpen, onClose, onSave }: CharacterEditorModalProps) {
  const [character, setCharacter] = useState<CharacterV3Data>(defaultCharacter);
  const [tagInput, setTagInput] = useState("");
  const [activeTab, setActiveTab] = useState("personality");

  const handleTagAdd = () => {
    if (tagInput.trim() && !character.tags.includes(tagInput.trim())) {
      setCharacter({ ...character, tags: [...character.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleTagRemove = (tag: string) => {
    setCharacter({ ...character, tags: character.tags.filter((t) => t !== tag) });
  };

  const addKnowledgeEntry = () => {
    const newEntry: CharacterBookEntry = {
      keys: [],
      content: "",
      insertion_order: (character.character_book?.entries.length || 0) + 1,
      enabled: true,
    };
    setCharacter({
      ...character,
      character_book: {
        entries: [...(character.character_book?.entries || []), newEntry],
      },
    });
  };

  const updateKnowledgeEntry = (index: number, field: keyof CharacterBookEntry, value: any) => {
    const entries = [...(character.character_book?.entries || [])];
    entries[index] = { ...entries[index], [field]: value };
    setCharacter({ ...character, character_book: { entries } });
  };

  const removeKnowledgeEntry = (index: number) => {
    const entries = character.character_book?.entries.filter((_, i) => i !== index) || [];
    setCharacter({ ...character, character_book: { entries } });
  };

  const handleSave = () => {
    if (!character.name.trim()) {
      return;
    }
    onSave({
      ...character,
      creation_date: new Date().toISOString(),
      modification_date: new Date().toISOString(),
    });
    setCharacter(defaultCharacter);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl md:max-h-[90vh] bg-card border border-border rounded-2xl shadow-lg z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-electric-cyan flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Create Character</h2>
                  <p className="text-sm text-muted-foreground">Character Card V3 Format</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-3 mb-6">
                  <TabsTrigger value="personality">Personality</TabsTrigger>
                  <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="personality" className="space-y-6">
                  {/* Avatar section */}
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-24 h-24 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center group cursor-pointer hover:border-primary/50 transition-colors">
                        <Camera className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-xs text-muted-foreground">Avatar</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-32 h-24 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center group cursor-pointer hover:border-primary/50 transition-colors">
                        <Image className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-xs text-muted-foreground">Background</span>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name *</label>
                    <Input
                      placeholder="e.g., Alex"
                      value={character.name}
                      onChange={(e) => setCharacter({ ...character, name: e.target.value })}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Background and appearance of your character..."
                      value={character.description}
                      onChange={(e) => setCharacter({ ...character, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  {/* Personality */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Personality</label>
                    <Textarea
                      placeholder="Character traits and behavior patterns..."
                      value={character.personality}
                      onChange={(e) => setCharacter({ ...character, personality: e.target.value })}
                      rows={3}
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tags</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleTagAdd())}
                      />
                      <Button variant="outline" onClick={handleTagAdd}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {character.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                        >
                          {tag}
                          <button onClick={() => handleTagRemove(tag)} className="hover:text-destructive">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* First Message */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Message</label>
                    <Textarea
                      placeholder="The greeting message when a session starts..."
                      value={character.first_mes}
                      onChange={(e) => setCharacter({ ...character, first_mes: e.target.value })}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">Use *actions* and "dialogue" formatting</p>
                  </div>

                  {/* Example Messages */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Example Messages</label>
                    <Textarea
                      placeholder="Example dialogue to guide the AI's tone..."
                      value={character.mes_example}
                      onChange={(e) => setCharacter({ ...character, mes_example: e.target.value })}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">Use {"<START>"}, {"{{user}}"}, {"{{char}}"} syntax</p>
                  </div>
                </TabsContent>

                <TabsContent value="knowledge" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Knowledge Base</h3>
                      <p className="text-sm text-muted-foreground">Add entries for reference info the AI can use</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={addKnowledgeEntry}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Entry
                    </Button>
                  </div>

                  {character.character_book?.entries.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No knowledge entries yet.</p>
                      <p className="text-sm">Add entries for company info, FAQs, or other reference data.</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {character.character_book?.entries.map((entry, index) => (
                      <div key={index} className="bg-surface-elevated rounded-xl p-4 border border-border">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-sm font-medium">Entry #{index + 1}</span>
                          <Button variant="ghost" size="icon-sm" onClick={() => removeKnowledgeEntry(index)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="space-y-3">
                          <Input
                            placeholder="Keywords (comma-separated)..."
                            value={entry.keys.join(", ")}
                            onChange={(e) =>
                              updateKnowledgeEntry(
                                index,
                                "keys",
                                e.target.value.split(",").map((k) => k.trim())
                              )
                            }
                          />
                          <Textarea
                            placeholder="Content..."
                            value={entry.content}
                            onChange={(e) => updateKnowledgeEntry(index, "content", e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-6">
                  {/* System Prompt */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">System Prompt</label>
                    <Textarea
                      placeholder="Core behavioral instructions for the AI..."
                      value={character.system_prompt}
                      onChange={(e) => setCharacter({ ...character, system_prompt: e.target.value })}
                      rows={4}
                    />
                  </div>

                  {/* Post History Instructions */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Post History Instructions</label>
                    <Textarea
                      placeholder="Instructions injected after conversation history..."
                      value={character.post_history_instructions}
                      onChange={(e) => setCharacter({ ...character, post_history_instructions: e.target.value })}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">Use {"{{original}}"} to include default instructions</p>
                  </div>

                  {/* Scenario */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Scenario</label>
                    <Textarea
                      placeholder="The initial scene or context..."
                      value={character.scenario}
                      onChange={(e) => setCharacter({ ...character, scenario: e.target.value })}
                      rows={3}
                    />
                  </div>

                  {/* Creator Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Creator Notes</label>
                    <Textarea
                      placeholder="Internal notes (not shown to AI)..."
                      value={character.creator_notes}
                      onChange={(e) => setCharacter({ ...character, creator_notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-border bg-surface-elevated">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <div className="flex gap-3">
                <Button variant="outline">Import V3 JSON</Button>
                <Button variant="hero" onClick={handleSave} disabled={!character.name.trim()}>
                  Create Character
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
