import { useState, useEffect } from "react";
import { 
  Search, Filter, Download, FileText, Users, Clock, Loader2
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/app/components/ui/select";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/app/components/ui/pagination";
import { logService, LogEntry } from "@/services/logService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AccessLogsView() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterAction]);

  const loadLogs = async () => {
    setIsLoading(true);
    const data = await logService.getAll({ page: 1, pagesize: 1000, orderby: 'created_at desc' });
    setLogs(data);
    setIsLoading(false);
  };

  const filteredLogs = logs.filter(log => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (log.user_name?.toLowerCase() || '').includes(searchLower) ||
      (log.report_name?.toLowerCase() || '').includes(searchLower) ||
      (log.group_name?.toLowerCase() || '').includes(searchLower);
      
    const matchesAction = filterAction === "all" || log.action === filterAction;

    return matchesSearch && matchesAction;
  });

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Logs de Acesso
          </h1>
          <p className="text-slate-500 text-sm">Histórico real de visualização de relatórios.</p>
        </div>
        
        <Button variant="outline" onClick={loadLogs} className="text-slate-600 gap-2">
           {isLoading ? <Loader2 className="animate-spin w-4 h-4"/> : <Download className="w-4 h-4" />}
           Atualizar Lista
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Buscar por usuário, grupo ou relatório..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-56">
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger>
              <div className="flex items-center gap-2 text-slate-600">
                <Filter className="w-4 h-4 text-slate-400" />
                <SelectValue placeholder="Filtrar Ação" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Ações</SelectItem>
              <SelectItem value="OPEN REPORT">OPEN REPORT</SelectItem>
              <SelectItem value="CLOSE REPORT">CLOSE REPORT</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead className="w-[180px]">Data/Hora</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead>Relatório Acessado</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow>
                 <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin w-5 h-5 text-blue-600"/>
                      Carregando logs...
                    </div>
                 </TableCell>
               </TableRow>
            ) : currentLogs.length > 0 ? (
              currentLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-slate-50/50">
                  
                  {/* Data/Hora */}
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-600 font-mono text-xs">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {log.created_at ? format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss") : '-'}
                    </div>
                  </TableCell>

                  {/* Usuário */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-slate-100">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">
                          {(log.user_name || '?').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700">{log.user_name || 'Desconhecido'}</span>
                        <span className="text-xs text-slate-500">{log.user_email || '-'}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Grupo */}
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="w-4 h-4 text-slate-400" />
                      {log.group_name || <span className="text-slate-400 italic">Não identificado</span>}
                    </div>
                  </TableCell>

                  {/* Relatório */}
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium text-slate-700">
                      <FileText className="w-4 h-4 text-blue-500" />
                      {log.report_name || <span className="text-slate-400">Desconhecido</span>}
                    </div>
                  </TableCell>

                  {/* Ação */}
                  <TableCell className="text-right">
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 gap-1.5 pr-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {log.action}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="w-8 h-8 opacity-20" />
                    <p>Nenhum log encontrado.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* --- PAGINAÇÃO --- */}
        {!isLoading && filteredLogs.length > 0 && (
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

                {/* Mostra números de página (limitado a 5 para não quebrar layout se tiver muitas) */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    // Lógica simples: mostra os primeiros 5. 
                    // Para logs (que podem ser milhares), o ideal seria uma lógica de "Janela" (1 ... 4 5 6 ... 99)
                    // Mas vamos manter simples igual aos outros por enquanto.
                    const pageNum = i + 1;
                    return (
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
                    );
                })}
                
                {totalPages > 5 && (
                   <PaginationItem>
                     <span className="px-2 text-slate-400">...</span>
                   </PaginationItem>
                )}

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
    </div>
  );
}