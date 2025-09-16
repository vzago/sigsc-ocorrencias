import { Button } from "@/components/ui/button";
import { LogOut, Shield } from "lucide-react";

interface HeaderProps {
  user?: { name: string };
  onLogout?: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary to-primary-variant rounded-lg">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">SiG-DC São Carlos</h1>
              <p className="text-sm text-muted-foreground">Sistema de Registro de Ocorrências</p>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Olá, <span className="font-medium text-foreground">{user.name}</span>
              </span>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}