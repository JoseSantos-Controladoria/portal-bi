import { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  Building2,
  ArrowLeft,
  Loader2,
  CheckCircle2, 
  XCircle,      
  RefreshCcw    
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Checkbox } from "@/app/components/ui/checkbox"; 
import { Label } from "@/app/components/ui/label";       
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/app/components/ui/pagination";
import { toast } from "sonner";
import { GroupRegistrationModal } from "./GroupRegistrationModal";
import { groupService, Group } from "@/services/groupService";
import { crudService } from "@/services/crudService";

interface GroupsListViewProps {
  onBack?: () => void;
}

export function GroupsListView({ onBack }: GroupsListViewProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [customersMap, setCustomersMap] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, showInactive]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const groupsData = await groupService.getAll({ page: 1, pagesize: 1000 });
      setGroups(groupsData.items || []);

      const customersData = await crudService.getAll('customer');
      const map: Record<number, string> = {};
      if (customersData && customersData.items) {
        customersData.items.forEach((c: any) => { map[c.id] = c.name; });
      }
      setCustomersMap(map);

    } catch (error) {
      console.error("Erro ao carregar grupos:", error);
      toast.error("Erro ao carregar lista de grupos.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (group: Group) => {
    const action = group.active ? "inativar" : "reativar";
    if (!confirm(`Deseja realmente ${action} o grupo "${group.name}"?`)) return;

    try {
      if (group.active) {
        await groupService.delete(group.id);
        toast.success("Grupo inativado com sucesso.");
      } else {
        await groupService.reactivate(group.id);
        toast.success("Grupo reativado com sucesso.");
      }
      fetchData();
    } catch (error) {
      toast.error(`Erro ao ${action} o grupo.`);
    }
  };

  const handleEdit = (id: number) => {
    setSelectedGroupId(id);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedGroupId(null);
    setIsModalOpen(true);
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = (group.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (customersMap[group.customer_id]?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const isGroupActive = group.active !== false; 
    const matchesStatus = showInactive ? !isGroupActive : isGroupActive;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredGroups.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentGroups = filteredGroups.slice(startIndex, endIndex);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="outline" size="icon" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gerenciamento de Grupos</h1>
            <p className="text-slate-500 text-sm">Organize o acesso dos usuários por empresa.</p>
          </div>
        </div>
        
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleNew}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Grupo
        </Button>
      </div>

      {/* Busca e Filtros */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por grupo ou cliente..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Checkbox de Filtro */}
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
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Grupo de Acesso</TableHead>
              <TableHead>Cliente (Empresa)</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                    <div className="flex justify-center items-center gap-2 text-slate-500">
                      <Loader2 className="animate-spin w-5 h-5" /> Carregando grupos...
                    </div>
                </TableCell>
              </TableRow>
            ) : currentGroups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                  {showInactive ? "Nenhum grupo inativo encontrado." : "Nenhum grupo ativo encontrado."}
                </TableCell>
              </TableRow>
            ) : (
              currentGroups.map((group) => (
                <TableRow key={group.id} className={`hover:bg-slate-50/50 ${!group.active ? 'bg-slate-50/60' : ''}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${!group.active ? 'bg-slate-100 text-slate-400' : 'bg-emerald-100 text-emerald-700'}`}>
                        {group.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className={`font-medium ${!group.active ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                          {group.name}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      {customersMap[group.customer_id] || `ID: ${group.customer_id}`}
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    {group.active ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Ativo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200 gap-1">
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
                      
                      {/* Botão Toggle Status: Lixeira ou Refresh */}
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
            )}
          </TableBody>
        </Table>

        {/* Paginação */}
        {!loading && filteredGroups.length > ITEMS_PER_PAGE && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      if (currentPage > 1) setCurrentPage(currentPage - 1); 
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === pageNum}
                        onClick={(e) => { 
                          e.preventDefault(); 
                          setCurrentPage(pageNum); 
                        }}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { 
                      e.preventDefault(); 
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1); 
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <GroupRegistrationModal 
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        groupIdToEdit={selectedGroupId}
        onSuccess={fetchData}
      />
    </div>
  );
}