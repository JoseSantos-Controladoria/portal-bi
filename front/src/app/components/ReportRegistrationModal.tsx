import { useState, useEffect } from "react";
import { 
  FileBarChart, Layout, Link as LinkIcon, Loader2, Users, Shield, CheckCircle2, Building2, X
} from "lucide-react"; 
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/app/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/app/components/ui/select";
import { Switch } from "@/app/components/ui/switch";
import { Checkbox } from "@/app/components/ui/checkbox"; 
import { ScrollArea } from "@/app/components/ui/scroll-area"; 
import { reportService } from "@/services/reportService";
import { groupService } from "@/services/groupService"; 
import { crudService } from "@/services/crudService";
import { toast } from "sonner";
import { Badge } from "@/app/components/ui/badge"; 

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportIdToEdit?: number | null;
  initialData?: any; 
  onSuccess?: () => void;
}

export function ReportRegistrationModal({ 
  isOpen, onClose, reportIdToEdit, onSuccess 
}: ReportModalProps) {
  
  const [isLoading, setIsLoading] = useState(false);
  const [workspacesList, setWorkspacesList] = useState<any[]>([]);
  const [customersList, setCustomersList] = useState<any[]>([]); 
  const [allGroups, setAllGroups] = useState<any[]>([]); 
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<number[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    workspace_id: "",
    embedded_url: "",
    active: true
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, reportIdToEdit]);

  useEffect(() => {
    const groupsToKeep = selectedGroupIds.filter(gId => {
      const group = allGroups.find(g => g.id === gId);
      return group && selectedCustomerIds.includes(group.customer_id);
    });
    
    if (groupsToKeep.length !== selectedGroupIds.length) {
      setSelectedGroupIds(groupsToKeep);
    }
  }, [selectedCustomerIds, allGroups]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const auxDataReport = await reportService.getAuxiliaryData();
      if (auxDataReport?.workspaces) setWorkspacesList(auxDataReport.workspaces);

      const customersData = await crudService.getAll('customer', { pagesize: 100, orderby: 'name' });
      setCustomersList(customersData.items || []);

      const groupsData = await groupService.getAll({ pagesize: 1000 });
      setAllGroups(groupsData.items || []);

      if (reportIdToEdit) {
        const report = await reportService.getById(reportIdToEdit);
        setFormData({
          title: report.title || "",
          description: report.description || "",
          workspace_id: report.workspace_id ? String(report.workspace_id) : "",
          embedded_url: report.embedded_url || "",
          active: report.active !== false 
        });

        await loadPermissionsForEdit(reportIdToEdit, groupsData.items || []);
      } else {
        setFormData({ 
          title: "", description: "", workspace_id: "", embedded_url: "", active: true 
        });
        setSelectedCustomerIds([]);
        setSelectedGroupIds([]);
      }

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados do formulário.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPermissionsForEdit = async (reportId: number, allGroupsList: any[]) => {
    try {
      const groupsFromApi = await reportService.getReportGroups(reportId);
      const associatedGroupIds = groupsFromApi
        .filter((g: any) => g.group_associated === true)
        .map((g: any) => g.group_id);
      
      setSelectedGroupIds(associatedGroupIds);
      const customersWithAccess = new Set<number>();
      allGroupsList.forEach(group => {
        if (associatedGroupIds.includes(group.id) && group.customer_id) {
          customersWithAccess.add(group.customer_id);
        }
      });
      setSelectedCustomerIds(Array.from(customersWithAccess));

    } catch (error) {
      console.error("Erro ao carregar permissões:", error);
    }
  };

  const handleCustomerSelect = (customerIdStr: string) => {
    const customerId = Number(customerIdStr);
    if (!selectedCustomerIds.includes(customerId)) {
      setSelectedCustomerIds(prev => [...prev, customerId]);

      const customerGroups = allGroups.filter(g => g.customer_id === customerId).map(g => g.id);
      setSelectedGroupIds(prev => [...new Set([...prev, ...customerGroups])]);
    }
  };

  const removeCustomer = (customerId: number) => {
    setSelectedCustomerIds(prev => prev.filter(id => id !== customerId));
  };

  const toggleGroupSelection = (groupId: number) => {
    setSelectedGroupIds(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const filteredGroups = allGroups.filter(group => 
    selectedCustomerIds.includes(group.customer_id)
  );

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.warning("Por favor, digite um título para o relatório.");
      return;
    }
    if (!formData.workspace_id) {
      toast.warning("Selecione um Workspace para continuar.");
      return;
    }

    setIsLoading(true);
    try {
      let savedReportId = reportIdToEdit;

      const payload = { ...formData, workspace_id: Number(formData.workspace_id) };
      
      if (reportIdToEdit) {
        await reportService.save({ id: reportIdToEdit, ...payload });
      } else {
        const res: any = await reportService.save(payload);
        if (res && res.id) savedReportId = res.id;
      }

      if (savedReportId) {
        await reportService.saveGroups(savedReportId, selectedGroupIds);
        toast.success("Relatório salvo com sucesso!");
      }

      if (onSuccess) onSuccess();
      onClose();

    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar relatório.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl bg-white p-0 overflow-hidden flex flex-col h-[700px]">
        
        <DialogHeader className="px-6 py-4 border-b shrink-0 bg-white z-10">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileBarChart className="w-5 h-5 text-blue-600" />
            {reportIdToEdit ? "Editar Relatório" : "Novo Relatório"}
          </DialogTitle>
          <DialogDescription>
            Defina os dados do relatório e filtre por clientes para atribuir permissões aos grupos.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-12 h-full min-h-0">
          
          {/* COLUNA 1: DADOS GERAIS  */}
          <div className="lg:col-span-4 p-5 border-r border-slate-100 bg-slate-50/30 flex flex-col gap-4 overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide shrink-0">
              <Layout className="w-4 h-4 text-blue-500" /> Dados do Dashboard
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-slate-700">Título <span className="text-red-500">*</span></Label>
                <Input 
                  id="title" 
                  placeholder="Ex: DRE Consolidado" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700">Workspace <span className="text-red-500">*</span></Label>
                <Select 
                  value={formData.workspace_id} 
                  onValueChange={(val) => setFormData({...formData, workspace_id: val})}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {workspacesList.map(ws => (
                      <SelectItem key={ws.id} value={String(ws.id)}>
                        {ws.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="desc" className="text-slate-700">Descrição</Label>
                <Input 
                  id="desc" 
                  placeholder="Resumo do conteúdo..." 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 flex items-center gap-2">
                  <LinkIcon className="w-3 h-3" /> Link Embed
                </Label>
                <Input 
                  placeholder="https://app.powerbi.com/..." 
                  value={formData.embedded_url}
                  onChange={(e) => setFormData({...formData, embedded_url: e.target.value})}
                  className="bg-white font-mono text-xs text-slate-600"
                />
              </div>

              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 mt-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-700">Ativo?</span>
                  <span className="text-xs text-slate-500">Disponível no menu</span>
                </div>
                <Switch 
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({...formData, active: checked})}
                />
              </div>
            </div>
          </div>

          {/* COLUNA 2: PERMISSÕES */}
          <div className="lg:col-span-8 p-5 flex flex-col h-full min-h-0 bg-white">
            
            {/* -- PARTE SUPERIOR: SELETOR DE CLIENTES -- */}
            <div className="mb-4 space-y-3 p-4 bg-slate-50 border border-slate-100 rounded-lg">
               <div className="flex items-center justify-between">
                 <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                  <Building2 className="w-4 h-4 text-emerald-600" /> 1. Selecione os Clientes
                </h3>
                <span className="text-xs text-slate-400">Ao selecionar, os grupos serão carregados abaixo.</span>
               </div>
               
               <Select onValueChange={handleCustomerSelect}>
                  <SelectTrigger className="bg-white border-slate-200">
                    <SelectValue placeholder="Adicionar cliente à lista de permissões..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customersList.map(cust => (
                      <SelectItem key={cust.id} value={String(cust.id)} disabled={selectedCustomerIds.includes(cust.id)}>
                        {cust.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Lista de Chips dos Clientes Selecionados */}
                <div className="flex flex-wrap gap-2 min-h-[30px]">
                  {selectedCustomerIds.length === 0 && (
                    <span className="text-xs text-slate-400 italic py-1">Nenhum cliente selecionado ainda.</span>
                  )}
                  {selectedCustomerIds.map(custId => {
                    const cust = customersList.find(c => c.id === custId);
                    return (
                      <div key={custId} className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full border border-emerald-200">
                        <span className="font-medium">{cust?.name}</span>
                        <button onClick={() => removeCustomer(custId)} className="hover:text-emerald-950">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )
                  })}
                </div>
            </div>

            {/*PARTE INFERIOR: LISTA DE GRUPOS */}
            <div className="flex-1 flex flex-col min-h-0">
               <div className="flex items-center justify-between mb-2 px-1">
                 <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                  <Shield className="w-4 h-4 text-blue-600" /> 2. Confirme os Grupos Vinculados
                </h3>
                <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-100">
                  {selectedGroupIds.length} grupos com acesso
                </span>
               </div>

               <div className="flex-1 border rounded-lg bg-slate-50/50 relative overflow-hidden">
                {selectedCustomerIds.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Building2 className="w-10 h-10 opacity-10" />
                    <p className="text-sm font-medium">Selecione um cliente acima para ver seus grupos.</p>
                  </div>
                ) : filteredGroups.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Users className="w-10 h-10 opacity-10" />
                    <p className="text-sm">Os clientes selecionados não possuem grupos cadastrados.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-full w-full">
                    <div className="p-2 space-y-1">
                      {/* Agrupar visualmente por Cliente */}
                      {selectedCustomerIds.map(custId => {
                        const cust = customersList.find(c => c.id === custId);
                        const groupsOfCust = filteredGroups.filter(g => g.customer_id === custId);
                        
                        if (groupsOfCust.length === 0) return null;

                        return (
                          <div key={custId} className="mb-4 last:mb-0">
                            <div className="px-2 py-1 text-xs font-bold text-slate-500 uppercase bg-slate-100/50 rounded mb-1">
                              {cust?.name}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {groupsOfCust.map(group => {
                                const isSelected = selectedGroupIds.includes(group.id);
                                return (
                                  <div 
                                    key={group.id} 
                                    onClick={() => toggleGroupSelection(group.id)}
                                    className={`flex items-center space-x-3 p-2.5 rounded-md transition-all border cursor-pointer select-none ${
                                      isSelected 
                                        ? 'bg-white border-blue-300 shadow-sm ring-1 ring-blue-100' 
                                        : 'bg-white/50 border-slate-200 hover:bg-white hover:border-slate-300'
                                    }`}
                                  >
                                    <Checkbox 
                                      checked={isSelected}
                                      className="data-[state=checked]:bg-blue-600 border-slate-300 pointer-events-none"
                                    />
                                    <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-slate-600'}`}>
                                      {group.name}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-slate-50/50 shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 min-w-[140px]" 
            onClick={handleSubmit} 
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            Salvar Relatório
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}