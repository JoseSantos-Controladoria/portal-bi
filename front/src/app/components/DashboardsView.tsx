import { useState, useEffect } from "react";
import { Dashboard, Company } from "@/types";
import { 
  Search, 
  BarChart3, 
  ArrowUpRight, 
  Clock,
  Heart,
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashboardsViewProps {
  dashboards: Dashboard[];
  companies: Company[]; 
  onViewReport: (id: string) => void;
}

export function DashboardsView({ dashboards, companies, onViewReport }: DashboardsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboard_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('dashboard_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  };

  const filteredDashboards = dashboards.filter(dashboard => {
    const matchesSearch = dashboard.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          dashboard.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = selectedCompanyId === "all" || dashboard.company_id === selectedCompanyId;
    
    return matchesSearch && matchesCompany;
  });

  const sortedDashboards = [...filteredDashboards].sort((a, b) => {
    const isFavA = favorites.includes(a.id);
    const isFavB = favorites.includes(b.id);
    if (isFavA && !isFavB) return -1;
    if (!isFavA && isFavB) return 1;
    return 0;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header com Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#2563EB]" />
            Relatórios
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Visualize os indicadores de performance.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          {/* Filtro de Cliente (Novo) */}
          <div className="w-full md:w-48">
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <div className="flex items-center gap-2 text-slate-500">
                  <Filter className="w-3.5 h-3.5" />
                  <SelectValue placeholder="Filtrar Cliente" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Clientes</SelectItem>
                {companies.map(company => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Input de Busca */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar relatório..."
              className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Grid de Resultados */}
      {sortedDashboards.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedDashboards.map((dashboard) => {
            const isFavorite = favorites.includes(dashboard.id);
            const companyName = companies.find(c => c.id === dashboard.company_id)?.name;

            return (
              <Card 
                key={dashboard.id} 
                className={`group hover:shadow-lg transition-all duration-300 border-slate-200 cursor-pointer overflow-hidden ${isFavorite ? 'ring-2 ring-blue-100 border-blue-200' : ''}`}
                onClick={() => onViewReport(dashboard.id)}
              >
                <div className={`h-2 w-full origin-left transition-all duration-500 ${isFavorite ? 'bg-amber-400 scale-x-100' : 'bg-[#2563EB] scale-x-0 group-hover:scale-x-100'}`} />
                
                <CardHeader className="pb-3 relative">
                  {/* Botão Favoritar (Novo) */}
                  <button 
                    onClick={(e) => toggleFavorite(dashboard.id, e)}
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
                    {dashboard.title}
                  </CardTitle>
                  
                  <div className="flex items-center gap-2 mt-2">
                    {companyName && (
                      <Badge variant="outline" className="text-xs font-normal text-slate-500">
                        {companyName}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-xs">
                      Power BI
                    </Badge>
                  </div>
                  
                  <CardDescription className="line-clamp-2 text-sm mt-2 min-h-[40px]">
                    {dashboard.description}
                  </CardDescription>
                </CardHeader>
                
                <CardFooter className="pt-0 flex items-center justify-between text-xs text-slate-400 border-t border-slate-50 mt-4 p-4 bg-slate-50/50">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {dashboard.last_updated 
                        ? format(new Date(dashboard.last_updated), "d 'de' MMM", { locale: ptBR })
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
          <h3 className="text-lg font-medium text-slate-900">Nenhum relatório encontrado</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">
            Tente ajustar os filtros ou buscar por outro termo.
          </p>
          <Button 
            variant="link" 
            className="mt-4 text-[#2563EB]"
            onClick={() => { setSearchTerm(""); setSelectedCompanyId("all"); }}
          >
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
}