import { Issue } from '@/pages/Game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

interface GameSummaryProps {
  issues: Issue[];
}

export const GameSummary = ({ issues }: GameSummaryProps) => {
  const completedIssues = issues.filter(issue => issue.final_vote !== null);

  const handleExport = () => {
    const headers = ['Issue', 'Estimate'];
    const rows = completedIssues.map(issue => [
      // Escape double quotes by doubling them, and wrap the title in double quotes
      `"${issue.title.replace(/"/g, '""')}"`,
      issue.final_vote
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "planning-poker-summary.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (completedIssues.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Resumo da Sessão</CardTitle>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
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