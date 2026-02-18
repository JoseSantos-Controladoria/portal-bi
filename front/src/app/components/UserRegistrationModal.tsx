import { useState, useEffect } from "react";
import { 
  User as UserIcon, Mail, Building, Shield, Loader2, Users, Eye, EyeOff, Settings
} from "lucide-react"; 
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription
} from "@/app/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/app/components/ui/select";
import { Switch } from "@/app/components/ui/switch";
import { userService } from "@/services/userService";
import { toast } from "sonner";

interface UserRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userIdToEdit?: string | null;
  onSuccess?: () => void;
}

export function UserRegistrationModal({ isOpen, onClose, userIdToEdit, onSuccess }: UserRegistrationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const [companiesList, setCompaniesList] = useState<any[]>([]);
  const [profilesList, setProfilesList] = useState<any[]>([]);
  const [allGroupsList, setAllGroupsList] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    company_id: "",
    profile_id: "",
    active: true
  });
  
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (!userIdToEdit) {
        setFormData({ name: "", email: "", password: "", company_id: "", profile_id: "", active: true });
        setConfirmPassword("");
        setSelectedGroups([]);
        setShowPassword(false);
        setShowConfirmPassword(false);
      }
    }
  }, [isOpen, userIdToEdit]);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const auxData = await userService.getAuxiliaryData();
      setCompaniesList(auxData.companies);
      setProfilesList(auxData.profiles);
      setAllGroupsList(auxData.groups);
      
      if (userIdToEdit) {
        const user = await userService.getById(userIdToEdit);
        setFormData({
            name: user.name || "",
            email: user.email || "",
            password: "",
            company_id: user.company_id ? String(user.company_id) : "",
            profile_id: user.profile_id ? String(user.profile_id) : "",
            active: user.active !== false
        });
        setConfirmPassword("");
        const userGroups = await userService.getUserGroups(userIdToEdit);
        if (userGroups && Array.isArray(userGroups)) {
             const groupIds = userGroups
                .filter((g: any) => g.user_associated === true)
                .map((g: any) => g.group_id);
             setSelectedGroups(groupIds);
        }
      }
    } catch (error) {
      console.error("Erro no modal:", error);
      toast.error("Erro ao carregar dados.");
    } finally {
      setIsLoadingData(false);
    }
  };

  const toggleGroup = (groupId: number) => {
    setSelectedGroups(prev => {
      const newGroups = prev.includes(groupId) ? prev.filter(g => g !== groupId) : [...prev, groupId];
      return newGroups;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userIdToEdit) {
      if (formData.password !== confirmPassword) {
        toast.error("A confirmação de senha não confere.");
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        toast.error("A senha deve ter no mínimo 6 caracteres.");
        return;
      }
    }
    setIsLoading(true);
    try {
      await userService.save({
        id: userIdToEdit || undefined,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        company_id: Number(formData.company_id),
        profile_id: Number(formData.profile_id),
        active: formData.active
      }, selectedGroups);
      toast.success(userIdToEdit ? "Usuário atualizado!" : "Usuário criado com sucesso!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar usuário.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] sm:rounded-lg overflow-hidden">
        <DialogHeader className="px-1">
          <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <UserIcon className="w-6 h-6 text-blue-600" />
            </div>
            {userIdToEdit ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
          <DialogDescription className="text-base ml-11">
            Gerencie os dados de identificação e permissões de acesso.
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500 h-[400px]">
             <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
             <span className="text-lg font-medium">Carregando informações...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-6">

              <div className="md:col-span-7 space-y-6">
                <div>
                   <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    Dados de Identificação
                   </h3>
                   <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-600">Nome Completo</Label>
                        <Input 
                          id="name" placeholder="Ex: João da Silva" required className="h-11"
                          value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-600">E-mail Corporativo</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                          <Input 
                            id="email" type="email" className="pl-10 h-11" placeholder="joao@empresa.com" required
                            value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                          />
                        </div>
                      </div>
                   </div>
                </div>

                {!userIdToEdit && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2 mt-8">
                      Definição de Senha
                    </h3>
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-md border border-slate-100">
                      <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <div className="relative">
                          <Input 
                            id="password" type={showPassword ? "text" : "password"} className="pr-10 h-10" placeholder="Mín. 6 dígitos" required
                            value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                        <div className="relative">
                          <Input 
                            id="confirmPassword" type={showConfirmPassword ? "text" : "password"} className="pr-10 h-10" placeholder="Repita a senha" required
                            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 col-span-2 pt-1">O usuário deverá alterar esta senha no primeiro login.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-5 space-y-6 md:border-l md:pl-8 border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-500" /> Configurações de Acesso
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-slate-600">
                        <Building className="w-4 h-4 text-slate-400" /> Empresa
                      </Label>
                      <Select value={formData.company_id ? String(formData.company_id) : undefined} onValueChange={(val) => setFormData({...formData, company_id: val})}>
                        <SelectTrigger className="h-10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                          {companiesList.map(comp => (<SelectItem key={comp.id} value={String(comp.id)}>{comp.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-slate-600">
                        <Shield className="w-4 h-4 text-slate-400" /> Perfil de Permissão
                      </Label>
                      <Select value={formData.profile_id ? String(formData.profile_id) : undefined} onValueChange={(val) => setFormData({...formData, profile_id: val})}>
                        <SelectTrigger className="h-10"><SelectValue placeholder="Defina o perfil..." /></SelectTrigger>
                        <SelectContent>
                          {profilesList.map(prof => (<SelectItem key={prof.id} value={String(prof.id)}>{prof.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Label className="flex items-center gap-2 text-slate-600 font-medium">
                      <Users className="w-4 h-4 text-slate-400" /> Grupos Associados
                    </Label>
                    <div className="border rounded-md p-1 h-52 overflow-y-auto bg-slate-50/50">
                      {allGroupsList.length === 0 ? (
                          <span className="text-sm text-slate-400 p-4 block text-center h-full flex items-center justify-center">Nenhum grupo disponível.</span>
                      ) : (
                         allGroupsList.map(group => (
                          <div key={group.id} className="flex items-center space-x-3 p-2.5 rounded hover:bg-white hover:shadow-sm transition-all border-b border-slate-100 last:border-0">
                              <Checkbox 
                                id={`group-${group.id}`} checked={selectedGroups.includes(group.id)} onCheckedChange={() => toggleGroup(group.id)}
                                className="data-[state=checked]:bg-blue-600 border-slate-300 cursor-pointer"
                              />
                              <label htmlFor={`group-${group.id}`} className="text-sm font-medium leading-none cursor-pointer text-slate-700 w-full py-1">
                                {group.name}
                              </label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border p-4 rounded-lg bg-slate-50 border-slate-200 mt-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-800">Status da Conta</span>
                      <span className="text-xs text-slate-500">{formData.active ? 'Usuário pode fazer login.' : 'Acesso bloqueado.'}</span>
                    </div>
                    <Switch checked={formData.active} onCheckedChange={(checked) => setFormData({...formData, active: checked})}/>
                  </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading} className="h-11 px-6">
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-11 px-8 font-semibold text-base ml-2" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (userIdToEdit ? "Salvar Alterações" : "Criar Usuário")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}