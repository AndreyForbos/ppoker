import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Issue, Participant, Vote } from '@/pages/Game';
import { useUser } from '@/context/UserContext';
import { showError, showSuccess } from '@/utils/toast';
import { Check, Eye } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface VotingSectionProps {
  currentIssue: Issue | undefined;
  participants: Participant[];
  votes: Vote[];
  onStateChange: () => Promise<void>;
}

const VOTE_OPTIONS = ['1', '2', '3', '5', '8', '13', '21', '34', '55', '?', '☕'];

export const VotingSection = ({ currentIssue, participants, votes, onStateChange }: VotingSectionProps) => {
  const { user } = useUser();
  const userId = user?.id;
  const isSpectator = user?.isSpectator;
  const [userVote, setUserVote] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customVote, setCustomVote] = useState('');

  const players = useMemo(() => participants.filter(p => !p.isSpectator), [participants]);
  const spectators = useMemo(() => participants.filter(p => p.isSpectator), [participants]);

  useEffect(() => {
    setUserVote(null);
    if (currentIssue && userId) {
      const foundVote = votes.find(v => v.user_id === userId);
      setUserVote(foundVote ? foundVote.vote_value : null);
    }
  }, [currentIssue, userId, votes]);

  const handleVote = async (value: string) => {
    if (!currentIssue || !userId || isSubmitting || isSpectator) return;
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

  const handleRevealVotes = useCallback(async () => {
    if (!currentIssue || currentIssue.votes_revealed) return;
    const { error } = await supabase
      .from('issues')
      .update({ votes_revealed: true })
      .eq('id', currentIssue.id);
    if (error) {
      showError("Failed to reveal votes.");
    }
  }, [currentIssue]);

  const handleResetVoting = async () => {
    if (!currentIssue) return;
    
    const { error: deleteError } = await supabase.from('votes').delete().eq('issue_id', currentIssue.id);
    if (deleteError) {
      showError("Failed to clear previous votes for reset.");
      return;
    }

    const { error: updateError } = await supabase.from('issues').update({ votes_revealed: false }).eq('id', currentIssue.id);
    if (updateError) {
      showError("Failed to reset voting state.");
    } else {
      showSuccess("Voting has been reset.");
      await onStateChange();
    }
  };

  const handleSetFinalVote = async (voteValue: string) => {
    if (!currentIssue || !voteValue.trim()) return;
    const { error } = await supabase
      .from('issues')
      .update({ final_vote: voteValue, is_voting: false })
      .eq('id', currentIssue.id);
    if (error) {
      showError("Failed to set final estimate.");
    } else {
      showSuccess(`Estimate set to ${voteValue}.`);
      setCustomVote('');
      await onStateChange();
    }
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
          <h3 className="text-xl font-semibold mb-2">Pronto para estimar!</h3>
          <p className="text-muted-foreground">Selecione uma issue na barra lateral para começar a votar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8">
      <div className="text-center mb-8">
        <p className="text-muted-foreground">Votando em</p>
        <h2 className="text-3xl font-bold">{currentIssue.title}</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex flex-wrap gap-8 justify-center">
          {players.map((participant) => {
            const vote = votes.find(v => v.user_id === participant.id);
            const hasVoted = !!vote;

            return (
              <div key={participant.id} className="flex flex-col items-center w-28 text-center">
                {currentIssue.votes_revealed ? (
                  <div className="bg-primary text-primary-foreground rounded-lg w-20 h-28 flex items-center justify-center text-3xl font-bold shadow-lg mb-3">
                    <div>
                      {vote ? vote.vote_value : <span className="text-xl text-primary-foreground/70">?</span>}
                    </div>
                  </div>
                ) : (
                  <div className={`rounded-lg w-20 h-28 flex items-center justify-center border-2 transition-all mb-3 ${hasVoted ? 'bg-green-500/20 border-green-500' : 'bg-card border-border'}`}>
                    {hasVoted && <Check className="h-10 w-10 text-green-500" />}
                  </div>
                )}
                <Avatar className="mb-2">
                  <AvatarFallback>{participant.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium truncate w-full">{participant.name}</span>
              </div>
            );
          })}
        </div>
        {spectators.length > 0 && (
          <div className="mt-8 w-full max-w-md">
            <h4 className="text-sm font-medium text-muted-foreground mb-2 text-center">Espectadores ({spectators.length})</h4>
            <div className="flex flex-wrap gap-4 justify-center">
              {spectators.map(spectator => (
                <div key={spectator.id} className="flex flex-col items-center text-center">
                  <Avatar className="mb-1">
                    <AvatarFallback><Eye className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground truncate w-20">{spectator.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        {isSpectator ? (
          <div className="text-center p-4 bg-card rounded-lg">
            <p className="text-muted-foreground">Você é um espectador. Os votos serão revelados em breve.</p>
          </div>
        ) : currentIssue.votes_revealed ? (
          <div className="text-center space-y-4 bg-card p-4 rounded-lg">
            <div className="flex justify-around items-center">
              <div>
                <p className="text-sm text-muted-foreground">Média</p>
                <p className="text-2xl font-bold">{voteResults.average}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Consenso</p>
                <p className={`text-2xl font-bold ${voteResults.consensus ? 'text-green-500' : 'text-destructive'}`}>
                  {voteResults.consensus ? 'Sim' : 'Não'}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Definir Estimativa Final</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {VOTE_OPTIONS.map((value) => (
                  <Button key={value} variant="outline" size="sm" onClick={() => handleSetFinalVote(value)}>
                    {value}
                  </Button>
                ))}
              </div>
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleSetFinalVote(String(voteResults.average))}
                  disabled={voteResults.average === 0}
                >
                  Aceitar Média ({voteResults.average})
                </Button>
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="Custom" 
                    className="w-24" 
                    value={customVote}
                    onChange={(e) => setCustomVote(e.target.value)}
                  />
                  <Button onClick={() => handleSetFinalVote(customVote)} disabled={!customVote.trim()}>Definir</Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-4 text-lg text-muted-foreground">Escolha sua carta!</p>
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
            {currentIssue.votes_revealed ? (
                !isSpectator && <Button onClick={handleResetVoting} variant="secondary">Nova Votação</Button>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  {votes.length} de {players.length} jogadores votaram.
                </p>
                {!isSpectator && (
                  <Button onClick={handleRevealVotes} disabled={votes.length === 0}>
                    Revelar Votos
                  </Button>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};