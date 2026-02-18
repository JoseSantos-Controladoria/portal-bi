import { useState, useEffect } from "react";
import { 
  User, Lock, Save, Loader2, Mail, Building2, Shield, UserCog,
  Eye, EyeOff, AlertCircle, CheckCircle2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/app/components/ui/card";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/app/components/ui/tabs";
import { userService } from "@/services/userService"; 
import { toast } from "sonner";

export function UserProfileView() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [profileData, setProfileData] = useState({
    id: "" as string | number, 
    name: "",
    email: "",
    role: "",
    company: ""
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        id: user.id, 
        name: user.name || "Usuário",
        email: user.email || "",
        role: user.perfil || "N/A", 
        company: user.company_id ? String(user.company_id).toUpperCase() : "Work On Group"
      });
    }
  }, [user]);

  const passwordsMatch = securityData.newPassword === securityData.confirmPassword;
  const isConfirming = securityData.confirmPassword.length > 0;
  const isPasswordValid = securityData.newPassword.length >= 6;
  const hasError = isConfirming && !passwordsMatch;

  const handleSaveProfile = async () => {
    if (!profileData.name.trim()) {
        toast.warning("O nome não pode ficar vazio.");
        return;
    }

    setIsLoading(true);
    try {
      await userService.update(profileData.id, { 
        name: profileData.name 
      });
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    if (!passwordsMatch) {
      toast.error("As novas senhas não conferem.");
      return;
    }
    if (!isPasswordValid) {
        toast.error("A nova senha deve ter pelo menos 6 caracteres.");
        return;
    }
    
    setIsLoading(true);
    try {
      await userService.update(profileData.id, { 
        password: securityData.newPassword 
      });

      setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Senha alterada com sucesso!");

    } catch (error) {
      console.error(error);
      toast.error("Erro ao alterar senha.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold border-4 border-white shadow-sm">
            {profileData.name ? profileData.name.charAt(0).toUpperCase() : <UserCog />}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meu Perfil</h1>
          <p className="text-slate-500 text-sm">Gerencie suas informações pessoais e credenciais de acesso.</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        {/* Menu de Abas*/}
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="general" className="flex gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all">
            <User className="w-4 h-4" /> Dados Pessoais
          </TabsTrigger>
          <TabsTrigger value="security" className="flex gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all">
            <Lock className="w-4 h-4" /> Segurança
          </TabsTrigger>
        </TabsList>

        {/* DADOS GERAIS */}
        <TabsContent value="general" className="mt-0">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
              <CardDescription>Atualize seus dados de identificação.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input 
                    id="name" 
                    value={profileData.name} 
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail Corporativo</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      id="email" 
                      value={profileData.email} 
                      disabled 
                      className="pl-9 bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200" 
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label>Perfil de Acesso</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input value={profileData.role} disabled className="pl-9 bg-slate-50 text-slate-500 border-slate-200" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Empresa</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input value={profileData.company} disabled className="pl-9 bg-slate-50 text-slate-500 border-slate-200" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-slate-50/30 px-6 py-4 flex justify-end">
              <Button onClick={handleSaveProfile} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Alterações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* SEGURANÇA */}
        <TabsContent value="security" className="mt-0">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>Defina uma nova senha para acessar o sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Senha Atual */}
              <div className="space-y-2">
                <Label htmlFor="current">Senha Atual (Opcional)</Label>
                <div className="relative">
                  <Input 
                    id="current" 
                    type={showCurrentPass ? "text" : "password"} 
                    placeholder="••••••••"
                    value={securityData.currentPassword}
                    onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                    className="bg-white pr-10"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Nova Senha */}
                <div className="space-y-2">
                  <Label htmlFor="new">Nova Senha</Label>
                  <div className="relative">
                    <Input 
                      id="new" 
                      type={showNewPass ? "text" : "password"} 
                      placeholder="••••••••"
                      value={securityData.newPassword}
                      onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                      className={`bg-white pr-10 ${securityData.newPassword.length > 0 && !isPasswordValid ? 'border-amber-500 focus-visible:ring-amber-500' : ''}`}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {securityData.newPassword.length > 0 && !isPasswordValid && (
                     <p className="text-[11px] text-amber-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" /> Mínimo de 6 caracteres
                     </p>
                  )}
                </div>

                {/* Confirmar Senha */}
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Input 
                      id="confirm" 
                      type={showConfirmPass ? "text" : "password"} 
                      placeholder="••••••••"
                      value={securityData.confirmPassword}
                      onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                      className={`bg-white pr-10 ${hasError ? 'border-red-500 focus-visible:ring-red-500' : ''} ${passwordsMatch && isConfirming ? 'border-emerald-500 focus-visible:ring-emerald-500' : ''}`}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* Avisos de Validação */}
                  {hasError && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1 mt-1 animate-in slide-in-from-top-1">
                      <AlertCircle className="w-3 h-3" /> As senhas não conferem
                    </p>
                  )}
                  {passwordsMatch && isConfirming && (
                    <p className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1 animate-in slide-in-from-top-1">
                      <CheckCircle2 className="w-3 h-3" /> Senhas coincidem
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-slate-50/30 px-6 py-4 flex justify-end">
              <Button variant="destructive" onClick={handleSaveSecurity} disabled={isLoading || hasError || !isPasswordValid}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                Atualizar Senha
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}