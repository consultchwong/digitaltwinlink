import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Bot, Camera, Upload, Wand2, Loader2, Plus, X, Sparkles, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CharacterV3Data, CharacterBookEntry, Character } from "@/types/character";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useAuth } from "@/hooks/useAuth";
import { sampleCharacterList, getSampleCharacter } from "@/data/sampleCharacters";
import { DbCharacter } from "@/hooks/useCharacters";

interface CharacterEditorProps {
  editingCharacter?: DbCharacter | null;
  onSave: (v3Data: CharacterV3Data, avatarUrl?: string, backgroundUrl?: string) => void;
  onCancel: () => void;
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

export function CharacterEditor({ editingCharacter, onSave, onCancel }: CharacterEditorProps) {
  const [character, setCharacter] = useState<CharacterV3Data>(defaultCharacter);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [imagePrompt, setImagePrompt] = useState("");
  const [showImagePrompt, setShowImagePrompt] = useState<"avatar" | "background" | null>(null);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { uploadImage, isUploading } = useImageUpload();
  const { generateImage, isGenerating } = useImageGeneration();

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
  }, [editingCharacter]);

  const handleTagAdd = () => {
    if (tagInput.trim() && !character.tags.includes(tagInput.trim())) {
      setCharacter({ ...character, tags: [...character.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleTagRemove = (tag: string) => {
    setCharacter({ ...character, tags: character.tags.filter((t) => t !== tag) });
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
    const url = await generateImage(imagePrompt, "avatar");
    if (url) {
      setAvatarUrl(url);
      setShowImagePrompt(null);
      setImagePrompt("");
    }
  };

  const handleGenerateBackground = async () => {
    if (!user || !imagePrompt.trim()) return;
    const url = await generateImage(imagePrompt, "background");
    if (url) {
      setBackgroundUrl(url);
      setShowImagePrompt(null);
      setImagePrompt("");
    }
  };

  const handleLoadSample = (sampleId: string) => {
    const sample = getSampleCharacter(sampleId as "assistant" | "sales" | "interviewer");
    setCharacter(sample);
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
        if (data.spec === "chara_card_v3" && data.data) {
          setCharacter(data.data);
        } else if (data.name) {
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
  };

  const isLoading = isUploading || isGenerating;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-electric-cyan flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">
              {editingCharacter ? "Edit Character" : "Create Character"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleImportJSON}>
            <FileJson className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!character.name.trim() || isLoading}
            size="sm"
          >
            {editingCharacter ? "Update" : "Create"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
          {/* Quick Start Templates */}
          {!editingCharacter && (
            <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm font-medium mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Quick Start with a Template
              </p>
              <div className="flex flex-wrap gap-2">
                {sampleCharacterList.map((sample) => (
                  <Button
                    key={sample.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleLoadSample(sample.id)}
                  >
                    {sample.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3 mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="personality">Personality</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Character Name *</label>
                <Input
                  placeholder="e.g., Alex the Assistant"
                  value={character.name}
                  onChange={(e) => setCharacter({ ...character, name: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Brief background about your character..."
                  value={character.description}
                  onChange={(e) => setCharacter({ ...character, description: e.target.value })}
                  rows={3}
                />
              </div>

              {/* First Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Opening Message</label>
                <Textarea
                  placeholder="The greeting when a chat starts..."
                  value={character.first_mes}
                  onChange={(e) => setCharacter({ ...character, first_mes: e.target.value })}
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
                {character.tags.length > 0 && (
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
                )}
              </div>
            </TabsContent>

            <TabsContent value="personality" className="space-y-6">
              {/* Personality */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Personality Traits</label>
                <Textarea
                  placeholder="Character traits and behavior patterns..."
                  value={character.personality}
                  onChange={(e) => setCharacter({ ...character, personality: e.target.value })}
                  rows={4}
                />
              </div>

              {/* Scenario */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Scenario Context</label>
                <Textarea
                  placeholder="The context or situation for conversations..."
                  value={character.scenario}
                  onChange={(e) => setCharacter({ ...character, scenario: e.target.value })}
                  rows={3}
                />
              </div>

              {/* System Prompt */}
              <div className="space-y-2">
                <label className="text-sm font-medium">System Prompt (Advanced)</label>
                <Textarea
                  placeholder="Custom instructions for the AI model..."
                  value={character.system_prompt}
                  onChange={(e) => setCharacter({ ...character, system_prompt: e.target.value })}
                  rows={4}
                />
              </div>
            </TabsContent>

            <TabsContent value="images" className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Avatar */}
                <div className="space-y-4">
                  <h3 className="font-medium">Avatar</h3>
                  <div 
                    className="relative aspect-square rounded-xl bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => !isLoading && avatarInputRef.current?.click()}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Camera className="w-10 h-10" />
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
                  {showImagePrompt === "avatar" ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Describe the avatar..."
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleGenerateAvatar} disabled={isLoading || !imagePrompt}>
                          Generate
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowImagePrompt(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={isLoading}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        Upload
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setImagePrompt(character.description || character.name);
                          setShowImagePrompt("avatar");
                        }}
                        disabled={isLoading}
                      >
                        <Wand2 className="w-4 h-4 mr-1" />
                        AI
                      </Button>
                    </div>
                  )}
                </div>

                {/* Background */}
                <div className="space-y-4">
                  <h3 className="font-medium">Background</h3>
                  <div 
                    className="relative aspect-video rounded-xl bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => !isLoading && backgroundInputRef.current?.click()}
                  >
                    {backgroundUrl ? (
                      <img src={backgroundUrl} alt="Background" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Camera className="w-10 h-10" />
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
                  {showImagePrompt === "background" ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Describe the background..."
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleGenerateBackground} disabled={isLoading || !imagePrompt}>
                          Generate
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowImagePrompt(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => backgroundInputRef.current?.click()}
                        disabled={isLoading}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        Upload
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setImagePrompt(character.scenario || character.description || character.name);
                          setShowImagePrompt("background");
                        }}
                        disabled={isLoading}
                      >
                        <Wand2 className="w-4 h-4 mr-1" />
                        AI
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}
