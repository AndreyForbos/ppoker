import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface JoinGameDialogProps {
  open: boolean;
  onJoin: (name: string) => void;
}

export const JoinGameDialog = ({ open, onJoin }: JoinGameDialogProps) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name.trim());
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Join the Game</DialogTitle>
          <DialogDescription>
            Enter your display name to join the planning session.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              autoFocus
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={!name.trim()}>
              Join
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};