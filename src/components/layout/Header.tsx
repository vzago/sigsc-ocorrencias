import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Logo from "@/resources/Logo.svg";

interface HeaderProps {
  user?: { name: string };
  onLogout?: () => void;
  onLogoClick?: () => void;
}

export function Header({ user, onLogout, onLogoClick }: HeaderProps) {


  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onLogoClick}
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary to-primary-variant rounded-lg shadow-sm">
              <img src={Logo} alt="Logo" className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">SiG-DC São Carlos</h1>
              <p className="text-xs text-muted-foreground">Sistema de Registro de Ocorrências</p>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-xs text-muted-foreground">Usuário</p>
                <p className="text-sm font-medium text-foreground">{user.name}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onLogout}
                className="hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}