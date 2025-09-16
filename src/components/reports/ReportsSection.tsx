import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar } from "lucide-react";
import { generateReportPDF } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

interface Occurrence {
  id: string;
  ra: string;
  dateTime: string;
  category: string;
  status: string;
  address: string;
  requester: string;
  description: string;
}

interface ReportsSectionProps {
  occurrences: Occurrence[];
}

export const ReportsSection = ({ occurrences }: ReportsSectionProps) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const filterOccurrencesByDate = () => {
    if (!startDate || !endDate) {
      return occurrences;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date

    return occurrences.filter(occurrence => {
      const occurrenceDate = new Date(occurrence.dateTime);
      return occurrenceDate >= start && occurrenceDate <= end;
    });
  };

  const generateReport = () => {
    const filteredOccurrences = filterOccurrencesByDate();
    
    if (filteredOccurrences.length === 0) {
      toast({
        title: "Nenhuma ocorrência encontrada",
        description: "Não há ocorrências no período selecionado.",
        variant: "destructive",
      });
      return;
    }

    // Calculate statistics
    const occurrencesByCategory = filteredOccurrences.reduce((acc, occurrence) => {
      acc[occurrence.category] = (acc[occurrence.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      startDate: startDate || 'Início',
      endDate: endDate || 'Atual',
      totalOccurrences: filteredOccurrences.length,
      occurrencesByCategory,
      occurrences: filteredOccurrences
    };
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      const reportData = generateReport();
      if (reportData) {
        await generateReportPDF(reportData);
        toast({
          title: "Relatório gerado",
          description: "O arquivo PDF foi baixado com sucesso.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na geração",
        description: "Não foi possível gerar o relatório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredOccurrences = filterOccurrencesByDate();
  const reportStats = generateReport();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Geração de Relatórios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            {isGenerating ? 'Gerando...' : 'Gerar Relatório PDF'}
          </Button>
        </CardContent>
      </Card>

      {reportStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Prévia do Relatório
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {reportStats.totalOccurrences}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total de Ocorrências
                </div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {Object.keys(reportStats.occurrencesByCategory).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Categorias Diferentes
                </div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {reportStats.startDate && reportStats.endDate ? 
                    Math.ceil((new Date(reportStats.endDate).getTime() - new Date(reportStats.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 
                    'N/A'
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  Dias no Período
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Distribuição por Categoria:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(reportStats.occurrencesByCategory).map(([category, count]) => (
                  <Badge key={category} variant="secondary">
                    {category}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};