import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Issue, Participant } from '@/pages/Game';
import { useUser } from '@/hooks/useUser';
import { showError, showSuccess } from '@/utils/toast';
import { Check } from 'lucide-react';

interface VotingSectionProps {
  currentIssue: Issue | undefined;
  participants: Participant[];
}

interface Vote {
  user_id: string;
  vote_value: string;
}

const VOTE_OPTIONS = ['1', '2', '3', '5', '8', '13', '?', '☕'];

export const VotingSection = ({ currentIssue, participants }: VotingSectionProps) => {
  const { user } = useUser();
  const userId = user?.id;
  const [votes, setVotes] = useState<Vote[]>([]);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVotes = async () => {
    if (!currentIssue) return;
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

  useEffect(() => {
    setVotes([]);
    setUserVote(null);

    if (currentIssue) {
      fetchVotes();
    }

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
  }, [currentIssue, userId]);

  useEffect(() => {
    if (!currentIssue) return;

    const channel = supabase
      .channel(`votes:${currentIssue.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes', filter: `issue_id=eq.${currentIssue.id}` },
        (payload) => {
          fetchVotes();
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

  const handleSetFinalVote = async (voteValue: string) => {
    if (!currentIssue) return;

    const { error } = await supabase
      .from('issues')
      .update({ final_vote: voteValue, is_voting: false })
      .eq('id', currentIssue.id);

    if (error) {
      showError("Failed to set final estimate.");
    } else {
      showSuccess(`Estimate set to ${voteValue}.`);
    }
  };


  if (!currentIssue) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="bg-card p-8 rounded-lg shadow-lg max-w-md">
          <h3 className="text-xl font-semibold mb-2">Feeling lonely? 😔</h3>
          <p className="text-muted-foreground mb-4">Invite players to join the game!</p>
          <p className="text-muted-foreground">Once you have issues, select one from the sidebar to start voting.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8">
      <div className="text-center mb-8">
        <p className="text-muted-foreground">Voting on</p>
        <h2 className="text-3xl font-bold">{currentIssue.title}</h2>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-wrap gap-8 justify-center">
          {participants.map((participant) => {
            const vote = votes.find(v => v.user_id === participant.id);
            const hasVoted = !!vote;

            return (
              <div key={participant.id} className="flex flex-col items-center w-28">
                {currentIssue.votes_revealed ? (
                  <div className="bg-primary text-primary-foreground rounded-lg w-20 h-28 flex items-center justify-center text-3xl font-bold shadow-lg">
                    <div>
                      {vote ? vote.vote_value : <span className="text-xl text-primary-foreground/70">?</span>}
                    </div>
                  </div>
                ) : (
                  <div className={`rounded-lg w-20 h-28 flex items-center justify-center border-2 transition-all ${hasVoted ? 'bg-green-500/20 border-green-500' : 'bg-card border-border'}`}>
                    {hasVoted && <Check className="h-10 w-10 text-green-500" />}
                  </div>
                )}
                <span className="text-md mt-3 font-medium truncate w-full text-center">{participant.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        {currentIssue.votes_revealed ? (
          <div className="text-center space-y-4">
            <p className="text-sm font-medium">Set Final Estimate</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {VOTE_OPTIONS.map((value) => (
                <Button key={value} variant="outline" onClick={() => handleSetFinalVote(value)}>
                  {value}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-4 text-lg text-muted-foreground">Pick your card!</p>
            <div className="flex justify-center flex-wrap gap-2">
              {VOTE_OPTIONS.map((value) => (
                <Button
                  key={value}
                  variant={userVote === value ? 'default' : 'outline'}
                  onClick={() => handleVote(value)}
                  className="w-12 h-16 text-xl font-bold"
                  disabled={isSubmitting}
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-center gap-4 pt-6 mt-6 border-t border-border">
            {!currentIssue.votes_revealed ? (
                <Button onClick={handleRevealVotes} size="lg">Reveal Votes</Button>
            ) : (
                <Button onClick={handleResetVoting} variant="secondary">Vote Again</Button>
            )}
        </div>
      </div>
    </div>
  );
};