import { Button } from "@/components/ui/button";

interface HeaderProps {
  gameId: string;
}

export const Header = ({ gameId }: HeaderProps) => {
  return (
    <header className="bg-card border-b border-border p-3 flex-shrink-0">
      <div className="w-full mx-auto flex justify-between items-center px-4">
        <a href="/" className="text-xl font-bold">Planning Poker</a>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden md:inline">Game ID: {gameId}</span>
        </div>
      </div>
    </header>
  );
};