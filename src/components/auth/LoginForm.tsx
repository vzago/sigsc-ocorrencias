import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/services/auth.service";
import { setAuthToken } from "@/config/api.config";

interface LoginFormProps {
  onLogin: (user: { id: string; username: string; name: string; email: string }) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await authApi.login({ username, password });
      setAuthToken(response.access_token);
      onLogin(response.user);
      
      toast({
        title: "Sucesso",
        description: `Bem-vindo, ${response.user.name}!`,
      });
    } catch (error) {
      toast({
        title: "Erro de autenticação",
        description: error instanceof Error ? error.message : "Usuário ou senha inválidos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-primary-variant rounded-full shadow-md">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">SiG-DC São Carlos</CardTitle>
          <CardDescription className="mt-2">
            Sistema de Registro Digital de Ocorrências da Defesa Civil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">Usuário</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                required
                className="h-11"
                autoComplete="username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                  className="h-11 pr-10"
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-primary to-primary-variant hover:opacity-90 transition-all duration-300 shadow-md"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          
          <div className="pt-4 text-center text-sm text-muted-foreground border-t">
            Faça login com suas credenciais de acesso
          </div>
        </CardContent>
      </Card>
    </div>
  );
}