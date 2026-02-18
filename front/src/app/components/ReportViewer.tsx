import { useEffect } from "react";
import { ArrowLeft, Maximize2, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Dashboard } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { logService } from "@/services/logService";

interface ReportViewerProps {
  dashboardId: string;
  dashboard?: Dashboard | any; 
  onBack: () => void;
}

export function ReportViewer({ dashboard, onBack }: ReportViewerProps) {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id && dashboard?.id) {
       logService.logAction(user.id, 'OPEN REPORT', Number(dashboard.id));
    }
  }, [dashboard?.id, user?.id]);

  const handleClose = () => {
    if (user?.id && dashboard?.id) {
      logService.logAction(user.id, 'CLOSE REPORT', Number(dashboard.id));
    }
    onBack();
  };

  if (!dashboard) return null;

  const reportUrl = dashboard.embedUrl || dashboard.embedded_url || "";

  return (
    <div className="flex flex-col h-full bg-slate-50">
      
      {/* Header do Relatório */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        
        {/* Lado Esquerdo: Voltar + Título */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose} 
            className="rounded-full hover:bg-slate-100 -ml-2"
            title="Voltar"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
          
          <div>
            <h1 className="text-lg font-semibold text-slate-800 leading-tight">
              {dashboard.title}
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              {dashboard.workspace_name || "Workspace Padrão"}
            </p>
          </div>
        </div>

        {/* Lado Direito: Ações */}
        <div className="flex items-center gap-1">
          
          {/* Botão Maximizar */}
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-500 hover:text-blue-600"
            onClick={() => {
              if (reportUrl) window.open(reportUrl, '_blank');
            }}
            disabled={!reportUrl}
            title="Abrir em nova guia"
          >
            <Maximize2 className="h-5 w-5" />
          </Button>

          {/* Botão Fechar */}
          <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block"></div> 

          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleClose}
            className="text-slate-400 hover:text-red-600 hover:bg-red-50"
            title="Fechar Relatório"
          >
            <X className="h-6 w-6" />
          </Button>

        </div>
      </div>
      
      {/* Área do Iframe */}
      <div className="flex-1 relative bg-slate-100 overflow-hidden">
        {reportUrl ? (
          <iframe 
            title={dashboard.title}
            src={reportUrl} 
            className="w-full h-full border-0"
            allowFullScreen
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-slate-200 max-w-lg mx-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Maximize2 className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">
                Visualização indisponível
              </h3>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                Este relatório ainda não possui uma URL de incorporação (embed) configurada no sistema.
              </p>

              <div className="bg-slate-50 rounded-lg p-4 text-left border border-slate-100">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 block">
                  Dados Técnicos
                </label>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-slate-200 border-dashed">
                    <span className="text-slate-500">ID do Relatório:</span>
                    <span className="font-mono text-slate-700">{dashboard.id}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 border-dashed">
                    <span className="text-slate-500">Workspace:</span>
                    <span className="text-slate-700">{dashboard.workspace_name || "Padrão"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Status:</span>
                    <span className="text-slate-700">{dashboard.active ? "Ativo" : "Inativo"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}