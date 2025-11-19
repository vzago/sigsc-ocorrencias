import { useState, useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { removeAuthToken, getAuthToken } from "@/config/api.config";
import { authApi } from "@/services/auth.service";
import { useNavigate } from "react-router-dom";

type User = {
  id: string;
  name: string;
  username: string;
  email: string;
};

const LoginPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const restoreSession = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const userData = await authApi.getCurrentUser();
          setUser(userData);
          navigate("/");
        } catch {
          removeAuthToken();
        }
      }
      setIsLoadingAuth(false);
    };

    restoreSession();
  }, [navigate]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    navigate("/");
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

  if (user) {
    return null;
  }

  return <LoginForm onLogin={handleLogin} />;
};

export default LoginPage;
