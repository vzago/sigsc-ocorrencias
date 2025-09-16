import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { LoginForm } from "@/components/auth/LoginForm";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { OccurrenceForm } from "@/components/forms/OccurrenceForm";
import { OccurrenceDetails } from "@/components/occurrence/OccurrenceDetails";

type User = {
  name: string;
  username: string;
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
};

type View = "dashboard" | "new-occurrence" | "view-occurrence" | "edit-occurrence";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null);

  const handleLogin = (credentials: { username: string; password: string }) => {
    setUser({
      name: "Administrador",
      username: credentials.username
    });
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView("dashboard");
    setSelectedOccurrence(null);
  };

  const handleNewOccurrence = () => {
    setCurrentView("new-occurrence");
  };

  const handleViewOccurrence = (occurrence: Occurrence) => {
    setSelectedOccurrence(occurrence);
    setCurrentView("view-occurrence");
  };

  const handleSaveOccurrence = (data: any) => {
    // Em uma aplicação real, isso salvaria no backend
    console.log("Salvando ocorrência:", data);
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
          />
        )}
      </main>
    </div>
  );
};

export default Index;
