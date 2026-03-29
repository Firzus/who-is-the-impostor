import { useId, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createLobby } from "@/server/functions/lobby";
import { useLobbyStore } from "@/stores/lobby-store";

interface CreateLobbyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateLobbyDialog({ open, onOpenChange }: CreateLobbyDialogProps) {
  const nameId = useId();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const store = useLobbyStore();

  const handleCreate = async () => {
    if (name.length < 2) {
      setError("Le pseudo doit faire au moins 2 caractères");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createLobby({ data: { hostName: name } });
      store.setMyPlayerId(result.player.id);
      store.setLobby(result.lobby);
      onOpenChange(false);
      navigate({ to: "/lobby/$code", params: { code: result.lobby.code } });
    } catch (err: any) {
      setError(err.message ?? "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer une partie</DialogTitle>
          <DialogDescription>
            Choisis ton pseudo pour créer un nouveau lobby.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-5">
          <div className="space-y-2">
            <Label htmlFor={nameId}>Pseudo</Label>
            <Input
              id={nameId}
              placeholder="Ton pseudo..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              maxLength={30}
              autoFocus
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleCreate}
            disabled={loading || name.length < 2}
            className="w-full"
            size="lg"
          >
            {loading ? "Création..." : "Créer le lobby"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
