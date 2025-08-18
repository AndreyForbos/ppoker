import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Issue } from '@/pages/Game';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface IssueListProps {
  issues: Issue[];
  loading: boolean;
  currentIssueId: number | undefined;
  onSetCurrentIssue: (issueId: number) => void;
  onDeleteIssue: (issueId: number) => void;
}

export const IssueList = ({ issues, loading, currentIssueId, onSetCurrentIssue, onDeleteIssue }: IssueListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Issues</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
          </div>
        ) : issues.length === 0 ? (
          <p className="text-muted-foreground">No issues created yet. Add one above to get started!</p>
        ) : (
          <ul className="space-y-2">
            {issues.map((issue) => (
              <li 
                key={issue.id} 
                className={`p-3 rounded-md flex justify-between items-center transition-all ${
                  issue.id === currentIssueId ? 'bg-primary/10 ring-2 ring-primary' : 'bg-secondary'
                }`}
              >
                <span className="truncate pr-4">{issue.title}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {issue.final_vote && (
                    <Badge variant="secondary">{issue.final_vote}</Badge>
                  )}
                  <Button 
                    size="sm" 
                    variant={issue.id === currentIssueId ? "default" : "outline"}
                    onClick={() => onSetCurrentIssue(issue.id)}
                    disabled={
                      (!!currentIssueId && currentIssueId !== issue.id) || !!issue.final_vote
                    }
                  >
                    {issue.id === currentIssueId ? 'Voting...' : (issue.final_vote ? 'Estimated' : 'Start Voting')}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={!!issue.final_vote}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the issue "{issue.title}" and all its associated votes. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDeleteIssue(issue.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};