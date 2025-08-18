import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  const navigate = useNavigate();

  const handleStartNewGame = () => {
    const gameId = uuidv4();
    navigate(`/game/${gameId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Agile Planning, Simplified.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Collaborate with your team in real-time to estimate tasks with our
            intuitive Planning Poker platform.
          </p>
          <Button size="lg" onClick={handleStartNewGame}>
            Start New Game
          </Button>
        </div>
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default Index;