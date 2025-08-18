import { useState } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { JoinGameDialog } from "@/components/JoinGameDialog";
import { PlayerList } from "@/components/PlayerList";
import { CardDeck } from "@/components/CardDeck";

const Game = () => {
  const { gameId } = useParams();
  const [playerName, setPlayerName] = useState<string | null>(null);
  // Mock player list for now
  const [players, setPlayers] = useState<{ name: string }[]>([]);

  const handleJoin = (name: string) => {
    setPlayerName(name);
    setPlayers([{ name }]); // Add the current player to the list
    // In the future, we'll get the full player list from the server.
  };

  if (!playerName) {
    return <JoinGameDialog open={true} onJoin={handleJoin} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header playerName={playerName} />
      <main className="flex-grow container mx-auto p-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 flex flex-col justify-between">
            <div className="text-center p-8 border-2 border-dashed rounded-lg h-full flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-2">Pick your cards!</h2>
              <p className="text-gray-500">
                The current issue will be displayed here.
              </p>
            </div>
            <div className="mt-8">
              <CardDeck />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <PlayerList players={players} />
            {/* Placeholder for Issues List */}
            <div className="p-4 border rounded-lg bg-white">
              <h3 className="font-bold mb-2">Issues</h3>
              <p className="text-sm text-gray-500">
                Issues list will be here.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Game;