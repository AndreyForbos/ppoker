import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface UserSetupProps {
  onJoinAsPlayer: (name: string) => void;
  onJoinAsSpectator: () => void;
}

export const UserSetup = ({ onJoinAsPlayer, onJoinAsSpectator }: UserSetupProps) => {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      onJoinAsPlayer(name.trim());
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Bem-vindo!</DialogTitle>
          <DialogDescription>
            Digite seu nome para votar ou entre como espectador.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            id="name"
            placeholder="Seu Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
        </div>
        <DialogFooter className="sm:flex-col sm:space-y-2">
          <Button onClick={handleSubmit} disabled={!name.trim()}>Entrar como Jogador</Button>
          <Button variant="outline" onClick={onJoinAsSpectator}>Entrar como Espectador</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};