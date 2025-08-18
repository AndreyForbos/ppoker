import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { showError, showSuccess } from '@/utils/toast';
import { CreateIssueForm } from '@/components/CreateIssueForm';
import { IssueList } from '@/components/IssueList';
import { Header } from '@/components/Header';
import { VotingSection } from '@/components/VotingSection';
import { SessionControls } from '@/components/SessionControls';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/hooks/useUser';
import { UserSetup } from '@/components/UserSetup';
import { ParticipantsList } from '@/components/ParticipantsList';

export interface Issue {
  id: number;
  title: string;
  game_id: string;
  is_voting: boolean;
  votes_revealed: boolean;
  final_vote: string | null;
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
      const votingIssue = fetchedIssues.find(i => i.is_voting);
      setCurrentIssue(votingIssue);
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
        () => fetchIssues()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
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
    await supabase.from('issues').update({ is_voting: false }).eq('game_id', gameId);
    await supabase.from('votes').delete().eq('issue_id', issueId);
    const { error } = await supabase.from('issues').update({ is_voting: true, votes_revealed: false }).eq('id', issueId);
    if (error) showError("Failed to start voting on issue.");
  };

  const handleDeleteIssue = async (issueId: number) => {
    await supabase.from('votes').delete().eq('issue_id', issueId);
    const { error } = await supabase.from('issues').delete().eq('id', issueId);
    if (error) showError('Failed to delete the issue.');
    else showSuccess('Issue deleted successfully.');
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center"><p>Loading user...</p></div>;
  if (!user.name) return <UserSetup onNameSet={(name) => setUserName(name)} />;
  if (loading && issues.length === 0) return <div className="min-h-screen flex items-center justify-center"><p>Loading game...</p></div>;
  if (!gameId) return <div className="min-h-screen flex items-center justify-center"><p>Game ID is missing.</p></div>;

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground">
      <Header gameId={gameId} />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col p-4 md:p-8">
          <VotingSection currentIssue={currentIssue} participants={participants} votes={votes} />
        </main>
        <aside className="hidden lg:flex w-full lg:w-[350px] xl:w-[400px] bg-[#1e2332] border-l border-border p-6 flex-col flex-shrink-0">
          <div className="flex-1 space-y-6 overflow-y-auto">
            <ParticipantsList participants={participants} votes={votes} />
            <CreateIssueForm gameId={gameId} />
            <IssueList 
              issues={issues} 
              loading={loading}
              currentIssueId={currentIssue?.id}
              onSetCurrentIssue={handleSetCurrentIssue}
              onDeleteIssue={handleDeleteIssue}
            />
          </div>
          <div className="flex-shrink-0 mt-6">
            <Card className="border-destructive bg-transparent shadow-none">
              <CardHeader className="p-4">
                  <CardTitle className="text-base">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground mb-4">
                      Permanently delete all issues and votes for this game.
                  </p>
                  <SessionControls gameId={gameId} />
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Game;