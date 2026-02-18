import React, { createContext, useContext, useState } from 'react';

export interface Company {
  id: string;
  name: string;
  logo: string;
}

export interface Dashboard {
  id: string;
  title: string;
  company_id: string;
  thumbnail?: string;
  description: string;
  last_updated: string; 
  tags: string[];
  type: 'Power BI' | 'Excel' | 'PDF';
  is_favorite: boolean;
  embedUrl?: string; 
}

interface DataContextType {
  companies: Company[];
  dashboards: Dashboard[];
  toggleFavorite: (id: string) => void;
}

const MOCK_COMPANIES: Company[] = [
  { id: 'haleon', name: 'HALEON', logo: '/logos/haleon.png' },
  { id: 'pg', name: 'P&G', logo: '/logos/pg.png' },
  { id: 'semptcl', name: 'SEMP TCL', logo: '/logos/semptcl.png' },
  { id: 'sherwin', name: 'Sherwin-Williams', logo: '/logos/sherwin.png' },
  { id: 'bacio', name: 'Bacio di Latte', logo: '/logos/bacio.png' }
];

const INITIAL_DASHBOARDS: Dashboard[] = [
  {
    id: '1',
    title: 'Performance de Vendas - Janeiro',
    company_id: 'haleon',
    description: 'Análise detalhada das vendas do mês de janeiro por categoria e região.',
    last_updated: '2026-01-13T10:00:00', 
    tags: ['Vendas', 'Executivo'],
    type: 'Power BI',
    is_favorite: true,
    embedUrl: 'https://app.powerbi.com/view?r=eyJrIjoiYWNlNGRjMmUtOTNjNy00NmUxLWIxNTItYzIwZDEzMmVhZDQ5IiwidCI6ImI1MGFkYzllLTQ5YjEtNDQxNy1hM2I1LTljNzFiZDNmMmMyZCJ9'
  },
  {
    id: '2',
    title: 'Ruptura de Estoque',
    company_id: 'haleon',
    description: 'Monitoramento em tempo real de rupturas e oportunidades de reposição.',
    last_updated: '2026-01-13T14:30:00',
    tags: ['Logística', 'Trade'],
    type: 'Power BI',
    is_favorite: false
  },
  {
    id: '3',
    title: 'ROI de Campanhas Promocionais',
    company_id: 'semptcl',
    description: 'Análise de retorno sobre investimento em ações de trade marketing.',
    last_updated: '2026-01-12T09:15:00',
    tags: ['Marketing', 'Financeiro'],
    type: 'Power BI',
    is_favorite: false
  },
  {
    id: '4',
    title: 'Execução no PDV',
    company_id: 'pg',
    description: 'Compliance de execução de materiais de ponto de venda e planograma.',
    last_updated: '2026-01-10T11:00:00',
    tags: ['Trade', 'Operacional'],
    type: 'Power BI',
    is_favorite: true
  },

  { 
    id: 'sw1', 
    title: 'Resumo Gerencial', 
    company_id: 'sherwin', 
    description: 'Visão consolidada dos principais KPIs de vendas, atingimento de metas e performance do canal farma.',
    last_updated: '2026-01-15T16:00:00', 
    tags: ['Vendas', 'Farma'], 
    type: 'Power BI',
    is_favorite: true,
    embedUrl: 'https://app.powerbi.com/view?r=eyJrIjoiYWNlNGRjMmUtOTNjNy00NmUxLWIxNTItYzIwZDEzMmVhZDQ5IiwidCI6ImI1MGFkYzllLTQ5YjEtNDQxNy1hM2I1LTljNzFiZDNmMmMyZCJ9'
  },
  { 
    id: 'sw2', 
    title: 'Status Day (Produtividade)', 
    company_id: 'sherwin', 
    description: 'Acompanhamento diário de produtividade logística, SLA de entregas e eficiência da cadeia de supply.',
    last_updated: '2026-01-14T08:00:00', 
    tags: ['Logística'], 
    type: 'Power BI',
    is_favorite: false,
    embedUrl: 'https://app.powerbi.com/view?r=eyJrIjoiMDFiODlhYmUtOWFkMC00Y2E3LWEzYzctYmNmYWMxZWVkOGRjIiwidCI6ImI1MGFkYzllLTQ5YjEtNDQxNy1hM2I1LTljNzFiZDNmMmMyZCJ9'
  },
  { 
    id: 'sw3', 
    title: 'Ruptura de Gôndola', 
    company_id: 'sherwin', 
    description: 'Indicadores de ruptura física e virtual focados na categoria de Hair Care e Trade Marketing.',
    last_updated: '2026-01-10T13:45:00', 
    tags: ['Trade', 'Hair Care'], 
    type: 'Power BI',
    is_favorite: false,
    embedUrl: 'https://app.powerbi.com/view?r=eyJrIjoiMGU3Y2U0OTgtYmQwZC00YTViLWFhOWYtOThmNmI1MWZhYmQ0IiwidCI6ImI1MGFkYzllLTQ5YjEtNDQxNy1hM2I1LTljNzFiZDNmMmMyZCJ9'
  },
  { 
    id: 'sw4', 
    title: 'Monitoramento de Preços', 
    company_id: 'sherwin', 
    description: 'Análise de pricing e competitividade de preços no varejo (foco em TVs e Eletro).',
    last_updated: '2026-01-12T10:20:00', 
    tags: ['Varejo', 'TVs'], 
    type: 'Power BI',
    is_favorite: false,
    embedUrl: 'https://app.powerbi.com/view?r=eyJrIjoiYTdlY2ZhZDYtNTEzMS00ZGFhLWFjNmQtZjVjMGJjN2Y4N2FjIiwidCI6ImI1MGFkYzllLTQ5YjEtNDQxNy1hM2I1LTljNzFiZDNmMmMyZCJ9'
  },
  { 
    id: 'sw5', 
    title: 'Ponto Extra',
    company_id: 'sherwin',
    description: 'Mapeamento de pontos extras negociados, execução em loja e conformidade de merchandising.',
    last_updated: '2026-01-08T09:00:00',
    tags: ['Mercado', 'Eletro'],
    type: 'Power BI', 
    is_favorite: false,
    embedUrl: 'https://app.powerbi.com/view?r=eyJrIjoiOGQ1NGYxNzEtNzBhOC00MzYyLThjYzAtYzVlM2FmMzhmMDRhIiwidCI6ImI1MGFkYzllLTQ5YjEtNDQxNy1hM2I1LTljNzFiZDNmMmMyZCJ9'
  },
  { 
    id: 'sw6', 
    title: 'Share de Mercado',
    company_id: 'sherwin',
    description: 'Relatório mensal de Market Share e impacto das campanhas de marketing digital.',
    last_updated: '2026-01-11T15:30:00',
    tags: ['Marketing', 'Campanhas'],
    type: 'Power BI', 
    is_favorite: false,
    embedUrl: 'https://app.powerbi.com/view?r=eyJrIjoiMWExZDg4YzQtMDliNi00ZTZkLThhNjAtNjQ2NDkyNTI5ZGRiIiwidCI6ImI1MGFkYzllLTQ5YjEtNDQxNy1hM2I1LTljNzFiZDNmMmMyZCJ9'
  },
  { 
    id: 'sw7', 
    title: 'Sellout Performance', 
    company_id: 'sherwin', 
    description: 'Deep dive em dados de sell-out por região, vendedor e categoria de produtos.',
    last_updated: '2026-01-15T17:00:00', 
    tags: ['Vendas', 'Farma'], 
    type: 'Power BI',
    is_favorite: false,
    embedUrl: 'https://app.powerbi.com/view?r=eyJrIjoiYjZjNjAzZTAtMjYzNi00MzllLTlmNzgtMmZlMWRhOWJkMzYzIiwidCI6ImI1MGFkYzllLTQ5YjEtNDQxNy1hM2I1LTljNzFiZDNmMmMyZCJ9'
  },
  { 
    id: 'dash-bacio-1', 
    title: 'Gestão Operacional', 
    company_id: 'bacio', // Deve ser igual ao id criado em MOCK_COMPANIES
    description: 'Monitoramento de KPIs operacionais e indicadores de performance da rede.',
    last_updated: new Date().toISOString(), 
    tags: ['Operações', 'Gestão'], 
    type: 'Power BI',
    is_favorite: true,
    embedUrl: 'https://app.powerbi.com/view?r=eyJrIjoiYjA0ZWZhM2EtZDliZi00MmQ2LWE4YTQtNWUwOTBmZmYxOWI5IiwidCI6ImI1MGFkYzllLTQ5YjEtNDQxNy1hM2I1LTljNzFiZDNmMmMyZCJ9'
  }
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [dashboards, setDashboards] = useState<Dashboard[]>(INITIAL_DASHBOARDS);

  const toggleFavorite = (id: string) => {
    setDashboards(prev => prev.map(dash => 
      dash.id === id ? { ...dash, is_favorite: !dash.is_favorite } : dash
    ));
  };

  return (
    <DataContext.Provider value={{ 
      companies: MOCK_COMPANIES, 
      dashboards,
      toggleFavorite
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}