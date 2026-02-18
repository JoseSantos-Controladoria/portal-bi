import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { 
  FileText, 
  Upload, 
  Download,
  File,
  FileSpreadsheet,
  Presentation,
  X,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Document } from '@/types';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

interface FilesViewProps {
  documents: Document[];
  onUpload?: (file: File, companyId: string) => Promise<void>;
  onDelete?: (documentId: string) => Promise<void>;
  companies?: Array<{ id: string; name: string }>;
}

const FILE_TYPES = {
  'application/pdf': { icon: FileText, label: 'PDF', color: 'text-red-600' },
  'application/vnd.ms-powerpoint': { icon: Presentation, label: 'PPT', color: 'text-orange-600' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: Presentation, label: 'PPTX', color: 'text-orange-600' },
  'application/vnd.ms-excel': { icon: FileSpreadsheet, label: 'XLS', color: 'text-green-600' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: FileSpreadsheet, label: 'XLSX', color: 'text-green-600' },
};

const getFileIcon = (fileType: string) => {
  const typeConfig = FILE_TYPES[fileType as keyof typeof FILE_TYPES];
  if (typeConfig) {
    const Icon = typeConfig.icon;
    return <Icon className={`w-5 h-5 ${typeConfig.color}`} />;
  }
  return <File className="w-5 h-5 text-slate-600" />;
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function FilesView({ documents, onUpload, onDelete, companies = [] }: FilesViewProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!onUpload) return;
    
    const companyId = isAdmin ? selectedCompanyId : (user?.company_id || '');
    
    if (isAdmin && !selectedCompanyId) {
      toast.error('Selecione uma empresa antes de fazer upload');
      return;
    }

    if (!companyId) {
      toast.error('Empresa não identificada');
      return;
    }

    setIsUploading(true);
    try {
      for (const file of acceptedFiles) {
        await onUpload(file, companyId);
      }
      toast.success('Arquivo(s) enviado(s) com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer upload do arquivo');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  }, [onUpload, isAdmin, selectedCompanyId, user?.company_id]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    disabled: isUploading || (isAdmin && !selectedCompanyId),
  });

  const handleDownload = (document: Document) => {
    window.open(document.file_url, '_blank');
  };

  const handleDelete = async (documentId: string) => {
    if (!onDelete) return;
    if (!confirm('Tem certeza que deseja excluir este arquivo?')) return;
    
    try {
      await onDelete(documentId);
      toast.success('Arquivo excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir arquivo');
      console.error(error);
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

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Arquivos
        </h1>
        <p className="text-slate-600 text-lg">
          {isAdmin ? 'Gerencie e compartilhe arquivos com seus clientes' : 'Acesse os arquivos disponíveis para download'}
        </p>
      </div>

      {/* Upload Area (Admin) */}
      {isAdmin && onUpload && (
        <Card className="mb-8 border-2 border-dashed border-slate-300">
          <CardHeader>
            <CardTitle>Upload de Arquivos</CardTitle>
            <CardDescription>
              Selecione a empresa e faça upload de PDFs, PPTs ou planilhas Excel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {companies.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Selecione a Empresa</label>
                <select
                  className="w-full p-2 border border-slate-300 rounded-md"
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
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
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-[#2563EB] bg-[#2563EB]/5'
                  : 'border-slate-300 hover:border-[#2563EB]/50'
              } ${isUploading || (isAdmin && !selectedCompanyId) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-[#2563EB] font-medium">Solte os arquivos aqui...</p>
              ) : (
                <div>
                  <p className="text-slate-600 mb-2">
                    Arraste arquivos aqui ou clique para selecionar
                  </p>
                  <p className="text-sm text-slate-500">
                    Formatos aceitos: PDF, PPT, PPTX, XLS, XLSX
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Arquivos */}
      {documents.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-600 mb-2">
              Nenhum arquivo disponível
            </h3>
            <p className="text-slate-500">
              {isAdmin 
                ? 'Comece fazendo upload de arquivos usando a área acima.'
                : 'Nenhum arquivo foi compartilhado ainda.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {documents.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getFileIcon(document.file_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {document.file_name}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                        <span>{formatFileSize(document.file_size)}</span>
                        <span>•</span>
                        <span>{getTimeAgo(document.created_at)}</span>
                        <Badge variant="secondary" className="ml-2">
                          {document.file_type.split('/')[1]?.toUpperCase() || 'ARQUIVO'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(document)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    {isAdmin && onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(document.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
