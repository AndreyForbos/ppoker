import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Participant, Vote } from '@/pages/Game';
import { CheckCircle2, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { showSuccess } from '@/utils/toast';

interface ParticipantsListProps {
  participants: Participant[];
  votes: Vote[];
}

export const ParticipantsList = ({ participants, votes }: ParticipantsListProps) => {
  const votedParticipantIds = new Set(votes.map(v => v.user_id));

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(window.location.href);
    showSuccess("Invite link copied to clipboard!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Players ({votedParticipantIds.size}/{participants.length})</CardTitle>
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
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={handleCopyInvite}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Invite Link
        </Button>
      </CardFooter>
    </Card>
  );
};