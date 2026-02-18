import { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  Users, 
  Building2, 
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCcw 
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { toast } from "sonner"; 

import { Checkbox } from "@/app/components/ui/checkbox";
import { Label } from "@/app/components/ui/label";

import { GroupRegistrationModal } from "./GroupRegistrationModal";
import { groupService, Group } from "@/services/groupService";

export function GroupsManagementView() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filterSearch, setFilterSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await groupService.getAll({ page: 1, pagesize: 1000, orderby: 'name' });
      setGroups(data.items || []);
    } catch (error) {
      console.error("Erro ao carregar grupos:", error);
      toast.error("Erro ao carregar grupos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (id: number) => {
    setSelectedGroupId(id);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedGroupId(null);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (group: Group) => {
    const action = group.active ? "inativar" : "reativar";
    
    if (!confirm(`Deseja realmente ${action} o grupo "${group.name}"?`)) return;

    try {
      if (group.active) {
        await groupService.delete(group.id); 
        toast.success("Grupo inativado.");
      } else {
        await groupService.reactivate(group.id);
        toast.success("Grupo reativado.");
      }
      fetchData();
    } catch (error) {
      toast.error(`Erro ao ${action} o grupo.`);
    }
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = (group.name?.toLowerCase() || '').includes(filterSearch.toLowerCase()) ||
                          (group.customer?.toLowerCase() || '').includes(filterSearch.toLowerCase());
    
    const isGroupActive = group.active !== false;
    const matchesStatus = showInactive ? !isGroupActive : isGroupActive;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Gerir Grupos de Acesso
          </h1>
          <p className="text-slate-500 text-sm">Organize os utilizadores por cliente ou departamento.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 flex-1 md:flex-none"
            onClick={handleNew}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Grupo
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Pesquisar por nome do grupo ou cliente..." 
            className="pl-9"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto bg-slate-50 px-3 py-2 rounded-md border border-slate-100">
            <Checkbox 
                id="show-inactive-groups" 
                checked={showInactive}
                onCheckedChange={(checked) => setShowInactive(checked as boolean)}
            />
            <Label 
                htmlFor="show-inactive-groups" 
                className="text-sm font-medium leading-none cursor-pointer text-slate-600 select-none"
            >
                Ver apenas inativos
            </Label>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-[30%]">Nome do Grupo</TableHead>
              <TableHead className="w-[30%]">Cliente Vinculado</TableHead>
              <TableHead className="w-[15%] text-center">Utilizadores</TableHead>
              <TableHead className="w-[15%] text-center">Estado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="animate-spin text-blue-600" /> Carregando...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <TableRow key={group.id} className={`hover:bg-slate-50/50 ${!group.active ? 'bg-slate-50/60' : ''}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${!group.active ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'}`}>
                        <Users className="w-4 h-4" />
                      </div>
                      <span className={`text-sm font-medium ${!group.active ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                        {group.name}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      {group.customer || <span className="text-slate-400 italic">Não vinculado</span>}
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                      {group.qty_users || 0} membro(s)
                    </Badge>
                  </TableCell>

                  <TableCell className="text-center">
                    {group.active ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Ativo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 gap-1">
                        <XCircle className="w-3 h-3" /> Inativo
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                     <div className="flex items-center justify-end gap-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleEdit(group.id)}
                            title="Editar"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`h-8 w-8 ${group.active ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'}`}
                            onClick={() => handleToggleStatus(group)}
                            title={group.active ? "Inativar" : "Reativar"}
                        >
                            {group.active ? (
                                <Trash2 className="h-4 w-4" />
                            ) : (
                                <RefreshCcw className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                   {showInactive ? "Nenhum grupo inativo encontrado." : "Nenhum grupo ativo encontrado."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <GroupRegistrationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        groupIdToEdit={selectedGroupId}
        onSuccess={fetchData}
      />
    </div>
  );
}