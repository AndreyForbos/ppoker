import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { JoinGameDialog } from "@/components/JoinGameDialog";
import { PlayerList } from "@/components/PlayerList";
import { CardDeck } from "@/components/CardDeck";
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Player } from "@/types";
import { showError } from "@/utils/toast";

const Game = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [channel]);

  const handleJoin = (name: string) => {
    if (!gameId) {
      showError("Invalid game ID.");
      return;
    }

    setPlayerName(name);

    const newChannel = supabase.channel(`game:${gameId}`, {
      config: {
        presence: {
          key: `${name}-${Math.random().toString(36).substring(2, 9)}`,
        },
      },
    });

    newChannel
      .on("presence", { event: "sync" }, () => {
        const newState = newChannel.presenceState<{
          name: string;
          vote: string | null;
        }>();
        const playersArray: Player[] = Object.keys(newState).map((id) => {
          const presence = newState[id][0];
          return {
            id: id,
            name: presence.name,
            vote: presence.vote,
          };
        });
        setPlayers(playersArray);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await newChannel.track({ name, vote: null });
        } else if (status === "CHANNEL_ERROR") {
          showError("Could not connect to the game room. Please try again.");
        }
      });

    setChannel(newChannel);
  };

  const handleVote = async (vote: string) => {
    if (channel && playerName) {
      await channel.track({ name: playerName, vote });
    }
  };

  const handleLeave = () => {
    if (channel) {
      supabase.removeChannel(channel);
    }
    setPlayerName(null);
    setPlayers([]);
    setChannel(null);
  };

  if (!playerName) {
    return <JoinGameDialog open={true} onJoin={handleJoin} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header playerName={playerName} onLeave={handleLeave} />
      <main className="flex-grow container mx-auto p-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 flex flex-col justify-between">
            <div className="text-center p-8 border-2 border-dashed rounded-lg h-full flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-2">Pick your cards!</h2>
              <p className="text-gray-500">
                The current issue will be displayed here.
              </p>
            </div>
            <div className="mt-8">
              <CardDeck onVote={handleVote} />
            </div>
          </div>

          <div className="space-y-8">
            <PlayerList players={players} />
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