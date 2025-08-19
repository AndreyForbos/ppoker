import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { CreateIssueForm } from './CreateIssueForm';
import { IssueList } from './IssueList';
import { SessionControls } from './SessionControls';
import { Issue } from '@/pages/Game';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface IssuesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  issues: Issue[];
  loading: boolean;
  currentIssueId: number | undefined;
  onSetCurrentIssue: (issueId: number) => void;
  onDeleteIssue: (issueId: number) => void;
  onIssueCreated: (newIssue: Issue) => void;
  onSessionCleared: () => void;
}

export const IssuesDrawer = ({ 
  isOpen, 
  onClose, 
  gameId, 
  issues, 
  loading, 
  currentIssueId, 
  onSetCurrentIssue, 
  onDeleteIssue,
  onIssueCreated,
  onSessionCleared
}: IssuesDrawerProps) => {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="h-[90vh]">
        <div className="container mx-auto p-6 h-full flex flex-col">
          <DrawerHeader>
            <DrawerTitle>Manage Session</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 space-y-6 overflow-y-auto">
            <CreateIssueForm gameId={gameId} onIssueCreated={onIssueCreated} />
            <IssueList
              issues={issues}
              loading={loading}
              currentIssueId={currentIssueId}
              onSetCurrentIssue={onSetCurrentIssue}
              onDeleteIssue={onDeleteIssue}
            />
          </div>
          <div className="flex-shrink-0 mt-6">
            <Card className="border-destructive bg-transparent shadow-none">
              <CardHeader className="p-4">
                <CardTitle className="text-base">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  Permanently delete all issues and votes for this game.
                </p>
                <SessionControls gameId={gameId} onSessionCleared={onSessionCleared} />
              </CardContent>
            </Card>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};