import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { DashboardFormModal } from '@/app/components/DashboardFormModal';
import { 
  ArrowLeft,
  Plus,
  Trash2,
  ExternalLink,
  TrendingUp, 
  PackageX, 
  PieChart, 
  MapPin, 
  DollarSign, 
  Store, 
  ShoppingCart,
  BarChart3,
  LineChart,
  Users,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const iconMap: Record<string, any> = {
  TrendingUp,
  PackageX,
  PieChart,
  MapPin,
  DollarSign,
  Store,
  ShoppingCart,
  BarChart3,
  LineChart,
  Users,
};

interface ClientDetailsViewProps {
  clientId: string;
  onBack: () => void;
  onViewReport: (dashboardId: string) => void;
}

export function ClientDetailsView({ clientId, onBack, onViewReport }: ClientDetailsViewProps) {
  const { clients, getDashboardsByClient, addDashboard, deleteDashboard } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const client = clients.find((c) => c.id === clientId);
  const clientDashboards = getDashboardsByClient(clientId);

  const handleAddDashboard = (dashboardData: {
    title: string;
    description: string;
    embedUrl: string;
    icon: string;
  }) => {
    addDashboard({
      ...dashboardData,
      clientId,
      lastUpdated: new Date().toISOString(),
    });
    toast.success('Relatório adicionado com sucesso!');
    setIsModalOpen(false);
  };

  const handleDeleteDashboard = (dashboardId: string, dashboardTitle: string) => {
    if (window.confirm(`Tem certeza que deseja excluir "${dashboardTitle}"?`)) {
      deleteDashboard(dashboardId);
      toast.success('Relatório excluído!');
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return 'Data indisponível';
    }
  };

  if (!client) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Cliente não encontrado</h2>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 -ml-2 hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Clientes
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center overflow-hidden">
              {client.logoUrl ? (
                <img
                  src={client.logoUrl}
                  alt={client.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Store className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">{client.name}</h1>
              <p className="text-slate-600">
                {clientDashboards.length} relatório(s) configurado(s)
              </p>
            </div>
          </div>

          {/* Botão Adicionar Relatório */}
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Novo Relatório
          </Button>
        </div>
      </div>

      {/* Grid de Dashboards */}
      {clientDashboards.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <PieChart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-600 mb-2">
              Nenhum relatório configurado
            </h3>
            <p className="text-slate-500 mb-6">
              Adicione o primeiro dashboard do Power BI para este cliente
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Relatório
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientDashboards.map((dashboard) => {
            const Icon = iconMap[dashboard.icon] || TrendingUp;

            return (
              <Card
                key={dashboard.id}
                className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200 rounded-xl shadow-sm"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {getTimeAgo(dashboard.lastUpdated)}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                    {dashboard.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 min-h-[40px]">
                    {dashboard.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => onViewReport(dashboard.id)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteDashboard(dashboard.id, dashboard.title)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Informação sobre o que o cliente vê */}
      {clientDashboards.length > 0 && (
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Visão do Cliente
                </h3>
                <p className="text-sm text-slate-600">
                  Estes são exatamente os relatórios que <strong>{client.name}</strong> vê ao fazer login.
                  Os usuários vinculados a este cliente terão acesso apenas a esses dashboards.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Adicionar Dashboard */}
      <DashboardFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddDashboard}
      />
    </div>
  );
}
