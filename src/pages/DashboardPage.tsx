import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { useNavigate } from "react-router-dom";
import { removeAuthToken, getAuthToken } from "@/config/api.config";
import { authApi } from "@/services/auth.service";

type User = {
  id: string;
  name: string;
  username: string;
  email: string;
};

const DashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
      } catch {
        removeAuthToken();
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [navigate]);

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
    navigate("/login");
  };

  const handleViewOccurrence = (occurrenceId: string) => {
    navigate(`/occurrences/${occurrenceId}`);
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header user={user} onLogout={handleLogout} />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard 
          onNewOccurrence={() => navigate("/occurrences/new")}
          onViewOccurrence={(occurrence) => handleViewOccurrence(occurrence.id)}
          refreshTrigger={0}
        />
      </main>
    </div>
  );
};

export default DashboardPage;
