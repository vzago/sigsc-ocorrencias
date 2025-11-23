import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, Edit, AlertTriangle, TreePine, Flame, Building2, FileText, Calendar, Tag, Hash, MapPin, User, Clock, Shield, Code, Thermometer, Droplets, Waves, Target, Truck, Package, CheckCircle2 } from "lucide-react";
import { generateOccurrencePDF } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";
import { occurrencesApi } from "@/services/occurrences.service";
import { OccurrenceStatus, OccurrenceDisplay } from "@/types/occurrence.types";

interface OccurrenceDetailsProps {
  occurrence: OccurrenceDisplay;
  onBack: () => void;
  onEdit?: (occurrence: OccurrenceDisplay) => void;
  onStatusChange?: (occurrence: OccurrenceDisplay) => void;
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
  const [isExporting, setIsExporting] = useState(false);
  const CategoryIcon = categoryIcons[occurrence.category];
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: OccurrenceStatus) => {
    if (newStatus === occurrence.status) return;

    setIsUpdatingStatus(true);
    try {
      const updatedOccurrence = await occurrencesApi.update(occurrence.id, { status: newStatus });
      const convertedOccurrence = {
        ...occurrence,
        status: updatedOccurrence.status as OccurrenceDisplay["status"]
      };
      setOccurrence(convertedOccurrence);

      toast({
        title: "Status atualizado",
        description: `Status alterado para "${statusLabels[convertedOccurrence.status]}".`,
      });

      if (onStatusChange) {
        onStatusChange(convertedOccurrence);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Não foi possível atualizar o status da ocorrência.";
      toast({
        title: "Erro ao atualizar status",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await generateOccurrencePDF(occurrence);
      toast({
        title: "PDF gerado com sucesso",
        description: "O arquivo PDF foi baixado.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Fixo e Compacto */}
      <Card className="sticky top-16 z-40 bg-card border-2 border-primary shadow-lg">
        <CardContent className="p-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" onClick={onBack} size="sm" className="shrink-0 h-8">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Voltar
            </Button>

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <CategoryIcon className="w-5 h-5 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-foreground truncate">R.A. {occurrence.ra}</h1>
                <p className="text-xs text-muted-foreground truncate">{categoryLabels[occurrence.category]}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <Select
                value={occurrence.status}
                onValueChange={handleStatusChange}
                disabled={isUpdatingStatus}
              >
                <SelectTrigger className="w-[160px] h-8 border-0 bg-transparent p-2 gap-2 hover:bg-transparent focus:ring-0 shadow-none">
                  <Badge variant={statusColors[occurrence.status]} className="w-full py-2 justify-center cursor-pointer text-xs">
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

              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(occurrence)} className="h-8">
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1.5">Editar</span>
                </Button>
              )}
              <Button
                onClick={handleExportPDF}
                disabled={isExporting}
                size="sm"
                className="h-8 bg-gradient-to-r from-primary to-primary-variant hover:opacity-90 shadow-sm"
              >
                {isExporting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    <span className="hidden sm:inline">Exportando...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1.5">Exportar PDF</span>
                  </>
                )}
                <span className="sm:hidden">{isExporting ? '...' : 'PDF'}</span>
              </Button>
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

          <div className="mt-4 pt-4 border-t space-y-3">
            {occurrence.sspdsNumber && (
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Número SSPDS:</span>
                <span className="text-sm font-semibold text-foreground">{occurrence.sspdsNumber}</span>
              </div>
            )}
            {occurrence.endDateTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Data/Hora Fim:</span>
                <span className="text-sm font-semibold text-foreground">{occurrence.endDateTime}</span>
              </div>
            )}
            {occurrence.origins && occurrence.origins.length > 0 && (
              <div className="flex items-start gap-2">
                <Tag className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-muted-foreground block mb-1">Origem do Chamado:</span>
                  <div className="flex flex-wrap gap-2">
                    {occurrence.origins.map((origin, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {origin}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {occurrence.cobradeCode && (
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Código COBRADE:</span>
                <span className="text-sm font-semibold text-foreground">{occurrence.cobradeCode}</span>
              </div>
            )}
            {occurrence.isConfidential !== undefined && (
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Confidencial:</span>
                <Badge variant={occurrence.isConfidential ? "destructive" : "outline"} className="text-xs">
                  {occurrence.isConfidential ? "Sim" : "Não"}
                </Badge>
              </div>
            )}
            {occurrence.subcategory && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Subcategoria:</span>
                <span className="text-sm font-semibold text-foreground">{occurrence.subcategory}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Localização */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Localização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground block mb-1">Logradouro</span>
              <p className="text-lg text-foreground">{occurrence.address}</p>
            </div>

            {(occurrence.addressNumber || occurrence.neighborhood) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                {occurrence.addressNumber && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block mb-1">Número</span>
                    <p className="text-foreground">{occurrence.addressNumber}</p>
                  </div>
                )}
                {occurrence.neighborhood && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block mb-1">Bairro</span>
                    <p className="text-foreground">{occurrence.neighborhood}</p>
                  </div>
                )}
              </div>
            )}

            {occurrence.reference && (
              <div className="pt-2 border-t">
                <span className="text-sm font-medium text-muted-foreground block mb-1">Ponto de Referência</span>
                <p className="text-foreground">{occurrence.reference}</p>
              </div>
            )}

            {(occurrence.latitude || occurrence.longitude || occurrence.altitude) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
                {occurrence.latitude && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block mb-1">Latitude</span>
                    <p className="text-foreground font-mono text-sm">{occurrence.latitude}</p>
                  </div>
                )}
                {occurrence.longitude && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block mb-1">Longitude</span>
                    <p className="text-foreground font-mono text-sm">{occurrence.longitude}</p>
                  </div>
                )}
                {occurrence.altitude && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block mb-1">Altitude (m)</span>
                    <p className="text-foreground font-mono text-sm">{occurrence.altitude}</p>
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
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Dados do Solicitante
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground block mb-1">Nome</span>
              <p className="text-lg text-foreground">{occurrence.requester}</p>
            </div>
            {occurrence.institution && (
              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-1">Instituição</span>
                <p className="text-foreground">{occurrence.institution}</p>
              </div>
            )}
            {occurrence.phone && (
              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-1">Telefone</span>
                <p className="text-foreground">{occurrence.phone}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dados Específicos da Categoria */}
      {
        (occurrence.areaType || occurrence.affectedArea || occurrence.temperature || occurrence.humidity || occurrence.hasWaterBody !== undefined || occurrence.impactType || occurrence.impactMagnitude) && (
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Dados Específicos da Ocorrência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {occurrence.areaType && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block mb-1">Tipo de Área</span>
                    <p className="text-foreground">{occurrence.areaType}</p>
                  </div>
                )}
                {occurrence.affectedArea && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block mb-1">Área Atingida (m²)</span>
                    <p className="text-foreground">{occurrence.affectedArea}</p>
                  </div>
                )}
                {occurrence.temperature && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block mb-1 flex items-center gap-1">
                      <Thermometer className="w-3 h-3" />
                      Temperatura (°C)
                    </span>
                    <p className="text-foreground">{occurrence.temperature}</p>
                  </div>
                )}
                {occurrence.humidity && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block mb-1 flex items-center gap-1">
                      <Droplets className="w-3 h-3" />
                      Umidade (%)
                    </span>
                    <p className="text-foreground">{occurrence.humidity}</p>
                  </div>
                )}
                {occurrence.hasWaterBody !== undefined && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block mb-1 flex items-center gap-1">
                      <Waves className="w-3 h-3" />
                      Presença de Corpo d'Água
                    </span>
                    <Badge variant={occurrence.hasWaterBody ? "default" : "outline"} className="text-xs">
                      {occurrence.hasWaterBody ? "Sim" : "Não"}
                    </Badge>
                  </div>
                )}
                {occurrence.impactType && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block mb-1">Tipo de Impacto</span>
                    <p className="text-foreground">{occurrence.impactType}</p>
                  </div>
                )}
                {occurrence.impactMagnitude && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block mb-1">Magnitude do Impacto</span>
                    <p className="text-foreground">{occurrence.impactMagnitude}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      }

      {/* Descrição */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Descrição da Ocorrência
          </CardTitle>
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

      {/* Providências Adotadas */}
      {
        (occurrence.teamActions && occurrence.teamActions.length > 0) || (occurrence.activatedOrganisms && occurrence.activatedOrganisms.length > 0) ? (
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Providências Adotadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {occurrence.teamActions && occurrence.teamActions.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block mb-3">Ações da Equipe</span>
                    <div className="flex flex-wrap gap-2">
                      {occurrence.teamActions.map((action, index) => (
                        <Badge key={index} variant="secondary" className="text-xs py-1 px-2">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {occurrence.activatedOrganisms && occurrence.activatedOrganisms.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block mb-3">Órgãos Acionados</span>
                    <div className="flex flex-wrap gap-2">
                      {occurrence.activatedOrganisms.map((organism, index) => (
                        <Badge key={index} variant="outline" className="text-xs py-1 px-2">
                          {organism}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : null
      }

      {/* Recursos Utilizados */}
      {
        (occurrence.vehicles && occurrence.vehicles.length > 0) || occurrence.materials ? (
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                Recursos Utilizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {occurrence.vehicles && occurrence.vehicles.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block mb-2 flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Veículos
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {occurrence.vehicles.map((vehicle, index) => (
                        <Badge key={index} variant="secondary" className="text-xs py-1 px-2">
                          {vehicle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {occurrence.materials && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block mb-2 flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      Materiais
                    </span>
                    <p className="text-foreground">{occurrence.materials}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : null
      }

      {/* Agentes Responsáveis */}
      {
        occurrence.responsibleAgents && (
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
        )
      }
    </div>
  );
}