import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export type AIProvider = "default" | "groq" | "gemini";

interface UserSettings {
  id: string;
  user_id: string;
  ai_provider: AIProvider;
  groq_api_key: string | null;
  gemini_api_key: string | null;
  created_at: string;
  updated_at: string;
}

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface SettingsContextType {
  settings: UserSettings | null;
  profile: Profile | null;
  isLoading: boolean;
  updateSettings: (updates: Partial<Pick<UserSettings, "ai_provider" | "groq_api_key" | "gemini_api_key">>) => Promise<void>;
  updateProfile: (updates: Partial<Pick<Profile, "display_name" | "avatar_url">>) => Promise<void>;
  getActiveApiKey: () => string | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSettingsAndProfile();
    } else {
      setSettings(null);
      setProfile(null);
      setIsLoading(false);
    }
  }, [user]);

  const fetchSettingsAndProfile = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Fetch settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (settingsError && settingsError.code !== "PGRST116") {
        throw settingsError;
      }

      // If no settings exist, create default
      if (!settingsData) {
        const { data: newSettings, error: createError } = await supabase
          .from("user_settings")
          .insert({
            user_id: user.id,
            ai_provider: "default",
          })
          .select()
          .single();

        if (createError) throw createError;
        setSettings(newSettings as unknown as UserSettings);
      } else {
        setSettings(settingsData as unknown as UserSettings);
      }

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError;
      }

      setProfile(profileData as Profile | null);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (
    updates: Partial<Pick<UserSettings, "ai_provider" | "groq_api_key" | "gemini_api_key">>
  ) => {
    if (!user || !settings) return;

    try {
      const { data, error } = await supabase
        .from("user_settings")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      setSettings(data as unknown as UserSettings);
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProfile = async (
    updates: Partial<Pick<Profile, "display_name" | "avatar_url">>
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data as Profile);
      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getActiveApiKey = (): string | null => {
    if (!settings) return null;

    switch (settings.ai_provider) {
      case "groq":
        return settings.groq_api_key;
      case "gemini":
        return settings.gemini_api_key;
      default:
        return null;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        profile,
        isLoading,
        updateSettings,
        updateProfile,
        getActiveApiKey,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
