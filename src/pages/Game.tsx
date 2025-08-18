import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { showError } from '@/utils/toast';
import { CreateIssueForm } from '@/components/CreateIssueForm';
import { IssueList } from '@/components/IssueList';
import { Header } from '@/components/Header';

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

  useEffect(() => {
    if (!gameId) return;

    const fetchIssues = async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching issues:', error);
        showError('Could not fetch issues. Check console for details.');
      } else {
        setIssues(data || []);
      }
      setLoading(false);
    };

    fetchIssues();

    const channel = supabase
      .channel(`issues:${gameId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'issues', filter: `game_id=eq.${gameId}` },
        () => {
          fetchIssues(); // Refetch on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

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
          <CreateIssueForm gameId={gameId} />
          <IssueList issues={issues} loading={loading} />
        </div>
      </main>
    </div>
  );
};

export default Game;