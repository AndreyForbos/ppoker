import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Participant, Vote } from '@/pages/Game';
import { CheckCircle2, Eye } from 'lucide-react';

interface ParticipantsListProps {
  participants: Participant[];
  votes: Vote[];
  showVoteCount?: boolean;
}

export const ParticipantsList = ({ participants, votes, showVoteCount = false }: ParticipantsListProps) => {
  const votedParticipantIds = new Set(votes.map(v => v.user_id));
  const players = participants.filter(p => !p.isSpectator);
  const spectators = participants.filter(p => p.isSpectator);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Jogadores ({showVoteCount ? `${votedParticipantIds.size}/` : ''}{players.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {players.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum jogador entrou ainda.</p>
        ) : (
          <ul className="space-y-2">
            {players.map((participant) => (
              <li key={participant.id} className="flex items-center justify-between text-sm">
                <span className="truncate">{participant.name}</span>
                {votedParticipantIds.has(participant.id) && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </li>
            ))}
          </ul>
        )}
        {spectators.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Espectadores ({spectators.length})</h4>
            <ul className="space-y-2">
              {spectators.map((participant) => (
                <li key={participant.id} className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="truncate">{participant.name}</span>
                  <Eye className="h-4 w-4" />
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};