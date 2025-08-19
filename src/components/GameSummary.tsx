import { Issue } from '@/pages/Game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface GameSummaryProps {
  issues: Issue[];
}

export const GameSummary = ({ issues }: GameSummaryProps) => {
  const completedIssues = issues.filter(issue => issue.final_vote !== null);

  if (completedIssues.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo da Sessão</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Issue</TableHead>
              <TableHead className="text-right">Estimativa Final</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {completedIssues.map(issue => (
              <TableRow key={issue.id}>
                <TableCell className="font-medium">{issue.title}</TableCell>
                <TableCell className="text-right font-bold">{issue.final_vote}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};