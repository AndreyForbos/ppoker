import { Issue } from '@/pages/Game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface GameSummaryProps {
  issues: Issue[];
}

export const GameSummary = ({ issues }: GameSummaryProps) => {
  const completedIssues = issues.filter(issue => issue.final_vote !== null);

  const handleExport = () => {
    const summaryElement = document.getElementById('summary-card');
    if (summaryElement) {
      html2canvas(summaryElement).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const width = pdfWidth - 20; // with some margin
        const height = width / ratio;

        // Check if content fits on one page, if not, adjust
        const finalHeight = height > pdfHeight - 20 ? pdfHeight - 20 : height;

        pdf.addImage(imgData, 'PNG', 10, 10, width, finalHeight);
        pdf.save('planning-poker-summary.pdf');
      });
    }
  };

  if (completedIssues.length === 0) {
    return null;
  }

  return (
    <Card id="summary-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Resumo da Sessão</CardTitle>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar PDF
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