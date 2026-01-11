import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { Mission } from "@/types/character";

export interface DbSession {
  id: string;
  character_id: string;
  sender_id: string | null;
  link_token: string;
  mission: Mission;
  status: "active" | "completed" | "expired";
  created_at: string;
  completed_at: string | null;
}

export function useSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<DbSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = async () => {
    if (!user) {
      setSessions([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformedData: DbSession[] = (data || []).map((session) => ({
        ...session,
        mission: session.mission as unknown as Mission,
        status: session.status as "active" | "completed" | "expired",
      }));

      setSessions(transformedData);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const createSession = async (characterId: string, mission: Mission) => {
    if (!user) {
      toast.error("Please sign in to create sessions");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("sessions")
        .insert({
          character_id: characterId,
          sender_id: user.id,
          mission: mission,
        })
        .select()
        .single();

      if (error) throw error;

      const newSession: DbSession = {
        ...data,
        mission: data.mission as unknown as Mission,
        status: data.status as "active" | "completed" | "expired",
      };

      setSessions((prev) => [newSession, ...prev]);
      toast.success("Session created! Link copied to clipboard.");
      
      // Copy link to clipboard
      const link = `${window.location.origin}/s/${data.link_token}`;
      navigator.clipboard.writeText(link);
      
      return newSession;
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Failed to create session");
      return null;
    }
  };

  const getSessionByToken = async (token: string) => {
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("link_token", token)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        mission: data.mission as unknown as Mission,
        status: data.status as "active" | "completed" | "expired",
      } as DbSession;
    } catch (error) {
      console.error("Error fetching session:", error);
      return null;
    }
  };

  const updateSessionStatus = async (
    id: string,
    status: "active" | "completed" | "expired"
  ) => {
    try {
      const updateData: Record<string, unknown> = { status };
      if (status === "completed") {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("sessions")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      const updatedSession: DbSession = {
        ...data,
        mission: data.mission as unknown as Mission,
        status: data.status as "active" | "completed" | "expired",
      };

      setSessions((prev) =>
        prev.map((s) => (s.id === id ? updatedSession : s))
      );
      return updatedSession;
    } catch (error) {
      console.error("Error updating session:", error);
      toast.error("Failed to update session");
      return null;
    }
  };

  return {
    sessions,
    isLoading,
    createSession,
    getSessionByToken,
    updateSessionStatus,
    refetch: fetchSessions,
  };
}
