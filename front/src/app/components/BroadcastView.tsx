import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { 
  Megaphone, 
  Plus,
  Calendar,
  Building2,
  Globe
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Announcement } from '@/types';

interface BroadcastViewProps {
  announcements: Announcement[];
  companies?: Array<{ id: string; name: string }>;
  onAddAnnouncement?: (announcement: { message: string; company_id?: string }) => Promise<void>;
  onMarkAsRead?: (announcementId: string) => Promise<void>;
}

export function BroadcastView({ 
  announcements, 
  companies = [], 
  onAddAnnouncement,
  onMarkAsRead 
}: BroadcastViewProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    message: '',
    company_id: '',
    isGlobal: true,
  });

  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.message.trim()) {
      return;
    }
    
    try {
      await onAddAnnouncement?.({
        message: newAnnouncement.message,
        company_id: newAnnouncement.isGlobal ? undefined : newAnnouncement.company_id,
      });
      setNewAnnouncement({ message: '', company_id: '', isGlobal: true });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao adicionar comunicado:', error);
    }
  };

  const handleMarkAsRead = async (announcementId: string) => {
    try {
      await onMarkAsRead?.(announcementId);
    } catch (error) {
      console.error('Erro ao marcar como lido:', error);
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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const visibleAnnouncements = isAdmin
    ? announcements.filter(a => a.active)
    : announcements.filter(a => 
        a.active && (
          a.company_id === null || 
          a.company_id === undefined || 
          a.company_id === user?.company_id
        )
      );

  const sortedAnnouncements = [...visibleAnnouncements].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Mural de Comunicados
          </h1>
          <p className="text-slate-600 text-lg">
            {isAdmin ? 'Gerencie comunicados globais e específicos por empresa' : 'Acompanhe os comunicados e atualizações'}
          </p>
        </div>
        {isAdmin && onAddAnnouncement && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#2563EB] hover:bg-[#1d4ed8]">
                <Plus className="w-4 h-4 mr-2" />
                Novo Comunicado
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Comunicado</DialogTitle>
                <DialogDescription>
                  Crie um comunicado global ou específico para uma empresa.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="isGlobal">Tipo de Comunicado</Label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isGlobal"
                        checked={newAnnouncement.isGlobal}
                        onChange={() => setNewAnnouncement({ ...newAnnouncement, isGlobal: true, company_id: '' })}
                        className="w-4 h-4"
                      />
                      <span className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        Global (todos os clientes)
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isGlobal"
                        checked={!newAnnouncement.isGlobal}
                        onChange={() => setNewAnnouncement({ ...newAnnouncement, isGlobal: false })}
                        className="w-4 h-4"
                      />
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        Específico (uma empresa)
                      </span>
                    </label>
                  </div>
                </div>
                {!newAnnouncement.isGlobal && companies.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="company_id">Empresa</Label>
                    <select
                      id="company_id"
                      className="w-full p-2 border border-slate-300 rounded-md"
                      value={newAnnouncement.company_id}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, company_id: e.target.value })}
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
                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem *</Label>
                  <Textarea
                    id="message"
                    placeholder="Digite o comunicado aqui..."
                    rows={6}
                    value={newAnnouncement.message}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  className="bg-[#2563EB] hover:bg-[#1d4ed8]"
                  onClick={handleAddAnnouncement}
                  disabled={!newAnnouncement.message.trim() || (!newAnnouncement.isGlobal && !newAnnouncement.company_id)}
                >
                  Publicar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Timeline de Comunicados */}
      {sortedAnnouncements.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Megaphone className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-600 mb-2">
              Nenhum comunicado disponível
            </h3>
            <p className="text-slate-500">
              {isAdmin 
                ? 'Comece adicionando comunicados usando o botão acima.'
                : 'Não há comunicados no momento.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedAnnouncements.map((announcement) => {
            const companyName = announcement.company_id 
              ? companies.find(c => c.id === announcement.company_id)?.name 
              : null;
            
            return (
              <Card 
                key={announcement.id} 
                className="hover:shadow-md transition-shadow border-l-4 border-l-[#2563EB]"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {announcement.company_id ? (
                          <>
                            <Building2 className="w-4 h-4 text-slate-500" />
                            <Badge variant="secondary">{companyName || 'Empresa específica'}</Badge>
                          </>
                        ) : (
                          <>
                            <Globe className="w-4 h-4 text-slate-500" />
                            <Badge variant="default">Global</Badge>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(announcement.date)}</span>
                        <span>•</span>
                        <span>{getTimeAgo(announcement.date)}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {announcement.message}
                  </p>
                  {!isAdmin && onMarkAsRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4 text-[#2563EB] hover:text-[#1d4ed8] hover:bg-[#2563EB]/10"
                      onClick={() => handleMarkAsRead(announcement.id)}
                    >
                      Marcar como lido
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
