import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import api from "@/services/api"; 
import { toast } from "sonner";   
import { 
  Loader2, 
  LogIn,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";

export function LoginPage() {
  const { login, errorMessage: authError } = useAuth();
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(email, password);
    if (!success) setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/forgot-password', { email: forgotEmail });
      
      if (response.data.status === 'SUCCESS') {
        setForgotSuccess(true);
        toast.success("E-mail enviado com sucesso!");
      } else {
        toast.error(response.data.error_message || "Erro ao recuperar senha.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro de conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-indigo-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-100 relative z-10 mx-4">

        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
             <img 
               src="/images/logo_workon.png" 
               alt="Trade HUB Logo" 
               className="h-16 w-auto object-contain" 
             />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Bem-vindo ao Data Hub</h1>
          <p className="text-slate-500 mt-2 text-sm">Insira suas credenciais para acessar</p>
        </div>

        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail Corporativo</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="nome@empresa.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-slate-50 focus:bg-white transition-all"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Senha</Label>
                <button 
                  type="button"
                  onClick={() => {
                    setView('forgot');
                    setForgotSuccess(false);
                    setForgotEmail("");
                  }}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-slate-50 focus:bg-white transition-all"
                required
              />
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-3 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base shadow-lg shadow-blue-900/10 transition-all" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Acessar Portal
                </>
              )}
            </Button>
          </form>
        )}

        {/*VIEW: ESQUECI MINHA SENHA*/}
        {view === 'forgot' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mb-6 text-center">
              <h2 className="text-lg font-semibold text-slate-800">Recuperar Acesso</h2>
              <p className="text-sm text-slate-500 mt-1">
                Informe seu e-mail para receber uma nova senha provisória.
              </p>
            </div>

            {forgotSuccess ? (
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 border border-green-100 rounded-lg text-green-700 flex flex-col items-center">
                  <CheckCircle2 className="w-10 h-10 text-green-600 mb-2" />
                  <span className="font-medium">E-mail enviado!</span>
                  <p className="text-sm mt-1 text-green-600/80">Verifique sua caixa de entrada.</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setView('login')}
                  className="w-full h-11"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">E-mail cadastrado</Label>
                  <Input 
                    id="forgot-email" 
                    type="email" 
                    placeholder="seu.email@exemplo.com" 
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="h-11 bg-slate-50 focus:bg-white"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 h-11"
                    onClick={() => setView('login')}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-[2] h-11 bg-blue-600 hover:bg-blue-700" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    ) : (
                      <>
                        <KeyRound className="mr-2 h-4 w-4" />
                        Recuperar Senha
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} WorkOn - Todos os direitos reservados.
          </p>
        </div>

      </div>
    </div>
  );
}