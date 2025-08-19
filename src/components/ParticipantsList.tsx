import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Participant, Vote } from '@/pages/Game';
import { CheckCircle2 } from 'lucide-react';

interface ParticipantsListProps {
  participants: Participant[];
  votes: Vote[];
  showVoteCount?: boolean;
}

export const ParticipantsList = ({ participants, votes, showVoteCount = false }: ParticipantsListProps) => {
  const votedParticipantIds = new Set(votes.map(v => v.user_id));

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Players ({showVoteCount ? `${votedParticipantIds.size}/` : ''}{participants.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {participants.length === 0 ? (
          <p className="text-muted-foreground text-sm">No one else is here yet.</p>
        ) : (
          <ul className="space-y-2">
            {participants.map((participant) => (
              <li key={participant.id} className="flex items-center justify-between text-sm">
                <span className="truncate">{participant.name}</span>
                {votedParticipantIds.has(participant.id) && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};