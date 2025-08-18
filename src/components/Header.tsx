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
    <header className="bg-white border-b p-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <a href="/" className="text-xl font-bold">Planning Poker</a>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Game ID: {gameId}</span>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
        </div>
      </div>
    </header>
  );
};