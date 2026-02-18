import { useState, useEffect } from "react";
import { 
  Search, 
  ArrowLeft,
  BarChart3,
  Users,
  Building2,
  Loader2
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/app/components/ui/card";
import { customerService } from "@/services/customerService";
import { CustomerDashboard } from "@/types";
import { toast } from "sonner";

interface ClientsListProps {
  onBack: () => void;
  onSelectClient: (client: any) => void;
}

export function ClientsList({ onBack }: ClientsListProps) {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<CustomerDashboard[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getDashboardCustomers();
      setCustomers(data);
    } catch (error) {
      toast.error("Erro ao carregar lista de clientes.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(client => 
    client.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 p-1">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-slate-100 -ml-2">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Carteira de Clientes</h1>
            <p className="text-slate-500 text-sm">Visão geral da estrutura e acessos</p>
          </div>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar cliente..."
            className="pl-10 bg-white border-slate-200 focus-visible:ring-blue-600 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid de Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Carregando carteira...</p>
        </div>
      ) : filteredCustomers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((client) => {
            const activeReports = Number(client.qty_report);

            return (
              <Card 
                key={client.customer_id} 
                className="group border border-slate-200 overflow-hidden flex flex-col bg-white hover:shadow-lg transition-shadow duration-300"
             >
                {/* Faixa Superior */}
                <div className="h-1.5 w-full bg-blue-600 group-hover:h-2 transition-all duration-300" />
                
                <CardHeader className="pb-2 pt-5 px-6">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                        {client.customer_name}
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 px-6 pb-6">
                  <div className="space-y-5">
                    
                    {/* Lista de Grupos */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <Users className="w-3.5 h-3.5" />
                        Grupos de Acesso
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {client.groups.length > 0 ? (
                           client.groups.slice(0, 4).map((group) => (
                            <Badge 
                              key={group.group_id} 
                              variant="secondary" 
                              className="bg-slate-50 text-slate-600 border border-slate-200 font-medium px-2.5 py-1"
                            >
                              {group.group_name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-slate-400 italic">Nenhum grupo vinculado</span>
                        )}
                        {client.groups.length > 4 && (
                            <Badge variant="outline" className="text-xs text-slate-400 border-dashed bg-transparent">
                              +{client.groups.length - 4}
                            </Badge>
                        )}
                      </div>
                    </div>

                    {/* Métricas */}
                    <div className="pt-2">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/50 border border-blue-100/50 w-fit">
                            <BarChart3 className="w-4 h-4 text-blue-600" />
                            <span className="font-bold text-blue-700">{activeReports}</span> 
                            <span className="text-xs font-medium text-blue-600/80 uppercase tracking-wide">Relatórios ativos</span>
                        </div>
                    </div>

                  </div>
                </CardContent>

                {/* Footer Visual */}
                <CardFooter className="bg-slate-50 py-3 px-6 border-t border-slate-100 flex justify-between items-center mt-auto">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      Monitoramento
                    </span>
                    <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-full border border-slate-100 shadow-sm">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs text-slate-600 font-medium pr-1">Sistema Ativo</span>
                    </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-xl border border-dashed border-slate-200">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
             <Building2 className="w-6 h-6 text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">Nenhum cliente encontrado</h3>
          <p className="text-slate-500 text-sm mt-1">
            {searchTerm ? `Não encontramos nada para "${searchTerm}"` : "Sua carteira de clientes está vazia."}
          </p>
        </div>
      )}
    </div>
  );
}