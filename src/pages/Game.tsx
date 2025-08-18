import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";

const Game = () => {
  const { gameId } = useParams();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto p-4">
        <h1 className="text-2xl font-bold">Game Room</h1>
        <p className="text-gray-600 mt-2">
          Welcome to game session:{" "}
          <span className="font-mono bg-gray-200 p-1 rounded">{gameId}</span>
        </p>
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