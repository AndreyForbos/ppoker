import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { showError, showSuccess } from '@/utils/toast';

interface Issue {
  id: number;
  title: string;
  // Add other issue properties here if needed
}

const GameRoom = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [newIssueTitle, setNewIssueTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) return;

    const fetchIssues = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('game_id', gameId);

      if (error) {
        console.error('Error fetching issues:', error);
        setError('Could not fetch issues. Please check the console for details and ensure your database is set up correctly.');
        showError('Could not fetch issues');
      } else {
        setIssues(data || []);
      }
      setLoading(false);
    };

    fetchIssues();
  }, [gameId]);

  const handleAddIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssueTitle.trim() || !gameId) return;

    const { data, error } = await supabase
      .from('issues')
      .insert([{ title: newIssueTitle, game_id: gameId }])
      .select();

    if (error) {
      console.error('Error adding issue:', error);
      showError('Failed to add issue.');
    } else if (data) {
      setIssues(prevIssues => [...prevIssues, ...data]);
      setNewIssueTitle('');
      showSuccess('Issue added!');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Game Room: {gameId}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddIssue} className="flex gap-2 mb-4">
            <Input
              type="text"
              value={newIssueTitle}
              onChange={(e) => setNewIssueTitle(e.target.value)}
              placeholder="Enter new issue title"
            />
            <Button type="submit">Add Issue</Button>
          </form>
          
          <h2 className="text-xl font-semibold mb-2">Issues</h2>
          {loading && <p>Loading issues...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <ul className="space-y-2">
              {issues.length > 0 ? (
                issues.map(issue => <li key={issue.id} className="p-2 border rounded">{issue.title}</li>)
              ) : (
                <p>No issues yet. Add one to get started!</p>
              )}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GameRoom;