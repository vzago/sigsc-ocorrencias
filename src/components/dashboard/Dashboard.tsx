import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Filter, Eye, FileText, AlertTriangle, Flame, TreePine, Building2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ReportsSection } from "@/components/reports/ReportsSection";
import { occurrencesApi } from "@/services/occurrences.service";
import { Occurrence as ApiOccurrence, OccurrenceStatus, OccurrenceCategory, FilterOccurrenceDto } from "@/types/occurrence.types";
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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState({ total: 0, aberta: 0, andamento: 0, fechada: 0 });
  const { toast } = useToast();

  const loadStats = useCallback(async () => {
    try {
      const [abertaRes, andamentoRes, fechadaRes, totalRes] = await Promise.all([
        occurrencesApi.getAll({ status: OccurrenceStatus.ABERTA, limit: 1 }),
        occurrencesApi.getAll({ status: OccurrenceStatus.ANDAMENTO, limit: 1 }),
        occurrencesApi.getAll({ status: OccurrenceStatus.FECHADA, limit: 1 }),
        occurrencesApi.getAll({ limit: 1 }),
      ]);
      
      setStats({
        total: totalRes.total,
        aberta: abertaRes.total,
        andamento: andamentoRes.total,
        fechada: fechadaRes.total,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  }, []);

  const loadOccurrences = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: FilterOccurrenceDto = {
        page,
        limit,
      };
      
      if (statusFilter !== "all") {
        filters.status = statusFilter as OccurrenceStatus;
      }
      if (categoryFilter !== "all") {
        filters.category = categoryFilter as OccurrenceCategory;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }

      const response = await occurrencesApi.getAll(filters);
      const convertedOccurrences = Array.isArray(response.data)
        ? response.data.map(convertApiOccurrenceToDashboard)
        : [];
      setOccurrences(convertedOccurrences);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Não foi possível carregar as ocorrências.";
      toast({
        title: "Erro ao carregar ocorrências",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, categoryFilter, page, limit, searchTerm, toast]);

  useEffect(() => {
    loadOccurrences();
    loadStats();
  }, [refreshTrigger, loadOccurrences, loadStats]);

  useEffect(() => {
    loadOccurrences();
  }, [loadOccurrences]);

  const handleSearch = () => {
    setPage(1);
    loadOccurrences();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow bg-card border border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total de Ocorrências</p>
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-destructive hover:shadow-lg transition-shadow bg-card border border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Abertas</p>
                <p className="text-3xl font-bold text-foreground">{stats.aberta}</p>
                {stats.total > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((stats.aberta / stats.total) * 100)}% do total
                  </p>
                )}
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-warning hover:shadow-lg transition-shadow bg-card border border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Em Andamento</p>
                <p className="text-3xl font-bold text-foreground">{stats.andamento}</p>
                {stats.total > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((stats.andamento / stats.total) * 100)}% do total
                  </p>
                )}
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-warning/10 rounded-lg">
                <Flame className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-success hover:shadow-lg transition-shadow bg-card border border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Fechadas</p>
                <p className="text-3xl font-bold text-foreground">{stats.fechada}</p>
                {stats.total > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((stats.fechada / stats.total) * 100)}% do total
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
        <div className="border-b-2 border-border/60 mb-8 bg-card/50 px-4 py-2 rounded-t-lg">
          <TabsList className="inline-flex h-14 items-center justify-start rounded-none bg-transparent p-0 w-auto gap-2">
            <TabsTrigger 
              value="dashboard"
              className="rounded-md border-0 bg-transparent px-8 py-3 text-base font-semibold text-muted-foreground transition-all hover:text-foreground hover:bg-muted/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
            >
              Painel de Ocorrências
            </TabsTrigger>
            <TabsTrigger 
              value="reports"
              className="rounded-md border-0 bg-transparent px-8 py-3 text-base font-semibold text-muted-foreground transition-all hover:text-foreground hover:bg-muted/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
            >
              Relatórios
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="dashboard" className="space-y-6 mt-0">
          {/* Actions and Filters */}
          <Card className="shadow-sm bg-card border border-border/50">
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
                    <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
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
                    <Select value={categoryFilter} onValueChange={(value) => { setCategoryFilter(value); setPage(1); }}>
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

              {/* Occurrences Table */}
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                    <p className="text-sm text-muted-foreground">Carregando ocorrências...</p>
                  </div>
                ) : occurrences.length > 0 ? (
                  <>
                    <div className="rounded-md border border-border/50">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[120px]">R.A.</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Data/Hora</TableHead>
                            <TableHead>Endereço</TableHead>
                            <TableHead>Solicitante</TableHead>
                            <TableHead className="w-[100px] text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {occurrences.map((occurrence) => {
                            const CategoryIcon = categoryIcons[occurrence.category];
                            return (
                              <TableRow 
                                key={occurrence.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => onViewOccurrence(occurrence)}
                              >
                                <TableCell className="font-semibold">R.A. {occurrence.ra}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <CategoryIcon className="w-4 h-4 text-primary" />
                                    <span>{categoryLabels[occurrence.category]}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={statusColors[occurrence.status]} className="text-xs">
                                    {statusLabels[occurrence.status]}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {occurrence.dateTime}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                                  {occurrence.address}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {occurrence.requester}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onViewOccurrence(occurrence);
                                    }}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                          Mostrando {((page - 1) * limit) + 1} a {Math.min(page * limit, total)} de {total} ocorrências
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="items-per-page" className="text-sm text-muted-foreground whitespace-nowrap">
                            Itens por página:
                          </Label>
                          <Select
                            value={limit.toString()}
                            onValueChange={(value) => {
                              setLimit(Number(value));
                              setPage(1);
                            }}
                          >
                            <SelectTrigger id="items-per-page" className="w-[80px] h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="20">20</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                              <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {totalPages > 1 && (
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                onClick={() => page > 1 && handlePageChange(page - 1)}
                                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                              if (
                                pageNum === 1 ||
                                pageNum === totalPages ||
                                (pageNum >= page - 1 && pageNum <= page + 1)
                              ) {
                                return (
                                  <PaginationItem key={pageNum}>
                                    <PaginationLink
                                      onClick={() => handlePageChange(pageNum)}
                                      isActive={pageNum === page}
                                      className="cursor-pointer"
                                    >
                                      {pageNum}
                                    </PaginationLink>
                                  </PaginationItem>
                                );
                              } else if (pageNum === page - 2 || pageNum === page + 2) {
                                return (
                                  <PaginationItem key={pageNum}>
                                    <span className="px-2">...</span>
                                  </PaginationItem>
                                );
                              }
                              return null;
                            })}
                            <PaginationItem>
                              <PaginationNext 
                                onClick={() => page < totalPages && handlePageChange(page + 1)}
                                className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      )}
                    </div>
                  </>
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
        
        <TabsContent value="reports" className="mt-0">
          <ReportsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
