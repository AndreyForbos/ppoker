import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Issue } from '@/pages/Game';
import { useUser } from '@/hooks/useUser';
import { showError, showSuccess } from '@/utils/toast';

interface VotingSectionProps {
  currentIssue: Issue | undefined;
  gameId: string;
}

interface Vote {
  id: number;
  user_id: string;
  vote_value: string;
}

const VOTE_OPTIONS = ['1', '2', '3', '5', '8', '13', '?', '☕'];

export const VotingSection = ({ currentIssue }: VotingSectionProps) => {
  const userId = useUser();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVotes = async () => {
    if (!currentIssue) return;
    const { data, error } = await supabase
      .from('votes')
      .select('id, user_id, vote_value')
      .eq('issue_id', currentIssue.id);
    
    if (error) {
      showError("Could not fetch votes.");
    } else {
      setVotes(data || []);
    }
  };

  useEffect(() => {
    setVotes([]);
    setUserVote(null);

    if (currentIssue && userId) {
      const fetchUserVote = async () => {
        const { data } = await supabase
          .from('votes')
          .select('vote_value')
          .eq('issue_id', currentIssue.id)
          .eq('user_id', userId)
          .single();
        if (data) {
          setUserVote(data.vote_value);
        }
      };
      fetchUserVote();
    }
    
    if (currentIssue?.votes_revealed) {
        fetchVotes();
    }

  }, [currentIssue, userId]);

  useEffect(() => {
    if (!currentIssue) return;

    const channel = supabase
      .channel(`votes:${currentIssue.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes', filter: `issue_id=eq.${currentIssue.id}` },
        (payload) => {
          if (currentIssue.votes_revealed) {
            fetchVotes();
          }
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const newVote = payload.new as Vote;
              if (newVote.user_id === userId) {
                  setUserVote(newVote.vote_value);
              }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentIssue, userId]);


  const handleVote = async (value: string) => {
    if (!currentIssue || !userId || isSubmitting) return;
    setIsSubmitting(true);

    const { error } = await supabase
      .from('votes')
      .upsert({
        issue_id: currentIssue.id,
        user_id: userId,
        vote_value: value,
      }, { onConflict: 'issue_id, user_id' });

    if (error) {
      showError('Failed to cast vote.');
      console.error(error);
    } else {
      setUserVote(value);
    }
    setIsSubmitting(false);
  };

  const handleRevealVotes = async () => {
    if (!currentIssue) return;
    const { error } = await supabase
      .from('issues')
      .update({ votes_revealed: true })
      .eq('id', currentIssue.id);
    
    if (error) {
      showError("Failed to reveal votes.");
    } else {
        fetchVotes();
    }
  };
  
  const handleResetVoting = async () => {
    if (!currentIssue) return;
    const { error: deleteError } = await supabase
      .from('votes')
      .delete()
      .eq('issue_id', currentIssue.id);

    if (deleteError) {
        showError("Failed to clear previous votes.");
        return;
    }

    const { error: updateError } = await supabase
      .from('issues')
      .update({ votes_revealed: false })
      .eq('id', currentIssue.id);

    if (updateError) {
        showError("Failed to reset voting state.");
    } else {
        setVotes([]);
        setUserVote(null);
        showSuccess("Voting has been reset for this issue.");
    }
  };


  if (!currentIssue) {
    return (
      <Card className="bg-gray-50 border-dashed">
        <CardContent className="pt-6 text-center text-muted-foreground">
          <p>Select an issue from the list below to start voting.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voting on: <span className="font-normal">{currentIssue.title}</span></CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!currentIssue.votes_revealed ? (
          <div>
            <p className="mb-4 text-sm text-muted-foreground">Choose your estimate:</p>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {VOTE_OPTIONS.map((value) => (
                <Button
                  key={value}
                  variant={userVote === value ? 'default' : 'outline'}
                  onClick={() => handleVote(value)}
                  className="aspect-square text-lg font-bold"
                  disabled={isSubmitting}
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-4 text-sm text-muted-foreground">Votes:</p>
            {votes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {votes.map((vote) => (
                        <div key={vote.id} className="bg-primary text-primary-foreground rounded-md w-12 h-12 flex items-center justify-center text-lg font-bold">
                            {vote.vote_value}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground">No votes were cast.</p>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t">
            {!currentIssue.votes_revealed ? (
                <Button onClick={handleRevealVotes}>Reveal Votes</Button>
            ) : (
                <Button onClick={handleResetVoting}>Vote Again</Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
};