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
import { joinLobby } from "@/server/functions/lobby";
import { useLobbyStore } from "@/stores/lobby-store";

interface JoinLobbyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinLobbyDialog({ open, onOpenChange }: JoinLobbyDialogProps) {
  const codeId = useId();
  const nameId = useId();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const store = useLobbyStore();

  const handleJoin = async () => {
    if (code.length !== 6) {
      setError("Le code doit faire 6 caractères");
      return;
    }
    if (name.length < 2) {
      setError("Le pseudo doit faire au moins 2 caractères");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await joinLobby({
        data: { code: code.toUpperCase(), playerName: name },
      });
      store.setMyPlayerId(result.player.id);
      store.setLobby(result.lobby);
      onOpenChange(false);
      navigate({ to: "/lobby/$code", params: { code: result.lobby.code } });
    } catch (err: any) {
      setError(err.message ?? "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rejoindre une partie</DialogTitle>
          <DialogDescription>
            Entre le code du lobby et ton pseudo pour rejoindre.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor={codeId}>Code du lobby</Label>
            <Input
              id={codeId}
              placeholder="6 caractères"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="font-mono tracking-widest text-center text-lg"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={nameId}>Pseudo</Label>
            <Input
              id={nameId}
              placeholder="Ton pseudo..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              maxLength={30}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleJoin}
            disabled={loading || code.length !== 6 || name.length < 2}
            className="w-full"
            size="lg"
          >
            {loading ? "Connexion..." : "Rejoindre"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
