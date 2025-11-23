import React from 'react';
import { OccurrenceDisplay } from '@/types/occurrence.types';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { FileText, Calendar, MapPin } from 'lucide-react';

interface ReportPDFTemplateProps {
  reportData: {
    startDate: string;
    endDate: string;
    totalOccurrences: number;
    occurrencesByCategory: Record<string, number>;
    occurrences: OccurrenceDisplay[];
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const ReportPDFTemplate: React.FC<ReportPDFTemplateProps> = ({ reportData }) => {
  const categoryData = Object.entries(reportData.occurrencesByCategory).map(([name, value]) => ({
    name,
    value
  }));

  // Calculate daily stats
  const dailyStats = React.useMemo(() => {
    const stats: Record<string, number> = {};
    reportData.occurrences.forEach(occ => {
      if (occ.startDateTimeIso) {
        const date = new Date(occ.startDateTimeIso).toLocaleDateString('pt-BR');
        stats[date] = (stats[date] || 0) + 1;
      }
    });
    return Object.entries(stats)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split('/').map(Number);
        const [dayB, monthB, yearB] = b.date.split('/').map(Number);
        return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
      });
  }, [reportData.occurrences]);

  return (
    <div id="report-pdf-content" className="w-[210mm] min-h-[297mm] bg-white p-8 text-slate-900 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-primary pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">Relatório Consolidado</h1>
          <p className="text-sm text-slate-500">Defesa Civil de São Carlos</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500">Período</div>
          <div className="text-lg font-bold text-slate-900">
            {new Date(reportData.startDate).toLocaleDateString('pt-BR')} a {new Date(reportData.endDate).toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
          <div className="text-3xl font-bold text-primary">{reportData.totalOccurrences}</div>
          <div className="text-sm text-slate-500">Total de Ocorrências</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
          <div className="text-3xl font-bold text-primary">{Object.keys(reportData.occurrencesByCategory).length}</div>
          <div className="text-sm text-slate-500">Categorias Diferentes</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
          <div className="text-3xl font-bold text-primary">{dailyStats.length}</div>
          <div className="text-sm text-slate-500">Dias com Ocorrências</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-8 mb-8">
        {/* Category Chart */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-center">Distribuição por Categoria</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Chart */}
        {dailyStats.length > 0 && (
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-center">Ocorrências por Dia</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" name="Ocorrências" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Detailed List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-primary border-b border-primary/20 pb-2">
          <FileText className="w-5 h-5" />
          Detalhamento das Ocorrências
        </h2>

        <div className="space-y-2">
          {reportData.occurrences.map((occ, index) => (
            <div key={occ.id} className="flex items-start gap-4 p-3 bg-slate-50 rounded border border-slate-100 text-sm break-inside-avoid">
              <div className="font-mono font-bold text-slate-500 w-8">{index + 1}.</div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold text-primary">R.A. {occ.ra}</span>
                  <span className="text-slate-500 text-xs">{occ.dateTime}</span>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs bg-white">{occ.category}</Badge>
                  <span className="text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {occ.address}
                  </span>
                </div>
                <p className="text-slate-600 line-clamp-2 text-xs">{occ.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
        Relatório gerado automaticamente pelo Sistema de Registro Digital de Ocorrências em {new Date().toLocaleString('pt-BR')}
      </div>
    </div>
  );
};
