import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { JoinGameDialog } from "@/components/JoinGameDialog";
import { PlayerList } from "@/components/PlayerList";
import { CardDeck } from "@/components/CardDeck";
import { CreateIssueForm } from "@/components/CreateIssueForm";
import { IssueList } from "@/components/IssueList";
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Player, Issue } from "@/types";
import { showError } from "@/utils/toast";

const Game = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [selectedVote, setSelectedVote] = useState<string | null>(null);

  const currentIssue = issues.find((issue) => issue.is_voting);

  const fetchIssues = useCallback(async () => {
    if (!gameId) return;
    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .eq("game_id", gameId)
      .order("created_at", { ascending: true });

    if (error) {
      const errorMessage = `Could not fetch issues: ${error.message}`;
      showError(errorMessage);
      console.error("Supabase fetch error:", error);
    } else {
      setIssues(data);
    }
  }, [gameId]);

  useEffect(() => {
    if (gameId) {
      const issueSubscription = supabase
        .channel(`issues:${gameId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "issues",
            filter: `game_id=eq.${gameId}`,
          },
          () => fetchIssues()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(issueSubscription);
      };
    }
  }, [gameId, fetchIssues]);

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
    fetchIssues();

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
      setSelectedVote(vote);
      await channel.track({ name: playerName, vote });
    }
  };

  const handleLeave = () => {
    if (channel) {
      supabase.removeChannel(channel);
    }
    navigate("/");
  };

  const handleAddIssue = async (title: string) => {
    if (!gameId) return;
    const { error } = await supabase
      .from("issues")
      .insert({ game_id: gameId, title });
    if (error) {
      showError("Failed to add issue.");
      console.error(error);
    }
  };

  const handleStartVoting = async (issueId: number) => {
    const updates = issues.map((issue) => ({
      ...issue,
      is_voting: issue.id === issueId,
      votes_revealed: false,
    }));

    const { error } = await supabase.from("issues").upsert(updates);
    if (error) {
      showError("Failed to start voting.");
    } else if (channel && playerName) {
      setSelectedVote(null);
      await channel.track({ name: playerName, vote: null });
    }
  };

  const handleRevealVotes = async (issueId: number) => {
    const { error } = await supabase
      .from("issues")
      .update({ votes_revealed: true })
      .eq("id", issueId);
    if (error) {
      showError("Failed to reveal votes.");
    }
  };

  const handleResetVoting = async (issueId: number) => {
    const { error } = await supabase
      .from("issues")
      .update({ votes_revealed: false })
      .eq("id", issueId);
    if (error) {
      showError("Failed to reset voting.");
    } else if (channel && playerName) {
      setSelectedVote(null);
      await channel.track({ name: playerName, vote: null });
    }
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
              <h2 className="text-2xl font-bold mb-2 break-all">
                {currentIssue ? currentIssue.title : "No issue selected"}
              </h2>
              <p className="text-gray-500">
                {currentIssue
                  ? "Please select your card to vote."
                  : "Select an issue from the list to start voting."}
              </p>
            </div>
            <div className="mt-8">
              <CardDeck
                onVote={handleVote}
                selectedCard={selectedVote}
                disabled={!currentIssue || currentIssue.votes_revealed}
              />
            </div>
          </div>

          <div className="space-y-8">
            <PlayerList
              players={players}
              votesRevealed={currentIssue?.votes_revealed ?? false}
            />
            <IssueList
              issues={issues}
              players={players}
              onStartVoting={handleStartVoting}
              onRevealVotes={handleRevealVotes}
              onResetVoting={handleResetVoting}
            />
            <div className="p-4 border rounded-lg bg-white">
              <h3 className="font-bold mb-2">Add New Issue</h3>
              <CreateIssueForm onAddIssue={handleAddIssue} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Game;