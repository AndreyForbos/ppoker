import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface UserSetupProps {
  onNameSet: (name: string) => void;
}

export const UserSetup = ({ onNameSet }: UserSetupProps) => {
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
          <DialogTitle>Welcome!</DialogTitle>
          <DialogDescription>
            Please enter your name to join the game.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            id="name"
            placeholder="Your Name"
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
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!name.trim()}>Join Game</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};