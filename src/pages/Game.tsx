import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { showError } from '@/utils/toast';
import { CreateIssueForm } from '@/components/CreateIssueForm';
import { IssueList } from '@/components/IssueList';
import { Header } from '@/components/Header';
import { VotingSection } from '@/components/VotingSection';
import { SessionControls } from '@/components/SessionControls';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/hooks/useUser';
import { UserSetup } from '@/components/UserSetup';

export interface Issue {
  id: number;
  title: string;
  game_id: string;
  is_voting: boolean;
  votes_revealed: boolean;
}

export interface Participant {
  id: string;
  name: string;
}

const Game = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIssue, setCurrentIssue] = useState<Issue | undefined>(undefined);
  const { user, setUserName } = useUser();
  const [participants, setParticipants] = useState<Participant[]>([]);

  const fetchIssues = async () => {
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
      setCurrentIssue(fetchedIssues.find(i => i.is_voting));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!gameId) return;

    fetchIssues();

    const channel = supabase
      .channel(`issues:${gameId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'issues', filter: `game_id=eq.${gameId}` },
        () => {
          fetchIssues();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  useEffect(() => {
    if (!gameId || !user?.id || !user.name) return;

    const channel = supabase.channel(`game:${gameId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const newParticipants: Participant[] = [];
        for (const key in presenceState) {
          // @ts-ignore
          const presences = presenceState[key] as { name: string }[];
          newParticipants.push({ id: key, name: presences[0].name });
        }
        setParticipants(newParticipants);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ name: user.name });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, user]);

  const handleSetCurrentIssue = async (issueId: number) => {
    if (!gameId || currentIssue?.id === issueId) return;

    const { error: clearError } = await supabase
      .from('issues')
      .update({ is_voting: false })
      .eq('game_id', gameId);

    if (clearError) {
      showError("Failed to switch voting issue.");
      return;
    }

    const { error: deleteVotesError } = await supabase
      .from('votes')
      .delete()
      .eq('issue_id', issueId);

    if (deleteVotesError) {
        showError("Failed to clear previous votes for the new voting round.");
        return;
    }

    const { error: setError } = await supabase
      .from('issues')
      .update({ is_voting: true, votes_revealed: false })
      .eq('id', issueId);
    
    if (setError) {
      showError("Failed to start voting on issue.");
    }
  };

  const handleNameSet = (name: string) => {
    setUserName(name);
  };

  if (!user) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p>Loading user...</p>
        </div>
    )
  }

  if (!user.name) {
    return <UserSetup onNameSet={handleNameSet} />;
  }

  if (loading && issues.length === 0) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p>Loading game...</p>
        </div>
    )
  }

  if (!gameId) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p>Game ID is missing.</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header gameId={gameId} />
      <main className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="space-y-8">
          <VotingSection currentIssue={currentIssue} participants={participants} />
          <CreateIssueForm gameId={gameId} />
          <IssueList 
            issues={issues} 
            loading={loading}
            currentIssueId={currentIssue?.id}
            onSetCurrentIssue={handleSetCurrentIssue}
          />
          <Card className="border-destructive">
            <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                    This will permanently delete all issues and votes for this game session. This action cannot be undone.
                </p>
                <SessionControls gameId={gameId} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Game;