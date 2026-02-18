import { useState, useEffect } from "react";
import { 
  Building2, CheckCircle2, Loader2, FileText
} from "lucide-react"; 
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/app/components/ui/dialog";
import { Switch } from "@/app/components/ui/switch";
import { customerService } from "@/services/customerService";
import { toast } from "sonner";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientIdToEdit?: number | null;
  onSuccess?: () => void;
}

export function ClientRegistrationModal({ 
  isOpen, onClose, clientIdToEdit, onSuccess 
}: ClientModalProps) {
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    document: "",
    active: true
  });

  useEffect(() => {
    if (isOpen) {
      if (clientIdToEdit) {
        loadData(clientIdToEdit);
      } else {
        setFormData({ name: "", document: "", active: true });
      }
    }
  }, [isOpen, clientIdToEdit]);

  const loadData = async (id: number) => {
    setIsLoadingData(true);
    try {
      const client = await customerService.getById(id);
      setFormData({
        name: client.name || "",
        document: client.document || "",
        active: client.active !== false
      });
    } catch (error) {
      toast.error("Erro ao carregar dados do cliente.");
      onClose();
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsLoading(true);
    try {
      await customerService.save({
        id: clientIdToEdit || undefined,
        ...formData
      });

      toast.success(clientIdToEdit ? "Cliente atualizado!" : "Cliente cadastrado!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar cliente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            {clientIdToEdit ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
          <DialogDescription>
            Gerencie as informações da empresa cliente.
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Empresa</Label>
              <Input 
                id="name" 
                placeholder="Ex: Tech Solutions Ltda" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc">Documento (CNPJ/CPF)</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  id="doc" 
                  placeholder="00.000.000/0001-00" 
                  className="pl-9 bg-white"
                  value={formData.document}
                  onChange={(e) => setFormData({...formData, document: e.target.value})}
                />
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700">Contrato Ativo</span>
                <span className="text-xs text-slate-500">Desative para bloquear acesso.</span>
              </div>
              <Switch 
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({...formData, active: checked})}
              />
            </div>

            <DialogFooter className="pt-4 border-t mt-4">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}