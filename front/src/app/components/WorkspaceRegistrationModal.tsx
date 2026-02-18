import { useState, useEffect } from "react";
import { 
  Layout, Loader2, Link as LinkIcon 
} from "lucide-react"; 
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/app/components/ui/dialog";
import { workspaceService } from "@/services/workspaceService";
import { toast } from "sonner";

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceIdToEdit?: number | null;
  initialData?: any; 
  onSuccess?: () => void;
}

export function WorkspaceRegistrationModal({ 
  isOpen, onClose, workspaceIdToEdit, initialData, onSuccess 
}: WorkspaceModalProps) {
  
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    url: ""
  });

  useEffect(() => {
    if (isOpen) {
      if (workspaceIdToEdit && initialData) {
        setFormData({
          name: initialData.name || "",
          url: initialData.url || ""
        });
      } else {
        setFormData({ name: "", url: "" });
      }
    }
  }, [isOpen, workspaceIdToEdit, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.warning("O nome do Workspace é obrigatório.");
      return;
    }

    setIsLoading(true);
    try {
      await workspaceService.save({
        id: workspaceIdToEdit || undefined,
        name: formData.name,
        url: formData.url
      });

      toast.success(workspaceIdToEdit ? "Workspace atualizado!" : "Workspace criado!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error("Erro ao salvar workspace.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-blue-600" />
            {workspaceIdToEdit ? "Editar Workspace" : "Novo Workspace"}
          </DialogTitle>
          <DialogDescription>
            Defina o nome e o link da área de trabalho.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Workspace</Label>
            <Input 
              id="name" 
              placeholder="Ex: Comercial - Bacio di Latte" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL do Relatório (PowerBI/Embed)</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                id="url" 
                className="pl-9"
                placeholder="https://app.powerbi.com/..." 
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}