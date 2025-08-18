import { useState } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { JoinGameDialog } from "@/components/JoinGameDialog";

const Game = () => {
  const { gameId } = useParams();
  const [playerName, setPlayerName] = useState<string | null>(null);

  const handleJoin = (name: string) => {
    setPlayerName(name);
    // In the future, we'll notify other players that a new user has joined.
  };

  if (!playerName) {
    return <JoinGameDialog open={true} onJoin={handleJoin} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Game Room</h1>
            <p className="text-gray-600">
              Session ID:{" "}
              <span className="font-mono bg-gray-200 p-1 rounded text-sm">
                {gameId}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Welcome</p>
            <p className="font-bold text-lg">{playerName}</p>
          </div>
        </div>

        <div className="mt-8 p-8 border-2 border-dashed rounded-lg text-center">
          <p className="text-gray-500">
            Game interface will be built here.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Game;