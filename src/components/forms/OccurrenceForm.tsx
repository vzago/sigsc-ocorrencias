import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, AlertTriangle, TreePine, Flame, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OccurrenceFormProps {
  onBack: () => void;
  onSave: (data: any) => void;
}

export function OccurrenceForm({ onBack, onSave }: OccurrenceFormProps) {
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

  const { toast } = useToast();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.requesterName || !formData.address) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Gerar R.A. automático
    const now = new Date();
    const year = now.getFullYear();
    const raNumber = `${year}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    const occurrenceData = {
      ...formData,
      raNumber,
      startDateTime: formData.startDateTime || now.toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    };

    onSave(occurrenceData);
    
    toast({
      title: "Sucesso",
      description: `Ocorrência ${raNumber} registrada com sucesso!`,
    });
  };

  const updateFormData = (field: string, value: any) => {
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
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Nova Ocorrência</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cabeçalho */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Gerais</CardTitle>
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
                />
              </div>
              <div>
                <Label htmlFor="startDateTime">Data/Hora Início *</Label>
                <Input
                  id="startDateTime"
                  type="datetime-local"
                  value={formData.startDateTime}
                  onChange={(e) => updateFormData("startDateTime", e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label>Origem do Chamado</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {origins.map((origin) => (
                  <div key={origin} className="flex items-center space-x-2">
                    <Checkbox
                      id={origin}
                      checked={formData.origins.includes(origin)}
                      onCheckedChange={() => toggleArrayField("origins", origin)}
                    />
                    <Label htmlFor={origin} className="text-sm">{origin}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Localização */}
        <Card>
          <CardHeader>
            <CardTitle>Localização</CardTitle>
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
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  value={formData.longitude}
                  onChange={(e) => updateFormData("longitude", e.target.value)}
                  placeholder="Ex: -47.8908"
                />
              </div>
              <div>
                <Label htmlFor="altitude">Altitude (m)</Label>
                <Input
                  id="altitude"
                  value={formData.altitude}
                  onChange={(e) => updateFormData("altitude", e.target.value)}
                  placeholder="Ex: 856"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="address">Logradouro *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateFormData("address", e.target.value)}
                  placeholder="Ex: Rua das Flores"
                  required
                />
              </div>
              <div>
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => updateFormData("number", e.target.value)}
                  placeholder="Ex: 123"
                />
              </div>
              <div>
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  value={formData.neighborhood}
                  onChange={(e) => updateFormData("neighborhood", e.target.value)}
                  placeholder="Ex: Centro"
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
              />
            </div>
          </CardContent>
        </Card>

        {/* Solicitante */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Solicitante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="requesterName">Nome do Solicitante *</Label>
                <Input
                  id="requesterName"
                  value={formData.requesterName}
                  onChange={(e) => updateFormData("requesterName", e.target.value)}
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="institution">Instituição</Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => updateFormData("institution", e.target.value)}
                  placeholder="Ex: Prefeitura, Empresa, etc."
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
              />
            </div>
          </CardContent>
        </Card>

        {/* Classificação */}
        <Card>
          <CardHeader>
            <CardTitle>Classificação da Ocorrência</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
                <SelectTrigger>
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
              <div className="space-y-4 p-4 bg-muted rounded-lg">
                <h4 className="font-medium">Dados da Vistoria Ambiental</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="areaType">Tipo de Área</Label>
                    <Select value={formData.areaType} onValueChange={(value) => updateFormData("areaType", value)}>
                      <SelectTrigger>
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
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="description">Descrição/Caracterização da Situação *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                placeholder="Descreva detalhadamente a situação..."
                rows={3}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Providências Adotadas */}
        <Card>
          <CardHeader>
            <CardTitle>Providências Adotadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Ações da Equipe</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {teamActionsList.map((action) => (
                  <div key={action} className="flex items-center space-x-2">
                    <Checkbox
                      id={action}
                      checked={formData.teamActions.includes(action)}
                      onCheckedChange={() => toggleArrayField("teamActions", action)}
                    />
                    <Label htmlFor={action} className="text-sm">{action}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Acionamento de Órgãos</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {organisms.map((organism) => (
                  <div key={organism} className="flex items-center space-x-2">
                    <Checkbox
                      id={organism}
                      checked={formData.activatedOrganisms.includes(organism)}
                      onCheckedChange={() => toggleArrayField("activatedOrganisms", organism)}
                    />
                    <Label htmlFor={organism} className="text-sm">{organism}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Relato Detalhado */}
        <Card>
          <CardHeader>
            <CardTitle>Relato e Observações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="detailedReport">Relato Detalhado do Atendimento</Label>
              <Textarea
                id="detailedReport"
                value={formData.detailedReport}
                onChange={(e) => updateFormData("detailedReport", e.target.value)}
                placeholder="Descreva detalhadamente o atendimento realizado..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="observations">Observações / Pendências</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => updateFormData("observations", e.target.value)}
                placeholder="Observações adicionais ou pendências..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="responsibleAgents">Agentes Responsáveis</Label>
              <Input
                id="responsibleAgents"
                value={formData.responsibleAgents}
                onChange={(e) => updateFormData("responsibleAgents", e.target.value)}
                placeholder="Nome dos agentes responsáveis pelo atendimento"
              />
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancelar
          </Button>
          <Button 
            type="submit"
            className="bg-gradient-to-r from-primary to-primary-variant hover:opacity-90"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Ocorrência
          </Button>
        </div>
      </form>
    </div>
  );
}