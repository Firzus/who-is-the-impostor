import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Share2, QrCode, Link, Check } from "lucide-react";

interface LobbyShareProps {
  code: string;
}

async function generateQrDataUrl(url: string): Promise<string> {
  const { default: qrcode } = await import("qrcode-generator");
  const qr = qrcode(0, "M");
  qr.addData(url);
  qr.make();
  const svg = qr.createSvgTag({ scalable: true, margin: 0 });
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function LobbyShare({ code }: LobbyShareProps) {
  const [open, setOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const lobbyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/lobby/${code}`
      : `/lobby/${code}`;

  const shareText = `Rejoins ma partie "Qui est l'imposteur" !\nCode : ${code}\n${lobbyUrl}`;

  useEffect(() => {
    if (!open) return;
    void generateQrDataUrl(lobbyUrl).then(setQrDataUrl);
  }, [open, lobbyUrl]);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Qui est l'imposteur", text: shareText });
      } catch { }
    } else {
      setOpen(true);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(lobbyUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleNativeShare}
        title="Partager le lobby"
        aria-label="Partager le lobby"
        className="text-muted-foreground hover:text-[#50C878]"
      >
        <Share2 className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-4 w-4 text-[#50C878]/60" />
              Partager le lobby
            </DialogTitle>
            <DialogDescription>
              Scanne le QR code ou copie le lien pour inviter des joueurs.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR code pour rejoindre le lobby ${code}`}
                className="w-40 h-40 bg-white p-2"
              />
            ) : (
              <div className="w-40 h-40 bg-white/10 flex items-center justify-center">
                <QrCode className="h-8 w-8 animate-pulse text-muted-foreground/40" />
              </div>
            )}

            <div className="w-full space-y-2">
              <div className="flex items-center gap-2 border border-border/40 bg-background/40 px-3 py-2">
                <span className="flex-1 truncate font-mono text-xs text-muted-foreground">
                  {lobbyUrl}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={handleCopyLink}
                  aria-label="Copier le lien"
                >
                  {linkCopied ? (
                    <Check className="h-3.5 w-3.5 text-[#50C878]" />
                  ) : (
                    <Link className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
