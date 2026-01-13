import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DbCharacter, useCharacters } from "@/hooks/useCharacters";
import { CharacterEditorModal } from "@/components/character/CharacterEditorModal";
import { CharacterV3Data, Character } from "@/types/character";

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: DbCharacter[];
  onDeleteCharacter?: (id: string) => void;
  onSelectForMission?: (character: DbCharacter) => void;
}

export function CharacterModal({
  isOpen,
  onClose,
  characters,
  onDeleteCharacter,
  onSelectForMission,
}: CharacterModalProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<DbCharacter | null>(null);
  const { createCharacter, updateCharacter } = useCharacters();

  const handleOpenEditor = (character?: DbCharacter) => {
    setEditingCharacter(character || null);
    setIsEditorOpen(true);
  };

  const handleSaveCharacter = async (
    v3Data: CharacterV3Data,
    avatarUrl?: string,
    backgroundUrl?: string
  ) => {
    if (editingCharacter) {
      await updateCharacter(editingCharacter.id, {
        name: v3Data.name,
        v3_data: v3Data,
        avatar_url: avatarUrl,
        background_url: backgroundUrl,
      });
    } else {
      await createCharacter(v3Data.name, v3Data, avatarUrl, backgroundUrl);
    }
    setIsEditorOpen(false);
    setEditingCharacter(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Your Characters
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <Button
              onClick={() => handleOpenEditor()}
              className="w-full mb-4"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Character
            </Button>

            <ScrollArea className="h-[300px]">
              {characters.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No characters yet</p>
                  <p className="text-sm">Create your first AI character to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {characters.map((character) => (
                    <motion.div
                      key={character.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={character.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {character.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {character.name}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {character.v3_data.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onSelectForMission && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onSelectForMission(character)}
                          >
                            Select
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenEditor(character)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {onDeleteCharacter && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onDeleteCharacter(character.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <CharacterEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingCharacter(null);
        }}
        onSave={handleSaveCharacter}
        editingCharacter={editingCharacter ? {
          id: editingCharacter.id,
          name: editingCharacter.name,
          avatar_url: editingCharacter.avatar_url || undefined,
          background_url: editingCharacter.background_url || undefined,
          v3_data: editingCharacter.v3_data,
          created_at: editingCharacter.created_at,
          updated_at: editingCharacter.updated_at,
        } : null}
      />
    </>
  );
}
