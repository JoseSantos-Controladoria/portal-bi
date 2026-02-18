import { useState, lazy, Suspense } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider, useData } from "@/contexts/DataContext";
import { LoginPage } from "@/app/components/LoginPage";
import { Sidebar, SidebarView } from "@/app/components/Sidebar";
import { Toaster } from "@/app/components/ui/sonner";

// Imports (Lazy Loading)
const ClientDashboard = lazy(() => import("@/app/components/ClientDashboard").then(m => ({ default: m.ClientDashboard })));
const ReportViewer = lazy(() => import("@/app/components/ReportViewer").then(m => ({ default: m.ReportViewer })));
const ClientsListView = lazy(() => import("@/app/components/ClientsListView").then(m => ({ default: m.ClientsListView })));
const WorkspacesListView = lazy(() => import("@/app/components/WorkspacesListView").then(m => ({ default: m.WorkspacesListView })));
const UsersManagementView = lazy(() => import("@/app/components/UsersManagementView").then(m => ({ default: m.UsersManagementView }))); 
const ReportsManagementView = lazy(() => import("@/app/components/ReportsManagementView"));
const AccessLogsView = lazy(() => import("@/app/components/AccessLogsView").then(m => ({ default: m.AccessLogsView })));
const UserProfileView = lazy(() => import("@/app/components/UserProfileView").then(m => ({ default: m.UserProfileView })));

function AppContent() {
  const { isAuthenticated, user, loading } = useAuth();
  const { dashboards } = useData(); 
  const [activeView, setActiveView] = useState<SidebarView>('reports');
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const dashboardData = selectedReport ? (selectedReport || dashboards.find(d => d.id === selectedReport.id) || {
       id: selectedReport.id,
       title: 'Relatório Carregando...',
       embed_url: selectedReport.embedded_url || selectedReport.embedUrl || '',
       company_id: user?.company_id || ''
  }) : null;

  return (
    <>
      {/* Camada do Relatório (Sobreposição) */}
      {selectedReport && dashboardData && (
        <div className="fixed inset-0 z-[100] bg-white w-full h-full">
          <Suspense fallback={<div className="flex h-screen items-center justify-center">Carregando relatório...</div>}>
            <ReportViewer
              dashboardId={String(selectedReport.id)}
              dashboard={dashboardData as any}
              onBack={() => setSelectedReport(null)}
            />
          </Suspense>
        </div>
      )}

      {/* Camada Principal da Aplicação */}
      <div className={`flex h-screen overflow-hidden bg-slate-50 ${selectedReport ? 'hidden' : ''}`}>
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
        />
        
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          <header className="px-8 py-5 bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-800">
              {activeView === 'reports' ? 'Relatórios de Performance' : 
               activeView === 'register_report' ? 'Gestão de Relatórios' :
               activeView === 'clients' ? 'Gestão de Clientes e Grupos' : 
               activeView === 'workspaces' ? 'Gestão de Workspaces' :
               activeView === 'logs' ? 'Logs de Auditoria e Segurança' :
               activeView === 'users' ? 'Gerenciamento de Usuários' :
               activeView === 'profile' ? 'Meu Perfil' :
               'Painel'}
            </h1>
          </header>

          <div className="p-8">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            }>
              {/* As views são mantidas no DOM, apenas alternamos qual é renderizada */}
              {activeView === 'reports' && <ClientDashboard onViewReport={(report) => setSelectedReport(report)} />}
              {activeView === 'register_report' && <ReportsManagementView />}
              {activeView === 'workspaces' && <WorkspacesListView />}
              {activeView === 'clients' && <ClientsListView />}
              {activeView === 'users' && <UsersManagementView />} 
              {activeView === 'logs' && <AccessLogsView />}
              {activeView === 'profile' && <UserProfileView />}
            </Suspense>
          </div>
        </main>
        <Toaster position="top-right" />
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}