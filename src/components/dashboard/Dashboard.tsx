import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Eye, FileText, AlertTriangle, Flame, TreePine, Building2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
}

const mockOccurrences: Occurrence[] = [
  {
    id: "1",
    ra: "2025-001",
    dateTime: "2025-01-15 14:30",
    category: "incendio_vegetacao",
    status: "aberta",
    address: "Rua das Flores, 123 - Centro",
    requester: "João Silva",
    description: "Incêndio em área de mata próxima a residências"
  },
  {
    id: "2", 
    ra: "2025-002",
    dateTime: "2025-01-15 09:15",
    category: "risco_vegetacao",
    status: "andamento",
    address: "Av. São Carlos, 456 - Vila Prado",
    requester: "Maria Santos",
    description: "Árvore com risco de queda sobre via pública"
  },
  {
    id: "3",
    ra: "2025-003", 
    dateTime: "2025-01-14 16:45",
    category: "vistoria_ambiental",
    status: "fechada",
    address: "Rua do Meio, 789 - Jardim Paulista",
    requester: "Pedro Costa",
    description: "Solicitação de vistoria em área de preservação"
  }
];

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

export function Dashboard({ onNewOccurrence, onViewOccurrence }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredOccurrences = mockOccurrences.filter(occurrence => {
    const matchesSearch = searchTerm === "" || 
      occurrence.ra.toLowerCase().includes(searchTerm.toLowerCase()) ||
      occurrence.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      occurrence.requester.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || occurrence.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || occurrence.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{mockOccurrences.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Abertas</p>
                <p className="text-2xl font-bold">{mockOccurrences.filter(o => o.status === 'aberta').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Flame className="h-8 w-8 text-warning" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold">{mockOccurrences.filter(o => o.status === 'andamento').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TreePine className="h-8 w-8 text-success" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Fechadas</p>
                <p className="text-2xl font-bold">{mockOccurrences.filter(o => o.status === 'fechada').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Registro de Ocorrências</CardTitle>
              <CardDescription>Gerencie todas as ocorrências registradas</CardDescription>
            </div>
            <Button 
              onClick={onNewOccurrence}
              className="bg-gradient-to-r from-primary to-primary-variant hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Ocorrência
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por R.A., endereço ou solicitante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="aberta">Aberta</SelectItem>
                <SelectItem value="andamento">Em Andamento</SelectItem>
                <SelectItem value="fechada">Fechada</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por categoria" />
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

          {/* Occurrences List */}
          <div className="space-y-4">
            {filteredOccurrences.map((occurrence) => {
              const CategoryIcon = categoryIcons[occurrence.category];
              return (
                <Card key={occurrence.id} className="hover:shadow-card transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
                          <CategoryIcon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">R.A. {occurrence.ra}</span>
                            <Badge variant={statusColors[occurrence.status]}>
                              {statusLabels[occurrence.status]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{occurrence.dateTime}</p>
                          <p className="text-sm font-medium">{categoryLabels[occurrence.category]}</p>
                          <p className="text-sm text-muted-foreground">{occurrence.address}</p>
                          <p className="text-sm text-muted-foreground">Solicitante: {occurrence.requester}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewOccurrence(occurrence)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {filteredOccurrences.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma ocorrência encontrada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}