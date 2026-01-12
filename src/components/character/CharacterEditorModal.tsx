import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bot, Camera, Image, Plus, Trash2, Sparkles, Upload, Loader2, Wand2, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CharacterV3Data, CharacterBookEntry, Character } from "@/types/character";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useAuth } from "@/hooks/useAuth";
import { sampleCharacterList, getSampleCharacter } from "@/data/sampleCharacters";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CharacterEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (character: CharacterV3Data, avatarUrl?: string, backgroundUrl?: string) => void;
  editingCharacter?: Character | null;
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

export function CharacterEditorModal({ isOpen, onClose, onSave, editingCharacter }: CharacterEditorModalProps) {
  const [character, setCharacter] = useState<CharacterV3Data>(defaultCharacter);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [activeTab, setActiveTab] = useState("personality");
  const [showSamplePicker, setShowSamplePicker] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [showImagePrompt, setShowImagePrompt] = useState<"avatar" | "background" | "both" | null>(null);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { uploadImage, isUploading } = useImageUpload();
  const { generateImage, isGenerating } = useImageGeneration();

  // Load editing character data
  useEffect(() => {
    if (editingCharacter) {
      setCharacter(editingCharacter.v3_data);
      setAvatarUrl(editingCharacter.avatar_url || null);
      setBackgroundUrl(editingCharacter.background_url || null);
    } else {
      setCharacter(defaultCharacter);
      setAvatarUrl(null);
      setBackgroundUrl(null);
    }
  }, [editingCharacter, isOpen]);

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

  const updateKnowledgeEntry = (index: number, field: keyof CharacterBookEntry, value: string[] | string | number | boolean) => {
    const entries = [...(character.character_book?.entries || [])];
    entries[index] = { ...entries[index], [field]: value };
    setCharacter({ ...character, character_book: { entries } });
  };

  const removeKnowledgeEntry = (index: number) => {
    const entries = character.character_book?.entries.filter((_, i) => i !== index) || [];
    setCharacter({ ...character, character_book: { entries } });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    const url = await uploadImage(file, user.id, "avatar");
    if (url) setAvatarUrl(url);
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    const url = await uploadImage(file, user.id, "background");
    if (url) setBackgroundUrl(url);
  };

  const handleGenerateAvatar = async () => {
    if (!user || !imagePrompt.trim()) return;
    const prompt = imagePrompt || `${character.name}, ${character.description}`;
    const url = await generateImage(prompt, "avatar", user.id);
    if (url) {
      setAvatarUrl(url);
      setShowImagePrompt(null);
      setImagePrompt("");
    }
  };

  const handleGenerateBackground = async () => {
    if (!user || !imagePrompt.trim()) return;
    const prompt = imagePrompt || `Background for ${character.name}: ${character.scenario || character.description}`;
    const url = await generateImage(prompt, "background", user.id);
    if (url) {
      setBackgroundUrl(url);
      setShowImagePrompt(null);
      setImagePrompt("");
    }
  };

  const handleGenerateBoth = async () => {
    if (!user || !imagePrompt.trim()) return;
    
    // Generate full scene first
    const sceneUrl = await generateImage(imagePrompt, "full-scene", user.id);
    if (sceneUrl) {
      setBackgroundUrl(sceneUrl);
      // Then generate avatar based on same prompt
      const avatarPromptText = imagePrompt.split(",")[0]; // Use first part for avatar
      const avatarUrlResult = await generateImage(avatarPromptText, "avatar", user.id);
      if (avatarUrlResult) {
        setAvatarUrl(avatarUrlResult);
      }
    }
    setShowImagePrompt(null);
    setImagePrompt("");
  };

  const handleLoadSample = (sampleId: string) => {
    const sample = getSampleCharacter(sampleId as "assistant" | "sales" | "interviewer");
    setCharacter(sample);
    setShowSamplePicker(false);
  };

  const handleImportJSON = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        // Handle Character Card V3 format
        if (data.spec === "chara_card_v3" && data.data) {
          setCharacter(data.data);
        } else if (data.name) {
          // Direct V3Data format
          setCharacter(data);
        }
      } catch {
        console.error("Failed to parse JSON");
      }
    };
    input.click();
  };

  const handleSave = () => {
    if (!character.name.trim()) return;
    
    onSave(
      {
        ...character,
        creation_date: editingCharacter?.v3_data.creation_date || new Date().toISOString(),
        modification_date: new Date().toISOString(),
      },
      avatarUrl || undefined,
      backgroundUrl || undefined
    );
    
    setCharacter(defaultCharacter);
    setAvatarUrl(null);
    setBackgroundUrl(null);
    onClose();
  };

  const isLoading = isUploading || isGenerating;

  return (
    <>
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
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl md:max-h-[90vh] bg-card border border-border rounded-2xl shadow-lg z-50 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-electric-cyan flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      {editingCharacter ? "Edit Character" : "Create Character"}
                    </h2>
                    <p className="text-sm text-muted-foreground">Character Card V3 Format</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowSamplePicker(true)}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Load Sample
                  </Button>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full grid grid-cols-4 mb-6">
                    <TabsTrigger value="personality">Personality</TabsTrigger>
                    <TabsTrigger value="images">Images</TabsTrigger>
                    <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>

                  <TabsContent value="personality" className="space-y-6">
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

                  <TabsContent value="images" className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Avatar Section */}
                      <div className="space-y-4">
                        <h3 className="font-medium">Character Avatar</h3>
                        <div 
                          className="relative aspect-square rounded-2xl bg-surface-elevated border border-border flex items-center justify-center overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => !isLoading && avatarInputRef.current?.click()}
                        >
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                              <Camera className="w-12 h-12" />
                              <span className="text-sm">Click to upload</span>
                            </div>
                          )}
                          {isLoading && (
                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                              <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                          )}
                        </div>
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                        />
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => avatarInputRef.current?.click()}
                            disabled={isLoading}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              setImagePrompt(character.description || character.name);
                              setShowImagePrompt("avatar");
                            }}
                            disabled={isLoading}
                          >
                            <Wand2 className="w-4 h-4 mr-2" />
                            AI Generate
                          </Button>
                        </div>
                      </div>

                      {/* Background Section */}
                      <div className="space-y-4">
                        <h3 className="font-medium">Chat Background</h3>
                        <div 
                          className="relative aspect-video rounded-2xl bg-surface-elevated border border-border flex items-center justify-center overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => !isLoading && backgroundInputRef.current?.click()}
                        >
                          {backgroundUrl ? (
                            <img src={backgroundUrl} alt="Background" className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                              <Image className="w-12 h-12" />
                              <span className="text-sm">Click to upload</span>
                            </div>
                          )}
                          {isLoading && (
                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                              <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                          )}
                        </div>
                        <input
                          ref={backgroundInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleBackgroundUpload}
                        />
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => backgroundInputRef.current?.click()}
                            disabled={isLoading}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              setImagePrompt(character.scenario || character.description || character.name);
                              setShowImagePrompt("background");
                            }}
                            disabled={isLoading}
                          >
                            <Wand2 className="w-4 h-4 mr-2" />
                            AI Generate
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Generate Both Option */}
                    <div className="p-4 rounded-xl bg-surface-elevated border border-border">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-electric-cyan flex items-center justify-center shrink-0">
                          <Sparkles className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">Generate Matching Set</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Generate a full scene with your character, then extract an avatar that matches the background style.
                          </p>
                          <Button 
                            className="mt-3"
                            variant="outline"
                            onClick={() => {
                              setImagePrompt(character.description || character.name);
                              setShowImagePrompt("both");
                            }}
                            disabled={isLoading}
                          >
                            <Wand2 className="w-4 h-4 mr-2" />
                            Generate Avatar + Background
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="knowledge" className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Knowledge Base (Lorebook)</h3>
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
                            <Button variant="ghost" size="icon" onClick={() => removeKnowledgeEntry(index)}>
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
                  <Button variant="outline" onClick={handleImportJSON}>
                    <FileJson className="w-4 h-4 mr-2" />
                    Import V3 JSON
                  </Button>
                  <Button variant="hero" onClick={handleSave} disabled={!character.name.trim() || isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingCharacter ? "Save Changes" : "Create Character"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sample Picker Dialog */}
      <Dialog open={showSamplePicker} onOpenChange={setShowSamplePicker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Load Sample Character</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {sampleCharacterList.map((sample) => (
              <button
                key={sample.id}
                className="w-full p-4 rounded-xl bg-surface-elevated border border-border hover:border-primary/50 transition-colors text-left"
                onClick={() => handleLoadSample(sample.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-electric-cyan flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium">{sample.name}</h4>
                    <p className="text-sm text-muted-foreground">{sample.description}</p>
                    <div className="flex gap-1 mt-1">
                      {sample.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Generation Prompt Dialog */}
      <Dialog open={showImagePrompt !== null} onOpenChange={() => setShowImagePrompt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {showImagePrompt === "avatar" && "Generate Avatar"}
              {showImagePrompt === "background" && "Generate Background"}
              {showImagePrompt === "both" && "Generate Avatar + Background"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Describe the image</label>
              <Textarea
                placeholder={
                  showImagePrompt === "avatar"
                    ? "e.g., A professional woman with short black hair, friendly smile, wearing a blazer..."
                    : showImagePrompt === "background"
                    ? "e.g., Modern office with large windows, city skyline view, warm lighting..."
                    : "e.g., A professional consultant in their modern office, warm lighting, city view..."
                }
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Be specific about appearance, setting, lighting, and style for best results.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowImagePrompt(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (showImagePrompt === "avatar") handleGenerateAvatar();
                  else if (showImagePrompt === "background") handleGenerateBackground();
                  else if (showImagePrompt === "both") handleGenerateBoth();
                }}
                disabled={!imagePrompt.trim() || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
