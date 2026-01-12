import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateImage = async (
    prompt: string,
    type: "avatar" | "background" | "full-scene"
  ): Promise<string | null> => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-character-image", {
        body: { prompt, type },
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Image generated",
        description: `Your ${type} image has been created!`,
      });

      return data.url;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to generate image";
      toast({
        title: "Generation failed",
        description: message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateImage, isGenerating };
}
