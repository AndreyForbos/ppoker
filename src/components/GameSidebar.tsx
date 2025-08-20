import { CreateIssueForm } from './CreateIssueForm';
import { IssueList } from './IssueList';
import { SessionControls } from './SessionControls';
import { Issue } from '@/pages/Game';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface GameSidebarProps {
  gameId: string;
  issues: Issue[];
  loading: boolean;
  currentIssueId: number | undefined;
  onSetCurrentIssue: (issueId: number) => void;
  onDeleteIssue: (issueId: number) => void;
  onSessionCleared: () => void;
}

export const GameSidebar = ({ 
  gameId, 
  issues, 
  loading, 
  currentIssueId, 
  onSetCurrentIssue, 
  onDeleteIssue,
  onSessionCleared
}: GameSidebarProps) => {
  return (
    <aside className="w-full md:w-96 bg-card border-r border-border flex-shrink-0 flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Manage Session</h2>
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        <CreateIssueForm gameId={gameId} />
        <IssueList
          issues={issues}
          loading={loading}
          currentIssueId={currentIssueId}
          onSetCurrentIssue={onSetCurrentIssue}
          onDeleteIssue={onDeleteIssue}
        />
      </div>
      <div className="flex-shrink-0 p-4 mt-auto border-t">
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
    </aside>
  );
};