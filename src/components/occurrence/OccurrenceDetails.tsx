import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, Edit, AlertTriangle, TreePine, Flame, Building2, FileText, Calendar, Tag, Hash } from "lucide-react";
import { generateOccurrencePDF } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";
import { occurrencesApi } from "@/services/occurrences.service";
import { OccurrenceStatus } from "@/types/occurrence.types";

interface Occurrence {
  id: string;
  ra: string;
  dateTime: string;
  category: "vistoria_ambiental" | "risco_vegetacao" | "incendio_vegetacao" | "outras";
  status: "aberta" | "andamento" | "fechada";
  address: string;
  requester: string;
  description: string;
  // Dados expandidos para exibição
  sspdsNumber?: string;
  phone?: string;
  latitude?: string;
  longitude?: string;
  detailedReport?: string;
  observations?: string;
  responsibleAgents?: string;
}

interface OccurrenceDetailsProps {
  occurrence: Occurrence;
  onBack: () => void;
  onEdit?: (occurrence: Occurrence) => void;
  onStatusChange?: (occurrence: Occurrence) => void;
}

const categoryIcons = {
  vistoria_ambiental: TreePine,
  risco_vegetacao: AlertTriangle,
  incendio_vegetacao: Flame,
  outras: Building2
};

const categoryLabels = {
  vistoria_ambiental: "Vistoria Ambiental",
  risco_vegetacao: "Risco - Vegetação/Árvore",
  incendio_vegetacao: "Incêndio em Vegetação",
  outras: "Outras Ocorrências"
};

const statusLabels = {
  aberta: "Aberta",
  andamento: "Em Andamento",
  fechada: "Fechada"
};

const statusColors = {
  aberta: "destructive",
  andamento: "warning",
  fechada: "success"
} as const;

export function OccurrenceDetails({ occurrence: initialOccurrence, onBack, onEdit, onStatusChange }: OccurrenceDetailsProps) {
  const [occurrence, setOccurrence] = useState(initialOccurrence);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const CategoryIcon = categoryIcons[occurrence.category];
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: OccurrenceStatus) => {
    if (newStatus === occurrence.status) return;

    setIsUpdatingStatus(true);
    try {
      const updatedOccurrence = await occurrencesApi.update(occurrence.id, { status: newStatus });
      const convertedOccurrence = {
        ...occurrence,
        status: updatedOccurrence.status as Occurrence["status"]
      };
      setOccurrence(convertedOccurrence);
      
      toast({
        title: "Status atualizado",
        description: `Status alterado para "${statusLabels[convertedOccurrence.status]}".`,
      });

      if (onStatusChange) {
        onStatusChange(convertedOccurrence);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message || "Não foi possível atualizar o status da ocorrência.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const occurrenceForPDF = {
        id: occurrence.id,
        ra: occurrence.ra,
        dateTime: occurrence.dateTime,
        category: categoryLabels[occurrence.category],
        status: statusLabels[occurrence.status],
        address: occurrence.address,
        requester: occurrence.requester,
        description: occurrence.description,
        expandedData: {
          "Número SSPDS": occurrence.sspdsNumber || "Não informado",
          "Telefone": occurrence.phone || "Não informado",
          "Latitude": occurrence.latitude || "Não informado",
          "Longitude": occurrence.longitude || "Não informado",
          "Relato Detalhado": occurrence.detailedReport || "Não informado",
          "Observações": occurrence.observations || "Não informado",
          "Agentes Responsáveis": occurrence.responsibleAgents || "Não informado"
        }
      };
      
      await generateOccurrencePDF(occurrenceForPDF);
      toast({
        title: "PDF gerado com sucesso",
        description: "O arquivo PDF foi baixado.",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Compacto */}
      <Card className="shadow-sm border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Button variant="outline" onClick={onBack} size="sm" className="shrink-0">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg shrink-0">
                  <CategoryIcon className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold text-foreground truncate">R.A. {occurrence.ra}</h1>
                  <p className="text-sm text-muted-foreground truncate">{categoryLabels[occurrence.category]}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline">Status:</span>
                <Select 
                  value={occurrence.status} 
                  onValueChange={handleStatusChange}
                  disabled={isUpdatingStatus}
                >
                  <SelectTrigger className="w-[140px] h-9 border-0 bg-transparent p-0 hover:bg-transparent focus:ring-0 shadow-none">
                    <Badge variant={statusColors[occurrence.status]} className="w-full justify-between cursor-pointer">
                      {statusLabels[occurrence.status]}
                    </Badge>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aberta">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-destructive" />
                        Aberta
                      </div>
                    </SelectItem>
                    <SelectItem value="andamento">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-warning" />
                        Em Andamento
                      </div>
                    </SelectItem>
                    <SelectItem value="fechada">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success" />
                        Fechada
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(occurrence)}>
                    <Edit className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Editar</span>
                  </Button>
                )}
                <Button 
                  onClick={handleExportPDF}
                  size="sm"
                  className="bg-gradient-to-r from-primary to-primary-variant hover:opacity-90 shadow-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Exportar PDF</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados Gerais */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Dados Gerais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">R.A. Número</span>
              </div>
              <p className="text-2xl font-bold text-primary">{occurrence.ra}</p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Data/Hora</span>
              </div>
              <p className="text-base font-semibold text-foreground">{occurrence.dateTime}</p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Categoria</span>
              </div>
              <div className="flex items-center gap-2">
                <CategoryIcon className="w-4 h-4 text-primary" />
                <p className="text-base font-semibold text-foreground">{categoryLabels[occurrence.category]}</p>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</span>
              </div>
              <Badge variant={statusColors[occurrence.status]} className="text-sm font-semibold">
                {statusLabels[occurrence.status]}
              </Badge>
            </div>
          </div>

          {occurrence.sspdsNumber && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Número SSPDS:</span>
                <span className="text-sm font-semibold text-foreground">{occurrence.sspdsNumber}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Localização */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Localização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground block mb-1">Endereço</span>
              <p className="text-lg text-foreground">{occurrence.address}</p>
            </div>
            
            {(occurrence.latitude || occurrence.longitude) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                {occurrence.latitude && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block mb-1">Latitude</span>
                    <p className="text-foreground font-mono">{occurrence.latitude}</p>
                  </div>
                )}
                {occurrence.longitude && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block mb-1">Longitude</span>
                    <p className="text-foreground font-mono">{occurrence.longitude}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Solicitante */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Dados do Solicitante</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground block mb-1">Nome</span>
              <p className="text-lg text-foreground">{occurrence.requester}</p>
            </div>
            {occurrence.phone && (
              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-1">Telefone</span>
                <p className="text-foreground">{occurrence.phone}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Descrição */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Descrição da Ocorrência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <span className="text-sm font-medium text-muted-foreground block mb-2">Descrição Inicial</span>
              <p className="text-sm leading-relaxed bg-muted/50 p-4 rounded-lg border border-border">
                {occurrence.description}
              </p>
            </div>
            
            {occurrence.detailedReport && (
              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-2">Relato Detalhado</span>
                <p className="text-sm leading-relaxed bg-muted/50 p-4 rounded-lg border border-border">
                  {occurrence.detailedReport}
                </p>
              </div>
            )}
            
            {occurrence.observations && (
              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-2">Observações</span>
                <p className="text-sm leading-relaxed bg-muted/50 p-4 rounded-lg border border-border">
                  {occurrence.observations}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Agentes Responsáveis */}
      {occurrence.responsibleAgents && (
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Equipe Responsável</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <span className="text-sm font-medium text-muted-foreground block mb-1">Agentes</span>
              <p className="text-lg text-foreground">{occurrence.responsibleAgents}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}