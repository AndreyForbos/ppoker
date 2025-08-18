import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { showSuccess } from "@/utils/toast";

interface HeaderProps {
  gameId: string;
}

export const Header = ({ gameId }: HeaderProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    showSuccess("Game link copied to clipboard!");
  };

  return (
    <header className="bg-card border-b border-border p-3 flex-shrink-0">
      <div className="w-full mx-auto flex justify-between items-center px-4">
        <a href="/" className="text-xl font-bold">Planning Poker</a>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden md:inline">Game ID: {gameId}</span>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Copy Link</span>
          </Button>
        </div>
      </div>
    </header>
  );
};