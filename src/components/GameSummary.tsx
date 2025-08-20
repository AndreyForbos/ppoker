import { Issue } from '@/pages/Game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';

interface GameSummaryProps {
  issues: Issue[];
  gameId: string;
}

export const GameSummary = ({ issues, gameId }: GameSummaryProps) => {
  const completedIssues = issues.filter(issue => issue.final_vote !== null);

  const handleExport = () => {
    const doc = new jsPDF();

    // Título do Documento
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo da Sessão de Planning Poker', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    // ID do Jogo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`ID do Jogo: ${gameId}`, 14, 30);
    doc.text(`Data: ${new Date().toLocaleDateString()}`, 14, 36);

    // Cabeçalho da Tabela
    let yPos = 50;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPos, 182, 8, 'F');
    doc.text('Issue / Tarefa', 16, yPos + 6);
    doc.text('Estimativa', 180, yPos + 6, { align: 'right' });
    yPos += 12;

    // Corpo da Tabela
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    completedIssues.forEach(issue => {
      if (yPos > 270) { // Adiciona nova página se o conteúdo estiver no final
        doc.addPage();
        yPos = 20;
      }

      const titleLines = doc.splitTextToSize(issue.title, 140);
      const voteText = issue.final_vote || 'N/A';
      
      doc.text(titleLines, 16, yPos);
      doc.text(voteText, 180, yPos, { align: 'right' });

      yPos += (titleLines.length * 5) + 6;
      doc.setDrawColor(220, 220, 220);
      doc.line(14, yPos - 3, 196, yPos - 3);
    });

    // Salvar o PDF
    doc.save(`resumo-poker-${gameId}.pdf`);
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