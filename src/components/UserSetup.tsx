import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface UserSetupProps {
  onNameSet: (name: string) => void;
  onJoinAsSpectator: () => void;
}

export const UserSetup = ({ onNameSet, onJoinAsSpectator }: UserSetupProps) => {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      onNameSet(name.trim());
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Bem-vindo!</DialogTitle>
          <DialogDescription>
            Por favor, insira seu nome para entrar no jogo ou entre como espectador.
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
        <DialogFooter className="sm:justify-between">
          <Button onClick={onJoinAsSpectator} variant="ghost">Entrar como Espectador</Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>Entrar no Jogo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};