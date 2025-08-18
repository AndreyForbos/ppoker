import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { showError } from '@/utils/toast';
import { CreateIssueForm } from '@/components/CreateIssueForm';
import { IssueList } from '@/components/IssueList';
import { Header } from '@/components/Header';
import { VotingSection } from '@/components/VotingSection';

export interface Issue {
  id: number;
  title: string;
  game_id: string;
  is_voting: boolean;
  votes_revealed: boolean;
}

const Game = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIssue, setCurrentIssue] = useState<Issue | undefined>(undefined);

  const fetchIssues = async () => {
    if (!gameId) return;
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

    const { error: setError } = await supabase
      .from('issues')
      .update({ is_voting: true, votes_revealed: false })
      .eq('id', issueId);
    
    if (setError) {
      showError("Failed to start voting on issue.");
    }
  };

  if (loading) {
    return <div>Loading game...</div>
  }

  if (!gameId) {
    return <div>Game ID is missing.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header gameId={gameId} />
      <main className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="space-y-8">
          <VotingSection currentIssue={currentIssue} gameId={gameId} />
          <CreateIssueForm gameId={gameId} />
          <IssueList 
            issues={issues} 
            loading={loading}
            currentIssueId={currentIssue?.id}
            onSetCurrentIssue={handleSetCurrentIssue}
          />
        </div>
      </main>
    </div>
  );
};

export default Game;