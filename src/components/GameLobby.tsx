import { ParticipantsList } from './ParticipantsList';
import { Participant, Vote } from '@/pages/Game';
import { Button } from './ui/button';
import { Copy, Info } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface GameLobbyProps {
  gameId: string;
  participants: Participant[];
  votes: Vote[];
}

export const GameLobby = ({ gameId, participants, votes }: GameLobbyProps) => {
  const handleCopyInvite = () => {
    navigator.clipboard.writeText(window.location.href);
    showSuccess("Invite link copied to clipboard!");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div className="w-full max-w-2xl space-y-8">
        <div>
          <h2 className="text-3xl font-bold">Game: {gameId}</h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Feeling lonely? Invite players to join the session!
          </p>
          <Button onClick={handleCopyInvite} className="mt-4">
            <Copy className="h-4 w-4 mr-2" />
            Copy Invite Link
          </Button>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Pro Tip!</AlertTitle>
          <AlertDescription>
            You can connect your Jira board to automatically import issues and sync estimates.
          </AlertDescription>
        </Alert>

        <div>
          <ParticipantsList participants={participants} votes={votes} />
        </div>
        <p className="text-muted-foreground pt-4">
          Select an issue from the issues panel to start voting.
        </p>
      </div>
    </div>
  );
};