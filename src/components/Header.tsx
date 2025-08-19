import { Button } from "@/components/ui/button";
import { List } from 'lucide-react';

interface HeaderProps {
  gameId: string;
  onOpenDrawer: () => void;
}

export const Header = ({ gameId, onOpenDrawer }: HeaderProps) => {
  return (
    <header className="bg-card border-b border-border p-3 flex-shrink-0">
      <div className="w-full mx-auto flex justify-between items-center px-4">
        <a href="/" className="text-xl font-bold">Planning Poker</a>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden md:inline">Game ID: {gameId}</span>
          <Button variant="outline" size="icon" onClick={onOpenDrawer}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};