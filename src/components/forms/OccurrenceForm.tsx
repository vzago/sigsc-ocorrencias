import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, AlertTriangle, TreePine, Flame, Building2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { occurrencesApi } from "@/services/occurrences.service";
import { CreateOccurrenceDto, OccurrenceCategory, OriginType, Occurrence as ApiOccurrence, OccurrenceDisplay } from "@/types/occurrence.types";

interface OccurrenceFormProps {
  onBack: () => void;
  onSave: (data: ApiOccurrence) => void;
}

export function OccurrenceForm({ onBack, onSave }: OccurrenceFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Cabeçalho
    sspdsNumber: "",
    raNumber: "",
    startDateTime: "",
    endDateTime: "",
    origins: [] as string[],
    
    // Dados do Atendimento
    latitude: "",
    longitude: "",
    altitude: "",
    cobradeCode: "",
    isConfidential: false,
    address: "",
    number: "",
    neighborhood: "", 
    reference: "",
    
    // Solicitante
    requesterName: "",
    institution: "",
    phone: "",
    
    // Classificação
    category: "",
    subcategory: "",
    description: "",
    
    // Específicos por categoria
    areaType: "",
    affectedArea: "",
    temperature: "",
    humidity: "",
    hasWaterBody: false,
    impactType: "",
    impactMagnitude: "",
    
    // Providências
    teamActions: [] as string[],
    activatedOrganisms: [] as string[],
    
    // Recursos
    vehicles: [],
    materials: "",
    
    // Relatos
    detailedReport: "",
    observations: "",
    responsibleAgents: ""
  });

  const getFormProgress = () => {
    const requiredFields = [
      formData.startDateTime,
      formData.address,
      formData.requesterName,
      formData.category,
      formData.description
    ];
    const filledFields = requiredFields.filter(field => field && field.toString().trim() !== "").length;
    return Math.round((filledFields / requiredFields.length) * 100);
  };

  const formProgress = getFormProgress();

  const origins = [
    "Processo",
    "E-mail/WhatsApp", 
    "Via Fone",
    "Via Ofício",
    "Corpo de Bombeiros"
  ];

  const teamActionsList = [
    "Isolamento/Sinalização",
    "Notificação",
    "Elaborar Parecer Técnico",
    "Evacuação",
    "Interdição",
    "Avaliação",
    "Desinterdição",
    "Apoio Logístico"
  ];

  const organisms = [
    "Bombeiros",
    "SAAE",
    "Polícia Ambiental",
    "CPFL",
    "Cetesb",
    "Guarda Municipal",
    "Trânsito",
    "Ação Social"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.requesterName || !formData.address) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const now = new Date();
      const startDateTime = formData.startDateTime 
        ? new Date(formData.startDateTime).toISOString()
        : now.toISOString();

      const createDto: CreateOccurrenceDto = {
        sspdsNumber: formData.sspdsNumber || undefined,
        startDateTime,
        endDateTime: formData.endDateTime ? new Date(formData.endDateTime).toISOString() : undefined,
        origins: formData.origins.length > 0 ? formData.origins as OriginType[] : undefined,
        cobradeCode: formData.cobradeCode || undefined,
        isConfidential: formData.isConfidential,
        category: formData.category as OccurrenceCategory,
        subcategory: formData.subcategory || undefined,
        description: formData.description,
        areaType: formData.areaType || undefined,
        affectedArea: formData.affectedArea || undefined,
        temperature: formData.temperature || undefined,
        humidity: formData.humidity || undefined,
        hasWaterBody: formData.hasWaterBody,
        impactType: formData.impactType || undefined,
        impactMagnitude: formData.impactMagnitude || undefined,
        requesterName: formData.requesterName,
        institution: formData.institution || undefined,
        phone: formData.phone || undefined,
        location: {
          address: formData.address,
          number: formData.number || undefined,
          neighborhood: formData.neighborhood || undefined,
          reference: formData.reference || undefined,
          latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
          longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
          altitude: formData.altitude ? parseFloat(formData.altitude) : undefined,
        },
        actions: formData.teamActions.length > 0 || formData.activatedOrganisms.length > 0
          ? [
              ...formData.teamActions.map(action => ({ teamAction: action })),
              ...formData.activatedOrganisms.map(organism => ({ activatedOrganism: organism }))
            ]
          : undefined,
        resources: formData.vehicles.length > 0 || formData.materials
          ? [
              ...formData.vehicles.map((vehicle: { name?: string } | string) => ({ vehicle: typeof vehicle === 'string' ? vehicle : (vehicle.name || '') })),
              ...(formData.materials ? [{ materials: formData.materials }] : [])
            ]
          : undefined,
        detailedReport: formData.detailedReport || undefined,
        observations: formData.observations || undefined,
        responsibleAgents: formData.responsibleAgents || undefined,
      };

      const savedOccurrence = await occurrencesApi.create(createDto);
      
      toast({
        title: "Sucesso",
        description: `Ocorrência ${savedOccurrence.raNumber} registrada com sucesso!`,
      });

      onSave(savedOccurrence);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Não foi possível salvar a ocorrência. Tente novamente.";
      toast({
        title: "Erro ao salvar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: string, value: string) => {
    setFormData(prev => {
      const currentValue = prev[field as keyof typeof prev] as string[];
      return {
        ...prev,
        [field]: currentValue.includes(value)
          ? currentValue.filter(item => item !== value)
          : [...currentValue, value]
      };
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "vistoria_ambiental": return TreePine;
      case "risco_vegetacao": return AlertTriangle;
      case "incendio_vegetacao": return Flame;
      case "outras": return Building2;
      default: return Building2;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header e Progresso Fixos - Compacto */}
      <Card className="sticky top-16 z-40 bg-card border-2 border-primary shadow-lg">
        <CardContent className="p-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" onClick={onBack} size="sm" className="shrink-0 h-8">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Voltar
            </Button>
            
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FileText className="w-5 h-5 text-primary shrink-0" />
              <h1 className="text-lg font-bold text-foreground truncate">Nova Ocorrência</h1>
            </div>

            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse shrink-0"></div>
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Progresso:</span>
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden border border-border min-w-[100px]">
                  <div 
                    className="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-300"
                    style={{ width: `${formProgress}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-bold text-primary bg-secondary/20 px-2 py-0.5 rounded border border-secondary/30 shrink-0">
                {formProgress}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cabeçalho */}
        <Card className="shadow-sm bg-card border border-border/50">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
              Dados Gerais
            </CardTitle>
            <CardDescription>Informações básicas da ocorrência</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sspdsNumber">Número SSPDS</Label>
                <Input
                  id="sspdsNumber"
                  value={formData.sspdsNumber}
                  onChange={(e) => updateFormData("sspdsNumber", e.target.value)}
                  placeholder="Ex: 2025-001"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="startDateTime">
                  Data/Hora Início <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startDateTime"
                  type="datetime-local"
                  value={formData.startDateTime}
                  onChange={(e) => updateFormData("startDateTime", e.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="endDateTime">Data/Hora Fim</Label>
              <Input
                id="endDateTime"
                type="datetime-local"
                value={formData.endDateTime}
                onChange={(e) => updateFormData("endDateTime", e.target.value)}
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label className="mb-2 block">Origem do Chamado</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {origins.map((origin) => (
                  <div key={origin} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted transition-colors">
                    <Checkbox
                      id={origin}
                      checked={formData.origins.includes(origin)}
                      onCheckedChange={() => toggleArrayField("origins", origin)}
                    />
                    <Label htmlFor={origin} className="text-sm font-normal cursor-pointer">{origin}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <Label htmlFor="cobradeCode">Código COBRADE</Label>
                <Input
                  id="cobradeCode"
                  value={formData.cobradeCode}
                  onChange={(e) => updateFormData("cobradeCode", e.target.value)}
                  placeholder="Ex: 1.2.3.4"
                  className="mt-1.5"
                />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Checkbox
                  id="isConfidential"
                  checked={formData.isConfidential}
                  onCheckedChange={(checked) => updateFormData("isConfidential", checked === true)}
                />
                <Label htmlFor="isConfidential" className="text-sm font-normal cursor-pointer">
                  Ocorrência Confidencial
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Localização */}
        <Card className="shadow-sm bg-card border border-border/50">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
              Localização
            </CardTitle>
            <CardDescription>Dados do local da ocorrência</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  value={formData.latitude}
                  onChange={(e) => updateFormData("latitude", e.target.value)}
                  placeholder="Ex: -22.0175"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  value={formData.longitude}
                  onChange={(e) => updateFormData("longitude", e.target.value)}
                  placeholder="Ex: -47.8908"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="altitude">Altitude (m)</Label>
                <Input
                  id="altitude"
                  value={formData.altitude}
                  onChange={(e) => updateFormData("altitude", e.target.value)}
                  placeholder="Ex: 856"
                  className="mt-1.5"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="address">
                  Logradouro <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateFormData("address", e.target.value)}
                  placeholder="Ex: Rua das Flores"
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => updateFormData("number", e.target.value)}
                  placeholder="Ex: 123"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  value={formData.neighborhood}
                  onChange={(e) => updateFormData("neighborhood", e.target.value)}
                  placeholder="Ex: Centro"
                  className="mt-1.5"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="reference">Ponto de Referência</Label>
              <Input
                id="reference"
                value={formData.reference}
                onChange={(e) => updateFormData("reference", e.target.value)}
                placeholder="Ex: Próximo ao shopping"
                className="mt-1.5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Solicitante */}
        <Card className="shadow-sm bg-card border border-border/50">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
              Dados do Solicitante
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="requesterName">
                  Nome do Solicitante <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="requesterName"
                  value={formData.requesterName}
                  onChange={(e) => updateFormData("requesterName", e.target.value)}
                  placeholder="Nome completo"
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="institution">Instituição</Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => updateFormData("institution", e.target.value)}
                  placeholder="Ex: Prefeitura, Empresa, etc."
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => updateFormData("phone", e.target.value)}
                placeholder="Ex: (16) 99999-9999"
                className="mt-1.5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Classificação */}
        <Card className="shadow-sm bg-card border border-border/50">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
              Classificação da Ocorrência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="category">
                Categoria <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vistoria_ambiental">
                    <div className="flex items-center">
                      <TreePine className="w-4 h-4 mr-2" />
                      Vistoria Ambiental
                    </div>
                  </SelectItem>
                  <SelectItem value="risco_vegetacao">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Risco Envolvendo Vegetação/Árvore
                    </div>
                  </SelectItem>
                  <SelectItem value="incendio_vegetacao">
                    <div className="flex items-center">
                      <Flame className="w-4 h-4 mr-2" />
                      Incêndio em Vegetação
                    </div>
                  </SelectItem>
                  <SelectItem value="outras">
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 mr-2" />
                      Outras Ocorrências
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campos específicos por categoria */}
            {formData.category === "vistoria_ambiental" && (
              <div className="space-y-4 p-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 rounded-lg border-2 border-primary/20">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <div className="w-1 h-5 bg-secondary rounded-full"></div>
                  Dados da Vistoria Ambiental
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="areaType">Tipo de Área</Label>
                    <Select value={formData.areaType} onValueChange={(value) => updateFormData("areaType", value)}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="app">APP</SelectItem>
                        <SelectItem value="reserva_legal">Reserva Legal</SelectItem>
                        <SelectItem value="uc">UC</SelectItem>
                        <SelectItem value="terreno_urbano">Terreno Urbano</SelectItem>
                        <SelectItem value="desconhecido">Desconhecido</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="affectedArea">Área Atingida (m²)</Label>
                    <Input
                      id="affectedArea"
                      value={formData.affectedArea}
                      onChange={(e) => updateFormData("affectedArea", e.target.value)}
                      placeholder="Ex: 1000"
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Dados Ambientais */}
            {(formData.category === "vistoria_ambiental" || formData.category === "incendio_vegetacao" || formData.category === "risco_vegetacao") && (
              <div className="space-y-4 p-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 rounded-lg border-2 border-primary/20">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <div className="w-1 h-5 bg-secondary rounded-full"></div>
                  Dados Ambientais
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="temperature">Temperatura (°C)</Label>
                    <Input
                      id="temperature"
                      value={formData.temperature}
                      onChange={(e) => updateFormData("temperature", e.target.value)}
                      placeholder="Ex: 25"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="humidity">Umidade (%)</Label>
                    <Input
                      id="humidity"
                      value={formData.humidity}
                      onChange={(e) => updateFormData("humidity", e.target.value)}
                      placeholder="Ex: 60"
                      className="mt-1.5"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Checkbox
                      id="hasWaterBody"
                      checked={formData.hasWaterBody}
                      onCheckedChange={(checked) => updateFormData("hasWaterBody", checked === true)}
                    />
                    <Label htmlFor="hasWaterBody" className="text-sm font-normal cursor-pointer">
                      Presença de Corpo d'Água
                    </Label>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="description">
                Descrição/Caracterização da Situação <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                placeholder="Descreva detalhadamente a situação..."
                rows={4}
                required
                className="mt-1.5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Providências Adotadas */}
        <Card className="shadow-sm bg-card border border-border/50">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
              Providências Adotadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-3 block">Ações da Equipe</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {teamActionsList.map((action) => (
                  <div key={action} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted transition-colors">
                    <Checkbox
                      id={action}
                      checked={formData.teamActions.includes(action)}
                      onCheckedChange={() => toggleArrayField("teamActions", action)}
                    />
                    <Label htmlFor={action} className="text-sm font-normal cursor-pointer">{action}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Acionamento de Órgãos</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {organisms.map((organism) => (
                  <div key={organism} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted transition-colors">
                    <Checkbox
                      id={organism}
                      checked={formData.activatedOrganisms.includes(organism)}
                      onCheckedChange={() => toggleArrayField("activatedOrganisms", organism)}
                    />
                    <Label htmlFor={organism} className="text-sm font-normal cursor-pointer">{organism}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Relato Detalhado */}
        <Card className="shadow-sm bg-card border border-border/50">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
              Relato e Observações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="detailedReport">Relato Detalhado do Atendimento</Label>
              <Textarea
                id="detailedReport"
                value={formData.detailedReport}
                onChange={(e) => updateFormData("detailedReport", e.target.value)}
                placeholder="Descreva detalhadamente o atendimento realizado..."
                rows={5}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="observations">Observações / Pendências</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => updateFormData("observations", e.target.value)}
                placeholder="Observações adicionais ou pendências..."
                rows={4}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="responsibleAgents">Agentes Responsáveis</Label>
              <Input
                id="responsibleAgents"
                value={formData.responsibleAgents}
                onChange={(e) => updateFormData("responsibleAgents", e.target.value)}
                placeholder="Nome dos agentes responsáveis pelo atendimento"
                className="mt-1.5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border/50">
          <Button type="button" variant="outline" onClick={onBack} size="lg">
            Cancelar
          </Button>
          <Button 
            type="submit"
            disabled={isLoading || formProgress < 100}
            size="lg"
            
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Salvando..." : "Salvar Ocorrência"}
          </Button>
        </div>
      </form>
    </div>
  );
}