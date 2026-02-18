import { cn } from "@/app/components/ui/utils";
import { Button } from "@/app/components/ui/button";
import { 
  LogOut, 
  LayoutGrid, 
  Users,
  Building2,
  ScrollText,
  Briefcase,
  FilePlus,
  ShieldCheck,
  UserCog
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export type SidebarView = 'reports' | 'register_report' | 'workspaces' | 'clients' | 'users' | 'logs' | 'profile';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: SidebarView) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { logout, user } = useAuth();

  const handleNavigation = (view: SidebarView) => {
    onViewChange(view);
  };

  const isAdmin = user?.role === 'admin';

  const NavItem = ({ id, label, icon: Icon }: { id: SidebarView, label: string, icon: any }) => {
    const isActive = activeView === id;
    return (
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start mb-1 transition-all duration-300 h-10 border border-transparent",
          isActive 
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/20 hover:from-blue-500 hover:to-indigo-500 border-blue-500/20" 
            : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
        )}
        onClick={() => handleNavigation(id)}
      >
        <Icon className={cn("w-4 h-4 mr-3", isActive ? "text-white" : "text-slate-500")} />
        <span className="text-sm font-medium">{label}</span>
      </Button>
    );
  };

  return (
    <aside className="w-72 bg-slate-950 text-slate-300 flex flex-col h-screen transition-all duration-300 shadow-2xl z-50 border-r border-slate-900">
      
      <div className="px-6 pt-8 pb-6 flex flex-col items-start">
        <img 
          src="/images/logo-color.png" 
          alt="Data Hub Logo" 
          className="w-48 h-auto object-contain mb-4 opacity-100" 
        />

        <div className="flex items-center gap-2 pl-1">
          <div className="h-1 w-1 rounded-full bg-blue-500"></div>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
            Inteligência e Inovação
          </p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar space-y-8">
        <div>
          <p className="px-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
            <LayoutGrid className="w-3 h-3" />
            Operacional
          </p>
          <div className="space-y-1">
            <NavItem id="reports" label="Meus Relatórios" icon={LayoutGrid} />
          </div>
        </div>

        {isAdmin && (
          <div className="animate-in fade-in slide-in-from-left-5 duration-300">
            <p className="px-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2 mt-6">
              <ShieldCheck className="w-3 h-3" />
              Administração
            </p>
            <div className="space-y-1">
              <NavItem id="register_report" label="Cadastro de Relatório" icon={FilePlus} />
              <NavItem id="workspaces" label="Workspaces Power BI" icon={Briefcase} />
              <NavItem id="clients" label="Clientes e Grupos" icon={Building2} />
              <NavItem id="users" label="Gerenciar Usuários" icon={Users} />
              <NavItem id="logs" label="Logs de Acesso" icon={ScrollText} />
            </div>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-900 bg-slate-900/30 backdrop-blur-sm">
        <div 
           className={cn(
             "flex items-center gap-3 mb-4 px-2 py-2 rounded-lg cursor-pointer transition-colors group border border-transparent",
             activeView === 'profile' ? "bg-slate-800 border-slate-700" : "hover:bg-slate-900 hover:border-slate-800"
           )}
           onClick={() => handleNavigation('profile')}
           title="Acessar meu perfil"
        >
          <div className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border transition-all shadow-lg",
            isAdmin 
              ? "bg-gradient-to-br from-blue-900 to-slate-900 border-blue-700/30 text-blue-400" 
              : "bg-gradient-to-br from-emerald-900 to-slate-900 border-emerald-700/30 text-emerald-400"
          )}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className={cn(
               "text-sm font-medium truncate transition-colors",
               activeView === 'profile' ? "text-white" : "text-slate-300 group-hover:text-white"
            )}>
              {user?.name || 'Usuário'}
            </p>
            <p className="text-xs text-slate-500 truncate capitalize flex items-center gap-1 group-hover:text-slate-400">
               {user?.role === 'admin' ? 'Administrador' : user?.company_name?.toUpperCase()}
            </p>
          </div>
          <UserCog className="w-4 h-4 text-slate-600 group-hover:text-blue-500 transition-colors" />
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start text-slate-500 hover:text-red-400 hover:bg-red-950/10 transition-colors h-9"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span className="text-sm">Sair do Sistema</span>
        </Button>
      </div>
    </aside>
  );
}