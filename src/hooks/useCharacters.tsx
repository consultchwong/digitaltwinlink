import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { CharacterV3Data } from "@/types/character";

export interface DbCharacter {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string | null;
  background_url: string | null;
  v3_data: CharacterV3Data;
  created_at: string;
  updated_at: string;
}

export function useCharacters() {
  const { user } = useAuth();
  const [characters, setCharacters] = useState<DbCharacter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCharacters = async () => {
    if (!user) {
      setCharacters([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform the data to ensure v3_data is properly typed
      const transformedData: DbCharacter[] = (data || []).map((char) => ({
        ...char,
        v3_data: char.v3_data as unknown as CharacterV3Data,
      }));

      setCharacters(transformedData);
    } catch (error) {
      console.error("Error fetching characters:", error);
      toast.error("Failed to load characters");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, [user]);

  const createCharacter = async (
    name: string,
    v3Data: CharacterV3Data,
    avatarUrl?: string,
    backgroundUrl?: string
  ) => {
    if (!user) {
      toast.error("Please sign in to create characters");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("characters")
        .insert({
          user_id: user.id,
          name,
          v3_data: v3Data,
          avatar_url: avatarUrl,
          background_url: backgroundUrl,
        })
        .select()
        .single();

      if (error) throw error;

      const newCharacter: DbCharacter = {
        ...data,
        v3_data: data.v3_data as unknown as CharacterV3Data,
      };

      setCharacters((prev) => [newCharacter, ...prev]);
      toast.success("Character created!");
      return newCharacter;
    } catch (error) {
      console.error("Error creating character:", error);
      toast.error("Failed to create character");
      return null;
    }
  };

  const updateCharacter = async (
    id: string,
    updates: Partial<{
      name: string;
      v3_data: CharacterV3Data;
      avatar_url: string;
      background_url: string;
    }>
  ) => {
    try {
      const updatePayload: Record<string, unknown> = { ...updates };
      if (updates.v3_data) {
        updatePayload.v3_data = updates.v3_data as unknown as Record<string, unknown>;
      }

      const { data, error } = await supabase
        .from("characters")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      const updatedCharacter: DbCharacter = {
        ...data,
        v3_data: data.v3_data as unknown as CharacterV3Data,
      };

      setCharacters((prev) =>
        prev.map((c) => (c.id === id ? updatedCharacter : c))
      );
      toast.success("Character updated!");
      return updatedCharacter;
    } catch (error) {
      console.error("Error updating character:", error);
      toast.error("Failed to update character");
      return null;
    }
  };

  const deleteCharacter = async (id: string) => {
    try {
      const { error } = await supabase.from("characters").delete().eq("id", id);

      if (error) throw error;

      setCharacters((prev) => prev.filter((c) => c.id !== id));
      toast.success("Character deleted");
    } catch (error) {
      console.error("Error deleting character:", error);
      toast.error("Failed to delete character");
    }
  };

  return {
    characters,
    isLoading,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    refetch: fetchCharacters,
  };
}
