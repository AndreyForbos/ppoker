import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Issue } from '@/pages/Game';

interface IssueListProps {
  issues: Issue[];
  loading: boolean;
}

export const IssueList = ({ issues, loading }: IssueListProps) => {
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
              <li key={issue.id} className="p-3 bg-secondary rounded-md">
                {issue.title}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};