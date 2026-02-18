import { useState, useEffect } from "react";
import { 
  Search, Plus, Pencil, Trash2,
  Layout, Loader2, ExternalLink,
  CheckCircle2, XCircle, RefreshCcw 
} from "lucide-react"; 
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Label } from "@/app/components/ui/label";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
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

import { WorkspaceRegistrationModal } from "./WorkspaceRegistrationModal";
import { workspaceService, Workspace } from "@/services/workspaceService";

export function WorkspacesListView() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSearch, setFilterSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Workspace | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchData = async () => {
    setLoading(true);
    try {
      const wsData = await workspaceService.getAll({ page: 1, pagesize: 1000, orderby: 'name' });
      setWorkspaces(wsData.items || []);
    } catch (error) {
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterSearch, showInactive]);

  const handleEdit = (item: Workspace) => {
    setEditingItem(item); 
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (item: Workspace) => {
    const action = item.active ? "inativar" : "reativar";
    
    if (!confirm(`Deseja realmente ${action} o workspace "${item.name}"?`)) return;

    try {
      if (item.active) {
        await workspaceService.delete(item.id);
        toast.success("Workspace inativado.");
      } else {
        await workspaceService.reactivate(item.id); 
        toast.success("Workspace reativado.");
      }
      fetchData();
    } catch (error) {
      toast.error(`Erro ao ${action} workspace.`);
    }
  };

  const filteredItems = workspaces.filter(ws => {
    const matchesSearch = (ws.name?.toLowerCase() || '').includes(filterSearch.toLowerCase());
    
    const isActive = ws.active !== false; 
    const matchesStatus = showInactive ? !isActive : isActive;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Workspaces
          </h1>
          <p className="text-slate-500 text-sm">Gerencie as áreas de trabalho dos relatórios.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleNew}>
            <Plus className="w-4 h-4 mr-2" /> Novo Workspace
          </Button>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Buscar workspace por nome..." 
            className="pl-9"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
          />
        </div>

        {/* Checkbox de Inativos */}
        <div className="flex items-center space-x-2 w-full md:w-auto bg-slate-50 px-3 py-2 rounded-md border border-slate-100">
            <Checkbox 
                id="show-inactive-ws" 
                checked={showInactive}
                onCheckedChange={(checked) => setShowInactive(checked as boolean)}
            />
            <Label 
                htmlFor="show-inactive-ws" 
                className="text-sm font-medium leading-none cursor-pointer text-slate-600 select-none"
            >
                Ver apenas inativos
            </Label>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-[40%]">Nome do Workspace</TableHead>
              <TableHead className="w-[40%]">Link</TableHead>
              <TableHead className="w-[10%] text-center">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <div className="flex justify-center gap-2"><Loader2 className="animate-spin" /> Carregando...</div>
                </TableCell>
              </TableRow>
            ) : currentItems.length > 0 ? (
              currentItems.map((item) => (
                <TableRow key={item.id} className={`hover:bg-slate-50/50 ${!item.active ? 'bg-slate-50/60' : ''}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${!item.active ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'}`}>
                        <Layout className="w-4 h-4" />
                      </div>
                      <span className={`font-medium ${!item.active ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                          {item.name}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {item.url ? (
                        <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline truncate max-w-[300px]">
                            <ExternalLink className="w-3 h-3" /> {item.url}
                        </a>
                    ) : (
                        <span className="text-slate-400 text-sm">-</span>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    {item.active ? (
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
                            onClick={() => handleEdit(item)}
                            title="Editar"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        
                        {/* Botão de Toggle Status */}
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`h-8 w-8 ${item.active ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'}`}
                            onClick={() => handleToggleStatus(item)}
                            title={item.active ? "Inativar" : "Reativar"}
                        >
                            {item.active ? (
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
                <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                   {showInactive ? "Nenhum workspace inativo encontrado." : "Nenhum workspace ativo encontrado."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Paginação */}
        {!loading && filteredItems.length > 0 && (
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
                    className={currentPage === totalPages || totalPages === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <WorkspaceRegistrationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        workspaceIdToEdit={editingItem?.id}
        initialData={editingItem}
        onSuccess={fetchData}
      />
    </div>
  );
}