import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { LoginForm } from "@/components/auth/LoginForm";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { OccurrenceForm } from "@/components/forms/OccurrenceForm";
import { OccurrenceDetails } from "@/components/occurrence/OccurrenceDetails";
import { removeAuthToken, getAuthToken } from "@/config/api.config";
import { occurrencesApi } from "@/services/occurrences.service";
import { authApi } from "@/services/auth.service";
import { Occurrence as ApiOccurrence, OccurrenceDisplay } from "@/types/occurrence.types";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: string;
  name: string;
  username: string;
  email: string;
};

type View = "dashboard" | "new-occurrence" | "view-occurrence" | "edit-occurrence";

const convertApiOccurrenceToDetails = (apiOccurrence: ApiOccurrence): OccurrenceDisplay => {
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
    endDateTime: formatDateTime(apiOccurrence.endDateTime),
    category: apiOccurrence.category as OccurrenceDisplay["category"],
    status: apiOccurrence.status as OccurrenceDisplay["status"],
    address: apiOccurrence.location?.address || "",
    addressNumber: apiOccurrence.location?.number,
    neighborhood: apiOccurrence.location?.neighborhood,
    reference: apiOccurrence.location?.reference,
    requester: apiOccurrence.requesterName,
    institution: apiOccurrence.institution,
    description: apiOccurrence.description,
    sspdsNumber: apiOccurrence.sspdsNumber,
    phone: apiOccurrence.phone,
    latitude: apiOccurrence.location?.latitude?.toString(),
    longitude: apiOccurrence.location?.longitude?.toString(),
    altitude: apiOccurrence.location?.altitude?.toString(),
    origins: apiOccurrence.origins,
    cobradeCode: apiOccurrence.cobradeCode,
    isConfidential: apiOccurrence.isConfidential,
    subcategory: apiOccurrence.subcategory,
    areaType: apiOccurrence.areaType,
    affectedArea: apiOccurrence.affectedArea,
    temperature: apiOccurrence.temperature,
    humidity: apiOccurrence.humidity,
    hasWaterBody: apiOccurrence.hasWaterBody,
    impactType: apiOccurrence.impactType,
    impactMagnitude: apiOccurrence.impactMagnitude,
    teamActions: apiOccurrence.actions?.filter(a => a.teamAction).map(a => a.teamAction!),
    activatedOrganisms: apiOccurrence.actions?.filter(a => a.activatedOrganism).map(a => a.activatedOrganism!),
    vehicles: apiOccurrence.resources?.filter(r => r.vehicle).map(r => r.vehicle!),
    materials: apiOccurrence.resources?.find(r => r.materials)?.materials,
    detailedReport: apiOccurrence.detailedReport,
    observations: apiOccurrence.observations,
    responsibleAgents: apiOccurrence.responsibleAgents,
  };
};

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [selectedOccurrence, setSelectedOccurrence] = useState<OccurrenceDisplay | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const restoreSession = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const userData = await authApi.getCurrentUser();
          setUser(userData);
        } catch (error) {
          removeAuthToken();
        }
      }
      setIsLoadingAuth(false);
    };

    restoreSession();
  }, []);

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

  const handleViewOccurrence = async (occurrence: OccurrenceDisplay) => {
    try {
      const fullOccurrence = await occurrencesApi.getById(occurrence.id);
      const convertedOccurrence = convertApiOccurrenceToDetails(fullOccurrence);
      setSelectedOccurrence(convertedOccurrence);
      setCurrentView("view-occurrence");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Não foi possível carregar os detalhes da ocorrência.";
      toast({
        title: "Erro ao carregar ocorrência",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleSaveOccurrence = (data: ApiOccurrence) => {
    console.log("Ocorrência salva:", data);
    setRefreshTrigger(prev => prev + 1);
    setCurrentView("dashboard");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setSelectedOccurrence(null);
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header user={user} onLogout={handleLogout} onLogoClick={handleBackToDashboard}/>
      
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
