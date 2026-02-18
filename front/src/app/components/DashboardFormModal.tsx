import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import {
  TrendingUp,
  PackageX,
  PieChart,
  MapPin,
  DollarSign,
  Store,
  ShoppingCart,
  BarChart3,
  LineChart,
  Users,
} from 'lucide-react';

interface DashboardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dashboard: {
    title: string;
    description: string;
    embedUrl: string;
    icon: string;
  }) => void;
}

const iconOptions = [
  { value: 'TrendingUp', label: 'Tendência (TrendingUp)', Icon: TrendingUp },
  { value: 'PackageX', label: 'Estoque (PackageX)', Icon: PackageX },
  { value: 'PieChart', label: 'Pizza (PieChart)', Icon: PieChart },
  { value: 'MapPin', label: 'Localização (MapPin)', Icon: MapPin },
  { value: 'DollarSign', label: 'Dinheiro (DollarSign)', Icon: DollarSign },
  { value: 'Store', label: 'Loja (Store)', Icon: Store },
  { value: 'ShoppingCart', label: 'Carrinho (ShoppingCart)', Icon: ShoppingCart },
  { value: 'BarChart3', label: 'Barras (BarChart3)', Icon: BarChart3 },
  { value: 'LineChart', label: 'Linhas (LineChart)', Icon: LineChart },
  { value: 'Users', label: 'Pessoas (Users)', Icon: Users },
];

export function DashboardFormModal({ isOpen, onClose, onSubmit }: DashboardFormModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    embedUrl: '',
    icon: 'TrendingUp',
  });

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({ title: '', description: '', embedUrl: '', icon: 'TrendingUp' });
  };

  const selectedIcon = iconOptions.find((opt) => opt.value === formData.icon);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Relatório</DialogTitle>
          <DialogDescription>
            Configure um novo dashboard do Power BI para este cliente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Relatório</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Performance de Vendas"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o que este relatório mostra..."
              rows={3}
            />
            <p className="text-xs text-slate-500">
              Ex: "Dados atualizados a cada 24h"
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="embedUrl">URL do Embed do Power BI</Label>
            <Input
              id="embedUrl"
              value={formData.embedUrl}
              onChange={(e) => setFormData({ ...formData, embedUrl: e.target.value })}
              placeholder="https://app.powerbi.com/view?r=..."
            />
            <p className="text-xs text-slate-500">
              Cole a URL de incorporação gerada no Power BI
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Ícone do Card</Label>
            <Select
              value={formData.icon}
              onValueChange={(value) => setFormData({ ...formData, icon: value })}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  {selectedIcon && <selectedIcon.Icon className="w-4 h-4" />}
                  <span>{selectedIcon?.label}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.Icon className="w-4 h-4" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview do Card */}
          <div className="pt-4 border-t border-slate-200">
            <Label className="text-xs text-slate-600 mb-2 block">Preview do Card:</Label>
            <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  {selectedIcon && (
                    <selectedIcon.Icon className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-slate-900 mb-1">
                    {formData.title || 'Título do Relatório'}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {formData.description || 'Descrição do relatório aparecerá aqui...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!formData.title || !formData.embedUrl}
          >
            Criar Relatório
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
