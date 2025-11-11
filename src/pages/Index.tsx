import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { LoginForm } from "@/components/auth/LoginForm";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { OccurrenceForm } from "@/components/forms/OccurrenceForm";
import { OccurrenceDetails } from "@/components/occurrence/OccurrenceDetails";
import { removeAuthToken } from "@/config/api.config";
import { occurrencesApi } from "@/services/occurrences.service";
import { Occurrence as ApiOccurrence } from "@/types/occurrence.types";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: string;
  name: string;
  username: string;
  email: string;
};

type Occurrence = {
  id: string;
  ra: string;
  dateTime: string;
  category: "vistoria_ambiental" | "risco_vegetacao" | "incendio_vegetacao" | "outras";
  status: "aberta" | "andamento" | "fechada";
  address: string;
  requester: string;
  description: string;
  sspdsNumber?: string;
  phone?: string;
  latitude?: string;
  longitude?: string;
  detailedReport?: string;
  observations?: string;
  responsibleAgents?: string;
};

type View = "dashboard" | "new-occurrence" | "view-occurrence" | "edit-occurrence";

const convertApiOccurrenceToDetails = (apiOccurrence: ApiOccurrence): Occurrence => {
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
    sspdsNumber: apiOccurrence.sspdsNumber,
    phone: apiOccurrence.phone,
    latitude: apiOccurrence.location?.latitude?.toString(),
    longitude: apiOccurrence.location?.longitude?.toString(),
    detailedReport: apiOccurrence.detailedReport,
    observations: apiOccurrence.observations,
    responsibleAgents: apiOccurrence.responsibleAgents,
  };
};

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  const handleLogin = (user: User) => {
    setUser(user);
  };

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
    setCurrentView("dashboard");
    setSelectedOccurrence(null);
  };

  const handleNewOccurrence = () => {
    setCurrentView("new-occurrence");
  };

  const handleViewOccurrence = async (occurrence: Occurrence) => {
    try {
      const fullOccurrence = await occurrencesApi.getById(occurrence.id);
      const convertedOccurrence = convertApiOccurrenceToDetails(fullOccurrence);
      setSelectedOccurrence(convertedOccurrence);
      setCurrentView("view-occurrence");
    } catch (error: any) {
      toast({
        title: "Erro ao carregar ocorrência",
        description: error.message || "Não foi possível carregar os detalhes da ocorrência.",
        variant: "destructive",
      });
    }
  };

  const handleSaveOccurrence = (data: any) => {
    console.log("Ocorrência salva:", data);
    setRefreshTrigger(prev => prev + 1);
    setCurrentView("dashboard");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setSelectedOccurrence(null);
  };

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={handleLogout} />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "dashboard" && (
          <Dashboard 
            onNewOccurrence={handleNewOccurrence}
            onViewOccurrence={handleViewOccurrence}
            refreshTrigger={refreshTrigger}
          />
        )}
        
        {currentView === "new-occurrence" && (
          <OccurrenceForm 
            onBack={handleBackToDashboard}
            onSave={handleSaveOccurrence}
          />
        )}
        
        {currentView === "view-occurrence" && selectedOccurrence && (
          <OccurrenceDetails 
            occurrence={selectedOccurrence}
            onBack={handleBackToDashboard}
            onStatusChange={(updatedOccurrence) => {
              setSelectedOccurrence(updatedOccurrence);
              setRefreshTrigger(prev => prev + 1);
            }}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
