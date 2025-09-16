import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Edit, AlertTriangle, TreePine, Flame, Building2 } from "lucide-react";
import { generateOccurrencePDF } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

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

export function OccurrenceDetails({ occurrence, onBack, onEdit }: OccurrenceDetailsProps) {
  const CategoryIcon = categoryIcons[occurrence.category];
  const { toast } = useToast();

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
              <CategoryIcon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">R.A. {occurrence.ra}</h1>
              <p className="text-muted-foreground">{categoryLabels[occurrence.category]}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={statusColors[occurrence.status]} className="text-sm">
            {statusLabels[occurrence.status]}
          </Badge>
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(occurrence)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
          <Button 
            onClick={handleExportPDF}
            className="bg-gradient-to-r from-primary to-primary-variant hover:opacity-90"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Dados Gerais */}
      <Card>
        <CardHeader>
          <CardTitle>Dados Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-muted-foreground">R.A. Número</span>
                <p className="text-lg font-semibold">{occurrence.ra}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Data/Hora</span>
                <p>{occurrence.dateTime}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Categoria</span>
                <p>{categoryLabels[occurrence.category]}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <div className="mt-1">
                  <Badge variant={statusColors[occurrence.status]}>
                    {statusLabels[occurrence.status]}
                  </Badge>
                </div>
              </div>
              {occurrence.sspdsNumber && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Número SSPDS</span>
                  <p>{occurrence.sspdsNumber}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Localização */}
      <Card>
        <CardHeader>
          <CardTitle>Localização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Endereço</span>
              <p className="text-lg">{occurrence.address}</p>
            </div>
            
            {(occurrence.latitude || occurrence.longitude) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {occurrence.latitude && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Latitude</span>
                    <p>{occurrence.latitude}</p>
                  </div>
                )}
                {occurrence.longitude && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Longitude</span>
                    <p>{occurrence.longitude}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Solicitante */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Solicitante</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Nome</span>
              <p className="text-lg">{occurrence.requester}</p>
            </div>
            {occurrence.phone && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Telefone</span>
                <p>{occurrence.phone}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Descrição */}
      <Card>
        <CardHeader>
          <CardTitle>Descrição da Ocorrência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Descrição Inicial</span>
              <p className="mt-2 text-sm leading-relaxed bg-muted p-4 rounded-lg">
                {occurrence.description}
              </p>
            </div>
            
            {occurrence.detailedReport && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Relato Detalhado</span>
                <p className="mt-2 text-sm leading-relaxed bg-muted p-4 rounded-lg">
                  {occurrence.detailedReport}
                </p>
              </div>
            )}
            
            {occurrence.observations && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Observações</span>
                <p className="mt-2 text-sm leading-relaxed bg-muted p-4 rounded-lg">
                  {occurrence.observations}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Agentes Responsáveis */}
      {occurrence.responsibleAgents && (
        <Card>
          <CardHeader>
            <CardTitle>Equipe Responsável</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Agentes</span>
              <p className="text-lg">{occurrence.responsibleAgents}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Disponíveis</CardTitle>
          <CardDescription>Operações que podem ser realizadas nesta ocorrência</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="w-4 h-4 mr-2" />
              Exportar Relatório PDF
            </Button>
            {onEdit && (
              <Button variant="outline" onClick={() => onEdit(occurrence)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar Ocorrência
              </Button>
            )}
            <Button variant="outline" disabled>
              Alterar Status
            </Button>
            <Button variant="outline" disabled>
              Adicionar Anexos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}