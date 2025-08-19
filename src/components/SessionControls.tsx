import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { showError, showSuccess } from '@/utils/toast';
import { Trash2 } from 'lucide-react';

interface SessionControlsProps {
  gameId: string;
  onSessionCleared: () => void;
}

export const SessionControls = ({ gameId, onSessionCleared }: SessionControlsProps) => {
  const handleClearSession = async () => {
    const { error } = await supabase
      .from('issues')
      .delete()
      .eq('game_id', gameId);

    if (error) {
      console.error('Error clearing session:', error);
      showError('Failed to clear the session.');
    } else {
      showSuccess('Session has been cleared!');
      onSessionCleared();
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Clear & Restart Session
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleClearSession}>
            Yes, clear session
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};