import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { reportService } from "@/services/reportService";
import { 
  Search, 
  BarChart3, 
  ArrowUpRight, 
  Clock,
  Heart,
  Layout,
  Filter
} from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface ClientDashboardProps {
  onViewReport: (report: any) => void;
}

export function ClientDashboard({ onViewReport }: ClientDashboardProps) {
  const { user } = useAuth();

  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("all");
  const [workspaces, setWorkspaces] = useState<string[]>([]);

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboard_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('dashboard_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const fetchReports = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const data = await reportService.getMyReports(user.id);
        setReports(data);

        const uniqueWorkspaces = Array.from(new Set(data.map((r: any) => r.workspace_name).filter(Boolean)));
        setWorkspaces(uniqueWorkspaces as string[]);

      } catch (error) {
        console.error("Erro ao buscar relatórios:", error);
        toast.error("Não foi possível carregar seus relatórios.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [user?.id]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          report.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWorkspace = selectedWorkspace === "all" || report.workspace_name === selectedWorkspace;
    return matchesSearch && matchesWorkspace;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    const isFavA = favorites.includes(String(a.id));
    const isFavB = favorites.includes(String(b.id));
    if (isFavA && !isFavB) return -1;
    if (!isFavA && isFavB) return 1;
    return 0;
  });

  if (isLoading) {
     return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
           <div className="flex flex-col gap-2 mb-8">
              <Skeleton className="h-10 w-96" />
              <Skeleton className="h-6 w-64" />
           </div>
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-[220px] rounded-xl" />)}
           </div>
        </div>
     )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500 space-y-8">
      
      {/* HEADER DESTAQUE: Bem-vindo */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            Bem-vindo, {user?.name}
          </h1>
          <p className="text-slate-500 text-lg">
            Aqui estão seus indicadores e relatórios de performance.
          </p>
        </div>

        {/* BARRA DE FERRAMENTAS */}
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            
            {/* Filtro de Workspace */}
            <div className="w-full md:w-48">
              <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
                <SelectTrigger className="border-0 bg-transparent hover:bg-slate-50 focus:ring-0">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Filter className="w-4 h-4" />
                    <SelectValue placeholder="Filtrar Área" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Áreas</SelectItem>
                  {workspaces.map(ws => (
                    <SelectItem key={ws} value={ws}>
                      {ws}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden md:block" />

            {/* Input de Busca */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar relatório..."
                className="pl-9 border-0 bg-transparent focus-visible:ring-0 placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
        </div>
      </div>

      {/* Grid de Resultados */}
      {sortedReports.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedReports.map((report) => {
            const reportIdStr = String(report.id);
            const isFavorite = favorites.includes(reportIdStr);

            return (
              <Card 
                key={report.id} 
                className={`group hover:shadow-lg transition-all duration-300 border-slate-200 cursor-pointer overflow-hidden bg-white ${isFavorite ? 'ring-2 ring-blue-100 border-blue-200' : ''}`}
                onClick={() => onViewReport(report)}
              >
                <div className={`h-2 w-full origin-left transition-all duration-500 ${isFavorite ? 'bg-amber-400 scale-x-100' : 'bg-[#2563EB] scale-x-0 group-hover:scale-x-100'}`} />
                
                <CardHeader className="pb-3 relative">
                  <button 
                    onClick={(e) => toggleFavorite(reportIdStr, e)}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
                    title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  >
                    <Heart 
                      className={`w-5 h-5 transition-colors duration-300 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-300 hover:text-amber-400'}`} 
                    />
                  </button>

                  <div className="flex justify-between items-start mb-2 pr-8">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg font-bold text-slate-800 leading-tight group-hover:text-[#2563EB] transition-colors pr-6">
                    {report.title}
                  </CardTitle>
                  
                  <div className="flex items-center gap-2 mt-2">
                    {report.workspace_name && (
                      <Badge variant="outline" className="text-xs font-normal text-slate-500">
                        {report.workspace_name}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-xs">
                      Power BI
                    </Badge>
                  </div>
                  
                  <CardDescription className="line-clamp-2 text-sm mt-2 min-h-[40px]">
                    {report.description || "Sem descrição disponível."}
                  </CardDescription>
                </CardHeader>
                
                <CardFooter className="pt-0 flex items-center justify-between text-xs text-slate-400 border-t border-slate-50 mt-4 p-4 bg-slate-50/50">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {report.last_update 
                        ? format(new Date(report.last_update), "d 'de' MMM", { locale: ptBR })
                        : 'Data n/d'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[#2563EB] font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                    Abrir
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <div className="mx-auto h-12 w-12 text-slate-300 mb-4">
            <Search className="h-full w-full" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">
            {searchTerm || selectedWorkspace !== "all" ? "Nenhum relatório encontrado" : "Nenhum relatório disponível"}
          </h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">
            {searchTerm || selectedWorkspace !== "all" 
              ? "Tente ajustar os filtros ou buscar por outro termo."
              : "Você ainda não possui relatórios vinculados."}
          </p>
          {(searchTerm || selectedWorkspace !== "all") && (
            <Button 
              variant="link" 
              className="mt-4 text-[#2563EB]"
              onClick={() => { setSearchTerm(""); setSelectedWorkspace("all"); }}
            >
              Limpar filtros
            </Button>
          )}
        </div>
      )}
    </div>
  );
}