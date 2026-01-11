import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { Character, Mission, CharacterV3Data } from "@/types/character";
import { Loader2 } from "lucide-react";

const SessionPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<{
    id: string;
    character: Character;
    mission: Mission;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      if (!token) {
        setError("Invalid session link");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch session with character
        const { data: sessionData, error: sessionError } = await supabase
          .from("sessions")
          .select("*, characters(*)")
          .eq("link_token", token)
          .maybeSingle();

        if (sessionError) throw sessionError;

        if (!sessionData) {
          setError("Session not found");
          setIsLoading(false);
          return;
        }

        if (sessionData.status === "expired") {
          setError("This session has expired");
          setIsLoading(false);
          return;
        }

        const characterData = sessionData.characters as Record<string, unknown>;
        
        const character: Character = {
          id: characterData.id as string,
          user_id: characterData.user_id as string,
          name: characterData.name as string,
          avatar_url: characterData.avatar_url as string | undefined,
          background_url: characterData.background_url as string | undefined,
          v3_data: characterData.v3_data as unknown as CharacterV3Data,
          created_at: characterData.created_at as string,
          updated_at: characterData.updated_at as string,
        };

        setSession({
          id: sessionData.id,
          character,
          mission: sessionData.mission as unknown as Mission,
        });
      } catch (err) {
        console.error("Error fetching session:", err);
        setError("Failed to load session");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">😕</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Session Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error || "This session link is invalid or has expired."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="text-primary hover:underline"
          >
            Go to homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <ChatInterface
      character={session.character}
      mission={session.mission}
      sessionId={session.id}
    />
  );
};

export default SessionPage;
