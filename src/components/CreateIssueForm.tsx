import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { showError, showSuccess } from '@/utils/toast';
import { Issue } from '@/pages/Game';

interface CreateIssueFormProps {
  gameId: string;
  onIssueCreated: (newIssue: Issue) => void;
}

export const CreateIssueForm = ({ gameId, onIssueCreated }: CreateIssueFormProps) => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const { data, error } = await supabase
      .from('issues')
      .insert([{ title: title.trim(), game_id: gameId }])
      .select()
      .single();

    if (error) {
      console.error('Error creating issue:', error);
      showError('Failed to create issue.');
    } else if (data) {
      showSuccess('Issue created!');
      setTitle('');
      onIssueCreated(data);
    }
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Issue</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Enter issue title (e.g., 'Setup login page')"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
          />
          <Button type="submit" disabled={!title.trim() || isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};