import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { showError, showSuccess } from '@/utils/toast';
import { Header } from '@/components/Header';
import { VotingSection } from '@/components/VotingSection';
import { useUser } from '@/context/UserContext';
import { UserSetup } from '@/components/UserSetup';
import { IssuesDrawer } from '@/components/IssuesDrawer';
import { GameLobby } from '@/components/GameLobby';
import { GameSidebar } from '@/components/GameSidebar';

export interface Issue {
  id: number;
  title: string;
  game_id: string;
  is_voting: boolean;
  votes_revealed: boolean;
  final_vote: string | null;
  created_at: string;
}

export interface Participant {
  id: string;
  name: string;
}

export interface Vote {
  user_id: string;
  vote_value: string;
}

const Game = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIssue, setCurrentIssue] = useState<Issue | undefined>(undefined);
  const { user, setUserName, loading: userLoading } = useUser();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchIssues = useCallback(async () => {
    if (!gameId) return;
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error polling issues:', error);
    } else {
      const fetchedIssues = data || [];
      setIssues(fetchedIssues);
      const votingIssue = fetchedIssues.find(i => i.is_voting);
      setCurrentIssue(votingIssue);
    }
  }, [gameId]);

  const fetchVotes = useCallback(async () => {
    if (!currentIssue) {
      setVotes([]);
      return;
    }
    const { data, error } = await supabase
      .from('votes')
      .select('user_id, vote_value')
      .eq('issue_id', currentIssue.id);
    if (error) {
      console.error("Error polling votes:", error);
    } else {
      setVotes(data || []);
    }
  }, [currentIssue]);

  // Initial data fetch
  useEffect(() => {
    if (gameId) {
      setLoading(true);
      fetchIssues().finally(() => setLoading(false));
    }
  }, [gameId, fetchIssues]);

  // Polling for game state changes
  useEffect(() => {
    if (!gameId) return;
    const issueInterval = setInterval(fetchIssues, 3000);
    const voteInterval = setInterval(fetchVotes, 3000);

    return () => {
      clearInterval(issueInterval);
      clearInterval(voteInterval);
    };
  }, [gameId, fetchIssues, fetchVotes]);

  // Real-time presence for participants list
  useEffect(() => {
    if (!gameId || !user?.id || !user.name) return;
    const channel = supabase.channel(`game:${gameId}`, { config: { presence: { key: user.id } } });
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const newParticipants: Participant[] = Object.keys(presenceState).map(key => {
          const presences = presenceState[key] as { name: string }[];
          return {
            id: key,
            name: presences[0].name,
          };
        });
        setParticipants(newParticipants);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ name: user.name });
        }
      });
    return () => { supabase.removeChannel(channel); };
  }, [gameId, user]);

  const handleSetCurrentIssue = async (issueId: number) => {
    if (!gameId) return;
    const { error } = await supabase.rpc('set_voting_issue', {
      _game_id: gameId,
      _issue_id: issueId,
    });
    if (error) {
      console.error('Error setting voting issue:', error);
      showError("Failed to start voting on issue.");
    } else {
      fetchIssues(); // Fetch immediately for faster UI response
    }
  };

  const handleSetCurrentIssueAndCloseDrawer = (issueId: number) => {
    handleSetCurrentIssue(issueId);
    setIsDrawerOpen(false);
  };

  const handleDeleteIssue = async (issueId: number) => {
    const { error: votesError } = await supabase.from('votes').delete().eq('issue_id', issueId);
    if (votesError) {
      showError('Failed to clear votes for the issue.');
      console.error('Error deleting votes:', votesError);
      return;
    }
    const { error: issueError } = await supabase.from('issues').delete().eq('id', issueId);
    if (issueError) {
      showError('Failed to delete the issue.');
      console.error('Error deleting issue:', issueError);
    } else {
      showSuccess('Issue deleted successfully.');
      fetchIssues(); // Fetch immediately for faster UI response
    }
  };

  const handleSessionCleared = async () => {
    await fetchIssues();
    setIsDrawerOpen(false);
  };

  if (userLoading) return <div className="min-h-screen flex items-center justify-center"><p>Loading user...</p></div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center"><p>Could not load user profile.</p></div>;
  if (!user.name) return <UserSetup onNameSet={(name) => setUserName(name)} />;
  if (loading && issues.length === 0) return <div className="min-h-screen flex items-center justify-center"><p>Loading game...</p></div>;
  if (!gameId) return <div className="min-h-screen flex items-center justify-center"><p>Game ID is missing.</p></div>;

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground">
      <Header gameId={gameId} onOpenDrawer={() => setIsDrawerOpen(true)} />
      <div className="flex-1 flex overflow-hidden">
        <GameSidebar
          gameId={gameId}
          issues={issues}
          loading={loading}
          currentIssueId={currentIssue?.id}
          onSetCurrentIssue={handleSetCurrentIssue}
          onDeleteIssue={handleDeleteIssue}
          onSessionCleared={handleSessionCleared}
        />
        <main className="flex-1 flex flex-col overflow-y-auto">
          {currentIssue ? (
            <VotingSection 
              currentIssue={currentIssue} 
              participants={participants} 
              votes={votes}
              onStateChange={fetchIssues}
            />
          ) : (
            <GameLobby gameId={gameId} participants={participants} votes={votes} issues={issues} />
          )}
        </main>
      </div>
      <IssuesDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        gameId={gameId}
        issues={issues}
        loading={loading}
        currentIssueId={currentIssue?.id}
        onSetCurrentIssue={handleSetCurrentIssueAndCloseDrawer}
        onDeleteIssue={handleDeleteIssue}
        onSessionCleared={handleSessionCleared}
      />
    </div>
  );
};

export default Game;