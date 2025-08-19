import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { showError, showSuccess } from '@/utils/toast';
import { Header } from '@/components/Header';
import { VotingSection } from '@/components/VotingSection';
import { useUser } from '@/hooks/useUser';
import { UserSetup } from '@/components/UserSetup';
import { IssuesDrawer } from '@/components/IssuesDrawer';
import { GameLobby } from '@/components/GameLobby';

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
  const { user, setUserName } = useUser();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchIssues = useCallback(async () => {
    if (!gameId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching issues:', error);
      showError('Could not fetch issues. Check console for details.');
    } else {
      const fetchedIssues = data || [];
      setIssues(fetchedIssues);
      const votingIssue = fetchedIssues.find(i => i.is_voting);
      setCurrentIssue(votingIssue);
    }
    setLoading(false);
  }, [gameId]);

  useEffect(() => {
    if (gameId) {
      fetchIssues();
    }
  }, [gameId, fetchIssues]);

  useEffect(() => {
    if (!gameId) return;

    const handleIssueUpdate = (payload: any) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      setIssues(currentIssues => {
        let newIssues = [...currentIssues];

        if (eventType === 'INSERT') {
          if (!newIssues.some(issue => issue.id === newRecord.id)) {
            newIssues.push(newRecord as Issue);
          }
        } else if (eventType === 'UPDATE') {
          newIssues = newIssues.map(issue =>
            issue.id === newRecord.id ? (newRecord as Issue) : issue
          );
        } else if (eventType === 'DELETE') {
          newIssues = newIssues.filter(issue => issue.id !== oldRecord.id);
        }
        
        newIssues.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        const votingIssue = newIssues.find(i => i.is_voting);
        setCurrentIssue(votingIssue);

        return newIssues;
      });
    };

    const channel = supabase
      .channel(`issues:${gameId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'issues', filter: `game_id=eq.${gameId}` },
        handleIssueUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  useEffect(() => {
    if (!gameId || !user?.id || !user.name) return;
    const channel = supabase.channel(`game:${gameId}`, { config: { presence: { key: user.id } } });
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const newParticipants: Participant[] = Object.keys(presenceState).map(key => ({
          id: key,
          // @ts-ignore
          name: presenceState[key][0].name,
        }));
        setParticipants(newParticipants);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ name: user.name });
        }
      });
    return () => { supabase.removeChannel(channel); };
  }, [gameId, user]);

  useEffect(() => {
    const fetchVotes = async () => {
      if (!currentIssue) {
        setVotes([]);
        return;
      }
      const { data, error } = await supabase
        .from('votes')
        .select('user_id, vote_value')
        .eq('issue_id', currentIssue.id);
      if (error) {
        showError("Could not fetch votes.");
      } else {
        setVotes(data || []);
      }
    };

    fetchVotes();

    if (!currentIssue) return;

    const channel = supabase
      .channel(`votes:${currentIssue.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes', filter: `issue_id=eq.${currentIssue.id}` },
        () => fetchVotes()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentIssue]);

  const handleSetCurrentIssue = async (issueId: number) => {
    if (!gameId || currentIssue?.id === issueId) return;
    
    const { error } = await supabase.rpc('set_voting_issue', {
      _game_id: gameId,
      _issue_id: issueId,
    });

    if (error) {
      console.error('Error setting voting issue:', error);
      showError("Failed to start voting on issue.");
    }
  };

  const handleSetCurrentIssueAndCloseDrawer = (issueId: number) => {
    handleSetCurrentIssue(issueId);
    setIsDrawerOpen(false);
  };

  const handleDeleteIssue = async (issueId: number) => {
    await supabase.from('votes').delete().eq('issue_id', issueId);
    const { error } = await supabase.from('issues').delete().eq('id', issueId);
    if (error) showError('Failed to delete the issue.');
    else showSuccess('Issue deleted successfully.');
  };

  const handleIssueCreated = (newIssue: Issue) => {
    setIssues(currentIssues => {
      if (currentIssues.some(issue => issue.id === newIssue.id)) {
        return currentIssues;
      }
      const newIssues = [...currentIssues, newIssue];
      newIssues.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      return newIssues;
    });
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center"><p>Loading user...</p></div>;
  if (!user.name) return <UserSetup onNameSet={(name) => setUserName(name)} />;
  if (loading && issues.length === 0) return <div className="min-h-screen flex items-center justify-center"><p>Loading game...</p></div>;
  if (!gameId) return <div className="min-h-screen flex items-center justify-center"><p>Game ID is missing.</p></div>;

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground">
      <Header gameId={gameId} onOpenDrawer={() => setIsDrawerOpen(true)} />
      <main className="flex-1 flex flex-col overflow-y-auto">
        {currentIssue ? (
          <VotingSection currentIssue={currentIssue} participants={participants} votes={votes} />
        ) : (
          <GameLobby gameId={gameId} participants={participants} votes={votes} />
        )}
      </main>
      <IssuesDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        gameId={gameId}
        issues={issues}
        loading={loading}
        currentIssueId={currentIssue?.id}
        onSetCurrentIssue={handleSetCurrentIssueAndCloseDrawer}
        onDeleteIssue={handleDeleteIssue}
        onIssueCreated={handleIssueCreated}
      />
    </div>
  );
};

export default Game;