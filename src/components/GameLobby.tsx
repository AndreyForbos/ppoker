import { ParticipantsList } from './ParticipantsList';
import { Participant, Vote, Issue } from '@/pages/Game';
import { Button } from './ui/button';
import { Copy } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { GameSummary } from './GameSummary';

interface GameLobbyProps {
  gameId: string;
  participants: Participant[];
  votes: Vote[];
  issues: Issue[];
}

export const GameLobby = ({ gameId, participants, votes, issues }: GameLobbyProps) => {
  const handleCopyInvite = () => {
    navigator.clipboard.writeText(window.location.href);
    showSuccess("Link de convite copiado!");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Jogo: {gameId}</h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Convide jogadores para participar da sessão!
          </p>
          <Button onClick={handleCopyInvite} className="mt-4">
            <Copy className="h-4 w-4 mr-2" />
            Copiar Link de Convite
          </Button>
        </div>

        <GameSummary issues={issues} />

        <ParticipantsList participants={participants} votes={votes} />
        
        <p className="text-muted-foreground pt-4 text-center">
          Selecione uma issue no painel para começar a votar.
        </p>
      </div>
    </div>
  );
};