import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Issue, Participant, Vote } from '@/pages/Game';
import { useUser } from '@/hooks/useUser';
import { showError, showSuccess } from '@/utils/toast';
import { Check } from 'lucide-react';

interface VotingSectionProps {
  currentIssue: Issue | undefined;
  participants: Participant[];
  votes: Vote[];
}

const VOTE_OPTIONS = ['1', '2', '3', '5', '8', '13', '?', '☕'];

export const VotingSection = ({ currentIssue, participants, votes }: VotingSectionProps) => {
  const { user } = useUser();
  const userId = user?.id;
  const [userVote, setUserVote] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setUserVote(null);
    if (currentIssue && userId) {
      const foundVote = votes.find(v => v.user_id === userId);
      setUserVote(foundVote ? foundVote.vote_value : null);
    }
  }, [currentIssue, userId, votes]);

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
    if (error) showError("Failed to reveal votes.");
  };
  
  const handleResetVoting = async () => {
    if (!currentIssue) return;
    await supabase.from('votes').delete().eq('issue_id', currentIssue.id);
    const { error } = await supabase.from('issues').update({ votes_revealed: false }).eq('id', currentIssue.id);
    if (error) showError("Failed to reset voting state.");
    else showSuccess("Voting has been reset.");
  };

  const handleSetFinalVote = async (voteValue: string) => {
    if (!currentIssue) return;
    const { error } = await supabase
      .from('issues')
      .update({ final_vote: voteValue, is_voting: false })
      .eq('id', currentIssue.id);
    if (error) showError("Failed to set final estimate.");
    else showSuccess(`Estimate set to ${voteValue}.`);
  };

  const voteResults = useMemo(() => {
    if (!currentIssue?.votes_revealed || votes.length === 0) {
      return { average: 0, consensus: false };
    }
    const numericVotes = votes
      .map(v => parseInt(v.vote_value, 10))
      .filter(v => !isNaN(v));

    if (numericVotes.length === 0) {
      return { average: 0, consensus: true };
    }

    const sum = numericVotes.reduce((acc, val) => acc + val, 0);
    const average = sum / numericVotes.length;
    const consensus = new Set(numericVotes).size === 1;

    return { average: parseFloat(average.toFixed(2)), consensus };
  }, [currentIssue, votes]);

  if (!currentIssue) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="bg-card p-8 rounded-lg shadow-lg max-w-md">
          <h3 className="text-xl font-semibold mb-2">Ready to estimate!</h3>
          <p className="text-muted-foreground">Select an issue from the sidebar to start voting.</p>
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
          <div className="text-center space-y-4 bg-card p-4 rounded-lg">
            <div className="flex justify-around items-center">
              <div>
                <p className="text-sm text-muted-foreground">Average</p>
                <p className="text-2xl font-bold">{voteResults.average}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Consensus</p>
                <p className={`text-2xl font-bold ${voteResults.consensus ? 'text-green-500' : 'text-destructive'}`}>
                  {voteResults.consensus ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Set Final Estimate</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {VOTE_OPTIONS.map((value) => (
                  <Button key={value} variant="outline" size="sm" onClick={() => handleSetFinalVote(value)}>
                    {value}
                  </Button>
                ))}
              </div>
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
                <Button onClick={handleRevealVotes} size="lg">Reveal Cards</Button>
            ) : (
                <Button onClick={handleResetVoting} variant="secondary">New Voting</Button>
            )}
        </div>
      </div>
    </div>
  );
};