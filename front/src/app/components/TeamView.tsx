import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { 
  Users, 
  UserPlus,
  Mail,
  Building2,
  Trash2,
  Shield,
  User as UserIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Profile } from '@/types';

interface TeamViewProps {
  profiles: Profile[];
  companies?: Array<{ id: string; name: string }>;
  onAddUser?: (user: { email: string; name: string; role: 'admin' | 'client'; company_id?: string }) => Promise<void>;
  onDeleteUser?: (userId: string) => Promise<void>;
}

export function TeamView({ profiles, companies = [], onAddUser, onDeleteUser }: TeamViewProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    role: 'client' as 'admin' | 'client',
    company_id: '',
  });

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.name) {
      return;
    }
    if (newUser.role === 'client' && !newUser.company_id) {
      alert('Selecione uma empresa para o usuário cliente');
      return;
    }
    
    try {
      await onAddUser?.({
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        company_id: newUser.role === 'client' ? newUser.company_id : undefined,
      });
      setNewUser({ email: '', name: '', role: 'client', company_id: '' });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      await onDeleteUser?.(userId);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return 'Data indisponível';
    }
  };

  const visibleProfiles = isAdmin 
    ? profiles 
    : profiles.filter(p => p.company_id === user?.company_id);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Equipe
          </h1>
          <p className="text-slate-600 text-lg">
            {isAdmin ? 'Gerencie todos os usuários do sistema' : 'Visualize os membros da sua equipe'}
          </p>
        </div>
        {isAdmin && onAddUser && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#2563EB] hover:bg-[#1d4ed8]">
                <UserPlus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                <DialogDescription>
                  Crie um novo usuário no sistema. O usuário receberá um email para configurar sua senha.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    placeholder="João Silva"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="joao@empresa.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Perfil *</Label>
                  <select
                    id="role"
                    className="w-full p-2 border border-slate-300 rounded-md"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'client', company_id: '' })}
                  >
                    <option value="client">Cliente (Viewer)</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                {newUser.role === 'client' && companies.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="company_id">Empresa *</Label>
                    <select
                      id="company_id"
                      className="w-full p-2 border border-slate-300 rounded-md"
                      value={newUser.company_id}
                      onChange={(e) => setNewUser({ ...newUser, company_id: e.target.value })}
                    >
                      <option value="">Selecione uma empresa...</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  className="bg-[#2563EB] hover:bg-[#1d4ed8]"
                  onClick={handleAddUser}
                  disabled={!newUser.email || !newUser.name || (newUser.role === 'client' && !newUser.company_id)}
                >
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Lista de Usuários */}
      {visibleProfiles.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-600 mb-2">
              Nenhum usuário encontrado
            </h3>
            <p className="text-slate-500">
              {isAdmin 
                ? 'Comece adicionando usuários usando o botão acima.'
                : 'Nenhum membro da equipe encontrado.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleProfiles.map((profile) => {
            const companyName = companies.find(c => c.id === profile.company_id)?.name || 'N/A';
            
            return (
              <Card key={profile.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-12 h-12 bg-[#2563EB]/10 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-[#2563EB]" />
                    </div>
                    <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                      {profile.role === 'admin' ? (
                        <>
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </>
                      ) : (
                        'Cliente'
                      )}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{profile.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profile.company_id && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                      <Building2 className="w-4 h-4" />
                      <span>{companyName}</span>
                    </div>
                  )}
                  <div className="text-xs text-slate-500">
                    Membro desde {getTimeAgo(profile.created_at)}
                  </div>
                  {isAdmin && onDeleteUser && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteUser(profile.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir Usuário
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
