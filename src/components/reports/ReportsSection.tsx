import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, Loader2 } from "lucide-react";
import { generateReportPDF } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";
import { occurrencesApi } from "@/services/occurrences.service";
import { Occurrence as ApiOccurrence } from "@/types/occurrence.types";

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

const convertApiOccurrence = (apiOccurrence: ApiOccurrence): Occurrence => {
  const formatDateTime = (date: string | Date | undefined): string => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAddress = (location: ApiOccurrence["location"]): string => {
    if (!location) return "";
    const parts = [
      location.address,
      location.number,
      location.neighborhood
    ].filter(Boolean);
    return parts.join(", ");
  };

  return {
    id: apiOccurrence.id,
    ra: apiOccurrence.raNumber,
    dateTime: formatDateTime(apiOccurrence.startDateTime),
    category: apiOccurrence.category,
    status: apiOccurrence.status,
    address: formatAddress(apiOccurrence.location),
    requester: apiOccurrence.requesterName,
    description: apiOccurrence.description,
  };
};

export const ReportsSection = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (startDate && endDate) {
      loadOccurrences();
    } else {
      setOccurrences([]);
    }
  }, [startDate, endDate]);

  const loadOccurrences = async () => {
    if (!startDate || !endDate) return;
    
    setIsLoading(true);
    try {
      const response = await occurrencesApi.getAll({
        startDate,
        endDate,
        limit: 10000,
      });
      const convertedOccurrences = Array.isArray(response.data)
        ? response.data.map(convertApiOccurrence)
        : [];
      setOccurrences(convertedOccurrences);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar ocorrências",
        description: error.message || "Não foi possível carregar as ocorrências.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize filtered occurrences to prevent infinite re-renders
  const filteredOccurrences = useMemo(() => {
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
  }, [occurrences, startDate, endDate]);

  // Memoize report statistics
  const reportStats = useMemo(() => {
    if (!startDate || !endDate || filteredOccurrences.length === 0) {
      return null;
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
  }, [startDate, endDate, filteredOccurrences]);

  const handleGeneratePDF = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Datas obrigatórias",
        description: "Por favor, selecione as datas inicial e final.",
        variant: "destructive",
      });
      return;
    }

    if (filteredOccurrences.length === 0) {
      toast({
        title: "Nenhuma ocorrência encontrada",
        description: "Não há ocorrências no período selecionado.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      if (reportStats) {
        await generateReportPDF(reportStats);
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

  return (
    <div className="space-y-6">
      <Card className="bg-card border border-border/50">
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
            disabled={isGenerating || isLoading || !startDate || !endDate}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Gerar Relatório PDF
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {reportStats && (
        <Card className="bg-card border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Prévia do Relatório
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg border border-border/50">
                <div className="text-2xl font-bold text-primary">
                  {reportStats.totalOccurrences}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total de Ocorrências
                </div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg border border-border/50">
                <div className="text-2xl font-bold text-primary">
                  {Object.keys(reportStats.occurrencesByCategory).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Categorias Diferentes
                </div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg border border-border/50">
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