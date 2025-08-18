import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Issue } from '@/pages/Game';

interface IssueListProps {
  issues: Issue[];
  loading: boolean;
  currentIssueId: number | undefined;
  onSetCurrentIssue: (issueId: number) => void;
}

export const IssueList = ({ issues, loading, currentIssueId, onSetCurrentIssue }: IssueListProps) => {
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
                <span>{issue.title}</span>
                <div className="flex items-center gap-2">
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
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};