import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Filter, Eye, FileText, AlertTriangle, Flame, TreePine, Building2, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportsSection } from "@/components/reports/ReportsSection";
import { occurrencesApi } from "@/services/occurrences.service";
import { Occurrence as ApiOccurrence, OccurrenceStatus, OccurrenceCategory } from "@/types/occurrence.types";
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
}

interface DashboardProps {
  onNewOccurrence: () => void;
  onViewOccurrence: (occurrence: Occurrence) => void;
  refreshTrigger?: number;
}

const convertApiOccurrenceToDashboard = (apiOccurrence: ApiOccurrence): Occurrence => {
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
    category: apiOccurrence.category as Occurrence["category"],
    status: apiOccurrence.status as Occurrence["status"],
    address: formatAddress(apiOccurrence.location),
    requester: apiOccurrence.requesterName,
    description: apiOccurrence.description,
  };
};

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

export function Dashboard({ onNewOccurrence, onViewOccurrence, refreshTrigger }: DashboardProps) {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    loadOccurrences();
  }, [refreshTrigger]);

  const loadOccurrences = async () => {
    setIsLoading(true);
    try {
      const filters: any = {};
      if (statusFilter !== "all") {
        filters.status = statusFilter as OccurrenceStatus;
      }
      if (categoryFilter !== "all") {
        filters.category = categoryFilter as OccurrenceCategory;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }

      const apiOccurrences = await occurrencesApi.getAll(filters);
      const convertedOccurrences = Array.isArray(apiOccurrences)
        ? apiOccurrences.map(convertApiOccurrenceToDashboard)
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

  useEffect(() => {
    loadOccurrences();
  }, [statusFilter, categoryFilter]);

  const handleSearch = () => {
    loadOccurrences();
  };

  const filteredOccurrences = searchTerm 
    ? occurrences.filter(occurrence => {
        const matchesSearch = 
          occurrence.ra.toLowerCase().includes(searchTerm.toLowerCase()) ||
          occurrence.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          occurrence.requester.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      })
    : occurrences;

  const totalOccurrences = occurrences.length;
  const openCount = occurrences.filter(o => o.status === 'aberta').length;
  const inProgressCount = occurrences.filter(o => o.status === 'andamento').length;
  const closedCount = occurrences.filter(o => o.status === 'fechada').length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total de Ocorrências</p>
                <p className="text-3xl font-bold text-foreground">{totalOccurrences}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-destructive hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Abertas</p>
                <p className="text-3xl font-bold text-foreground">{openCount}</p>
                {totalOccurrences > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((openCount / totalOccurrences) * 100)}% do total
                  </p>
                )}
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-warning hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Em Andamento</p>
                <p className="text-3xl font-bold text-foreground">{inProgressCount}</p>
                {totalOccurrences > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((inProgressCount / totalOccurrences) * 100)}% do total
                  </p>
                )}
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-warning/10 rounded-lg">
                <Flame className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-success hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Fechadas</p>
                <p className="text-3xl font-bold text-foreground">{closedCount}</p>
                {totalOccurrences > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((closedCount / totalOccurrences) * 100)}% do total
                  </p>
                )}
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-success/10 rounded-lg">
                <TreePine className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Painel de Ocorrências</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          {/* Actions and Filters */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">Registro de Ocorrências</CardTitle>
                  <CardDescription className="mt-1">Gerencie e acompanhe todas as ocorrências registradas</CardDescription>
                </div>
                <Button 
                  onClick={onNewOccurrence}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary-variant hover:opacity-90 shadow-md"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Ocorrência
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex-1">
                  <Label htmlFor="search" className="text-sm font-medium mb-2 block">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Buscar por R.A., endereço ou solicitante..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-10 h-11"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status-filter" className="text-sm font-medium">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger id="status-filter" className="h-11">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="aberta">Aberta</SelectItem>
                        <SelectItem value="andamento">Em Andamento</SelectItem>
                        <SelectItem value="fechada">Fechada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category-filter" className="text-sm font-medium">Categoria</Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger id="category-filter" className="h-11">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Todas as categorias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as categorias</SelectItem>
                        <SelectItem value="vistoria_ambiental">Vistoria Ambiental</SelectItem>
                        <SelectItem value="risco_vegetacao">Risco - Vegetação/Árvore</SelectItem>
                        <SelectItem value="incendio_vegetacao">Incêndio em Vegetação</SelectItem>
                        <SelectItem value="outras">Outras Ocorrências</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Occurrences List */}
              <div className="space-y-3">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                    <p className="text-sm text-muted-foreground">Carregando ocorrências...</p>
                  </div>
                ) : filteredOccurrences.length > 0 ? (
                  filteredOccurrences.map((occurrence) => {
                    const CategoryIcon = categoryIcons[occurrence.category];
                    return (
                      <Card 
                        key={occurrence.id} 
                        className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary cursor-pointer group"
                        onClick={() => onViewOccurrence(occurrence)}
                      >
                        <CardContent className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                <CategoryIcon className="w-6 h-6 text-primary" />
                              </div>
                              
                              <div className="flex-1 space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-semibold text-lg text-foreground">R.A. {occurrence.ra}</span>
                                  <Badge variant={statusColors[occurrence.status]} className="text-xs">
                                    {statusLabels[occurrence.status]}
                                  </Badge>
                                </div>
                                
                                <div className="space-y-1">
                                  <p className="text-sm font-medium text-foreground">{categoryLabels[occurrence.category]}</p>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <span className="font-medium">Data:</span> {occurrence.dateTime}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">Endereço:</span> {occurrence.address}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">Solicitante:</span> {occurrence.requester}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-end sm:justify-start">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onViewOccurrence(occurrence);
                                }}
                                className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Visualizar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium text-foreground mb-1">Nenhuma ocorrência encontrada</p>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm || statusFilter !== "all" || categoryFilter !== "all" 
                        ? "Tente ajustar os filtros de busca" 
                        : "Comece criando uma nova ocorrência"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <ReportsSection occurrences={filteredOccurrences} />
        </TabsContent>
      </Tabs>
    </div>
  );
}