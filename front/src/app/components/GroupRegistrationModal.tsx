import { useState, useEffect } from "react";
import { 
  Users, 
  Building2, 
  Search,
  UserPlus,
  CheckCircle2,
  Loader2,
  Lock
} from "lucide-react"; 
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Switch } from "@/app/components/ui/switch"; 
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { groupService } from "@/services/groupService";
import { toast } from "sonner";

interface GroupRegistrationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void; // CORREÇÃO: Usamos o padrão do Shadcn
  groupIdToEdit?: number | null; 
  onSuccess?: () => void;
}

export function GroupRegistrationModal({ isOpen, onOpenChange, groupIdToEdit, onSuccess }: GroupRegistrationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    customer_id: "", 
    active: true
  });

  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadData(); 
      
      if (!groupIdToEdit) {
        setFormData({ name: "", customer_id: "", active: true });
        setSelectedUsers([]);
      }
    }
  }, [isOpen, groupIdToEdit]);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const auxData = await groupService.getAuxiliaryData();
      setCustomersList(auxData.customers);
      setUsersList(auxData.users);

      if (groupIdToEdit) {
        const group = await groupService.getById(groupIdToEdit);
        
        setFormData({
            name: group.name || "",
            customer_id: group.customer_id ? String(group.customer_id) : "",
            active: group.active !== false
        });

        const members = await groupService.getUsersByGroup(groupIdToEdit);
        if (members && Array.isArray(members)) {
             const memberIds = members.map((m: any) => m.user_id || m.id);
             setSelectedUsers(memberIds);
        }
      }

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar grupo.");
    } finally {
      setIsLoadingData(false);
    }
  };

  // Lógica: Atualizar nome ao selecionar cliente
  const handleCustomerChange = (customerId: string) => {
    const selectedCustomer = customersList.find(c => String(c.id) === customerId);
    let newName = formData.name;

    // Se estiver criando um novo, aplica o prefixo
    if (!groupIdToEdit && selectedCustomer) {
        const prefix = `${selectedCustomer.name.toUpperCase()} - `;
        if (!newName.startsWith(prefix)) {
            newName = prefix;
        }
    }

    setFormData({
        ...formData,
        customer_id: customerId,
        name: newName
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.customer_id) {
      toast.warning("Selecione um cliente e preencha o nome do grupo.");
      return;
    }

    setIsLoading(true);
    try {
      await groupService.save({
        id: groupIdToEdit || undefined,
        name: formData.name,
        customer_id: Number(formData.customer_id),
        active: formData.active
      }, selectedUsers);

      toast.success(groupIdToEdit ? "Grupo atualizado!" : "Grupo criado com sucesso!");
      if (onSuccess) onSuccess();
      
      // CORREÇÃO: Chama a função correta para fechar
      onOpenChange(false); 
      
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar grupo.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUser = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const filteredUsers = usersList.filter(user => 
    (user.name?.toLowerCase() || '').includes(userSearch.toLowerCase()) || 
    (user.email?.toLowerCase() || '').includes(userSearch.toLowerCase())
  );

  const isNameDisabled = !formData.customer_id && !groupIdToEdit;

  return (
    // CORREÇÃO: Passamos onOpenChange diretamente para o Dialog
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] bg-white overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="px-2">
          <DialogTitle className="text-xl">
            {groupIdToEdit ? "Editar Grupo" : "Novo Grupo de Acesso"}
          </DialogTitle>
          <DialogDescription>
            Defina o cliente e selecione os usuários que terão acesso a este grupo.
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <span className="text-slate-500">Carregando dados...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 px-2 overflow-y-auto">
            
            {/* COLUNA ESQUERDA - DADOS DO GRUPO */}
            <div className="space-y-5 bg-slate-50 p-5 rounded-xl border border-slate-100 h-fit">
              <div>
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Dados do Grupo
                </h3>
                
                <div className="space-y-4">
                  
                  {/* 1. SELEÇÃO DE CLIENTE */}
                  <div className="grid gap-2">
                    <Label className="text-slate-700">Cliente Vinculado <span className="text-red-500">*</span></Label>
                    <Select 
                      value={formData.customer_id} 
                      onValueChange={handleCustomerChange}
                    >
                      <SelectTrigger className="bg-white">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <SelectValue placeholder="Selecione o cliente..." />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {customersList.map(cust => (
                          <SelectItem key={cust.id} value={String(cust.id)}>
                            {cust.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 2. NOME DO GRUPO */}
                  <div className="grid gap-2 relative">
                    <Label htmlFor="name" className="text-slate-700">Nome do Grupo <span className="text-red-500">*</span></Label>
                    <div className="relative">
                        <Input 
                        id="name" 
                        className={`bg-white transition-all ${isNameDisabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
                        placeholder={isNameDisabled ? "Selecione um cliente primeiro" : "Ex: HALEON - Gerência"} 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        disabled={isNameDisabled}
                        />
                        {isNameDisabled && (
                            <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                        )}
                    </div>
                    {isNameDisabled && (
                        <p className="text-xs text-amber-600 font-medium">
                            ⚠ Selecione o cliente para liberar este campo.
                        </p>
                    )}
                  </div>

                  {/* STATUS */}
                  <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700">Grupo Ativo?</span>
                      <span className="text-xs text-slate-500">Se inativo, ninguém acessa.</span>
                    </div>
                    <Switch 
                      checked={formData.active}
                      onCheckedChange={(checked) => setFormData({...formData, active: checked})}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* COLUNA DIREITA - SELEÇÃO DE MEMBROS */}
            <div className="space-y-4 flex flex-col h-full">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-600" />
                  Membros
                </h3>
                <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  {selectedUsers.length} selecionado(s)
                </span>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Buscar usuário..." 
                  className="pl-9"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              <div className="border rounded-xl h-[350px] overflow-y-auto p-2 space-y-1 bg-white shadow-sm">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <div 
                      key={user.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all border group cursor-pointer select-none ${
                        selectedUsers.includes(user.id) 
                          ? 'bg-blue-50/80 border-blue-200' 
                          : 'border-transparent hover:bg-slate-50'
                      }`}
                      onClick={() => toggleUser(user.id)}
                    >
                      <Checkbox 
                        id={`user-${user.id}`}
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => toggleUser(user.id)}
                        className="data-[state=checked]:bg-blue-600 border-slate-300 pointer-events-none"
                      />
                      
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="w-9 h-9 border-2 border-white shadow-sm">
                          <AvatarFallback className="text-xs bg-slate-200 text-slate-600 font-bold">
                            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className={`text-sm font-semibold ${selectedUsers.includes(user.id) ? 'text-blue-700' : 'text-slate-700'}`}>
                            {user.name}
                          </span>
                          <span className="text-xs text-slate-500 group-hover:text-slate-600">{user.email}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 my-auto">
                    <UserPlus className="w-8 h-8 opacity-20" />
                    <p className="text-sm font-medium">Nenhum usuário encontrado.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="px-2 mt-auto pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancelar</Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]" 
            onClick={handleSubmit}
            disabled={isLoading || isLoadingData || isNameDisabled}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Salvar Grupo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}