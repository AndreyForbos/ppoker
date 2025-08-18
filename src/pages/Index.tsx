import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Swords } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const createNewGame = () => {
    const gameId = Math.random().toString(36).substring(2, 8);
    navigate(`/game/${gameId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="py-4 px-6 border-b bg-white">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Swords className="h-6 w-6 text-primary" />
            Team Poker
          </div>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold">
            Agile Planning, Simplified
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            A real-time planning poker app to make your team's estimations fast,
            fun, and accurate.
          </p>
          <Button size="lg" onClick={createNewGame}>
            Create New Game
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;