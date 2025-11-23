import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { OccurrenceDetails } from "@/components/occurrence/OccurrenceDetails";
import { useNavigate, useParams } from "react-router-dom";
import { removeAuthToken, getAuthToken } from "@/config/api.config";
import { authApi } from "@/services/auth.service";
import { occurrencesApi } from "@/services/occurrences.service";
import type { Occurrence as ApiOccurrence } from "@/types/occurrence.types";
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
  endDateTime?: string;
  category: "vistoria_ambiental" | "risco_vegetacao" | "incendio_vegetacao" | "outras";
  status: "aberta" | "andamento" | "fechada";
  address: string;
  addressNumber?: string;
  neighborhood?: string;
  reference?: string;
  requester: string;
  institution?: string;
  description: string;
  sspdsNumber?: string;
  phone?: string;
  latitude?: string;
  longitude?: string;
  altitude?: string;
  origins?: string[];
  cobradeCode?: string;
  isConfidential?: boolean;
  subcategory?: string;
  areaType?: string;
  affectedArea?: string;
  temperature?: string;
  humidity?: string;
  hasWaterBody?: boolean;
  impactType?: string;
  impactMagnitude?: string;
  teamActions?: string[];
  activatedOrganisms?: string[];
  vehicles?: string[];
  materials?: string;
  detailedReport?: string;
  observations?: string;
  responsibleAgents?: string;
  startDateTimeIso?: string;
};

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

  return {
    id: apiOccurrence.id,
    ra: apiOccurrence.raNumber,
    dateTime: formatDateTime(apiOccurrence.startDateTime),
    endDateTime: formatDateTime(apiOccurrence.endDateTime),
    category: apiOccurrence.category as Occurrence["category"],
    status: apiOccurrence.status as Occurrence["status"],
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
    startDateTimeIso: apiOccurrence.startDateTime
      ? (typeof apiOccurrence.startDateTime === 'string' ? apiOccurrence.startDateTime : apiOccurrence.startDateTime.toISOString())
      : new Date().toISOString(),
  };
};

const OccurrenceDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [occurrence, setOccurrence] = useState<Occurrence | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const restoreSession = async () => {
      const token = getAuthToken();
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const userData = await authApi.getCurrentUser();
        setUser(userData);

        if (id) {
          const occurrenceData = await occurrencesApi.getById(id);
          setOccurrence(convertApiOccurrenceToDetails(occurrenceData));
        }
      } catch {
        removeAuthToken();
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [id, navigate]);

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
    navigate("/login");
  };

  const handleStatusChange = (updatedOccurrence: Occurrence) => {
    setOccurrence(updatedOccurrence);
    toast({
      title: "Sucesso",
      description: "Status da ocorrência atualizado!",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || !occurrence) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header user={user} onLogout={handleLogout} />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OccurrenceDetails
          occurrence={occurrence}
          onBack={() => navigate("/")}
          onStatusChange={handleStatusChange}
        />
      </main>
    </div>
  );
};

export default OccurrenceDetailsPage;
