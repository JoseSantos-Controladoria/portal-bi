import { useState } from "react";
import { 
  Building2, 
  Users, 
  ArrowLeft,
  BarChart3,
  Clock,
  ArrowUpRight,
  Search
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter,
  CardContent 
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { GroupsListView } from "./GroupsListView";
import { ClientsList } from "./ClientsList";

type InternalView = 'selection' | 'clients_list' | 'groups_list' | 'client_details';

export function ClientsListView() {
  const [currentView, setCurrentView] = useState<InternalView>('selection');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [reportSearch, setReportSearch] = useState("");

  const handleClientSelect = (client: any) => {
    setSelectedClient(client);
    setCurrentView('client_details');
    setReportSearch("");
  };

  if (currentView === 'groups_list') {
    return <GroupsListView onBack={() => setCurrentView('selection')} />;
  }

  if (currentView === 'clients_list') {
    return (
      <ClientsList 
        onBack={() => setCurrentView('selection')} 
        onSelectClient={handleClientSelect}
      />
    );
  }

  if (currentView === 'client_details' && selectedClient) {
    const mockReports = Array.from({ length: selectedClient.activeReports || 6 }).map((_, i) => ({
      id: i,
      title: `Relatório de Performance ${selectedClient.name} ${i + 1}`,
      desc: "Análise consolidada de Sell-out, Estoque e Ruptura.",
      date: "Hoje"
    }));

    const filteredReports = mockReports.filter(r => 
      r.title.toLowerCase().includes(reportSearch.toLowerCase())
    );

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
        <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setCurrentView('clients_list')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-md shadow-sm ${selectedClient.logoColor || 'bg-blue-600'}`}>
                {selectedClient.name.substring(0, 3)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{selectedClient.name}</h1>
                <p className="text-slate-500 text-sm">Ambiente exclusivo de relatórios</p>
              </div>
            </div>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar relatório..."
              className="pl-9 bg-white"
              value={reportSearch}
              onChange={(e) => setReportSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredReports.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map((report) => (
              <Card key={report.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-slate-200 overflow-hidden">
                <div className={`h-1 w-full ${selectedClient.logoColor || 'bg-blue-600'}`} />
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-slate-50 text-slate-600 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-normal">Power BI</Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-700 transition-colors leading-tight">
                    {report.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">{report.desc}</CardDescription>
                </CardHeader>
                <CardFooter className="pt-0 flex items-center justify-between text-xs text-slate-400 mt-4 p-4 bg-slate-50/50 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Atualizado: {report.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-5px] group-hover:translate-x-0">
                    Abrir <ArrowUpRight className="w-3 h-3" />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12"><p className="text-slate-500">Nenhum relatório encontrado.</p></div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 animate-in fade-in zoom-in duration-300">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900">Gerenciamento de Entidades</h2>
        <p className="text-slate-500 mt-2">Selecione o tipo de registro que deseja gerenciar</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 px-4">
        {/* Card: Clientes */}
        <Card 
          className="group cursor-pointer hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 border-2 border-slate-200"
          onClick={() => setCurrentView('clients_list')}
        >
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">Clientes</CardTitle>
            <CardDescription>Gerencie empresas e contratos.</CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <span className="text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">Acessar Clientes &rarr;</span>
          </CardContent>
        </Card>

        {/* Card: Grupos */}
        <Card 
          className="group cursor-pointer hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300 border-2 border-slate-200"
          onClick={() => setCurrentView('groups_list')}
        >
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-8 h-8 text-emerald-600" />
            </div>
            <CardTitle className="text-xl group-hover:text-emerald-600 transition-colors">Grupos de Acesso</CardTitle>
            <CardDescription>Defina permissões e times.</CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <span className="text-sm font-medium text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">Acessar Grupos &rarr;</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}