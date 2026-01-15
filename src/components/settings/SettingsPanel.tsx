import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Bot, Key, Eye, EyeOff, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings, AIProvider } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";

interface SettingsPanelProps {
  onBack?: () => void;
}

export function SettingsPanel({ onBack }: SettingsPanelProps) {
  const { settings, profile, isLoading, updateSettings, updateProfile } = useSettings();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState("ai");
  const [isSaving, setIsSaving] = useState(false);
  
  // AI Settings
  const [aiProvider, setAiProvider] = useState<AIProvider>("default");
  const [groqApiKey, setGroqApiKey] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  
  // Profile Settings
  const [displayName, setDisplayName] = useState("");
  
  useEffect(() => {
    if (settings) {
      setAiProvider(settings.ai_provider as AIProvider);
      setGroqApiKey(settings.groq_api_key || "");
      setGeminiApiKey(settings.gemini_api_key || "");
    }
  }, [settings]);
  
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
    }
  }, [profile]);

  const handleSaveAISettings = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        ai_provider: aiProvider,
        groq_api_key: groqApiKey || null,
        gemini_api_key: geminiApiKey || null,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        display_name: displayName || null,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const providerOptions = [
    {
      value: "default",
      label: "Default (Lovable AI)",
      description: "Use the built-in AI powered by Gemini. No API key required.",
      icon: "✨",
    },
    {
      value: "groq",
      label: "Groq",
      description: "Fast inference with Llama models. Requires API key.",
      icon: "⚡",
    },
    {
      value: "gemini",
      label: "Google Gemini",
      description: "Google's advanced AI. Requires API key.",
      icon: "🔮",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ai" className="gap-2">
                <Bot className="w-4 h-4" />
                AI Provider
              </TabsTrigger>
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
            </TabsList>

            {/* AI Provider Tab */}
            <TabsContent value="ai" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    AI Provider
                  </CardTitle>
                  <CardDescription>
                    Choose which AI provider to use for chat responses. You can use the default or bring your own API key.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup
                    value={aiProvider}
                    onValueChange={(value) => setAiProvider(value as AIProvider)}
                    className="space-y-3"
                  >
                    {providerOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                          aiProvider === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{option.icon}</span>
                            <span className="font-medium">{option.label}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {option.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>

                  {/* API Key Inputs */}
                  {aiProvider !== "default" && (
                    <>
                      <Separator />
                      
                      {aiProvider === "groq" && (
                        <div className="space-y-3">
                          <Label htmlFor="groq-key" className="flex items-center gap-2">
                            <Key className="w-4 h-4" />
                            Groq API Key
                          </Label>
                          <div className="relative">
                            <Input
                              id="groq-key"
                              type={showGroqKey ? "text" : "password"}
                              value={groqApiKey}
                              onChange={(e) => setGroqApiKey(e.target.value)}
                              placeholder="gsk_..."
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full"
                              onClick={() => setShowGroqKey(!showGroqKey)}
                            >
                              {showGroqKey ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Get your API key from{" "}
                            <a
                              href="https://console.groq.com/keys"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              console.groq.com
                            </a>
                          </p>
                        </div>
                      )}

                      {aiProvider === "gemini" && (
                        <div className="space-y-3">
                          <Label htmlFor="gemini-key" className="flex items-center gap-2">
                            <Key className="w-4 h-4" />
                            Google Gemini API Key
                          </Label>
                          <div className="relative">
                            <Input
                              id="gemini-key"
                              type={showGeminiKey ? "text" : "password"}
                              value={geminiApiKey}
                              onChange={(e) => setGeminiApiKey(e.target.value)}
                              placeholder="AIza..."
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full"
                              onClick={() => setShowGeminiKey(!showGeminiKey)}
                            >
                              {showGeminiKey ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Get your API key from{" "}
                            <a
                              href="https://aistudio.google.com/apikey"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              aistudio.google.com
                            </a>
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  <Button
                    onClick={handleSaveAISettings}
                    disabled={isSaving}
                    className="w-full"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save AI Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Manage your account information and display preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input
                      id="display-name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="w-full"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Profile
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
