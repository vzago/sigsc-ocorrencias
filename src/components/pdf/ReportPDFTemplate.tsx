import React from 'react';
import { Page, Text, View, Document, StyleSheet, Svg, Rect } from '@react-pdf/renderer';
import { OccurrenceDisplay } from '@/types/occurrence.types';

const categoryLabels: Record<string, string> = {
  vistoria_ambiental: "Vistoria Ambiental",
  risco_vegetacao: "Risco - Vegetação/Árvore",
  incendio_vegetacao: "Incêndio em Vegetação",
  outras: "Outras Ocorrências"
};

const categoryColors: Record<string, string> = {
  vistoria_ambiental: "#10b981",
  risco_vegetacao: "#f59e0b",
  incendio_vegetacao: "#ef4444",
  outras: "#6366f1"
};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#334155',
    lineHeight: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#0f172a',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 8,
  },
  period: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginTop: 15,
    marginBottom: 8,
    paddingBottom: 4,
  },
  table: {
    width: '100%',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 4,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f1f5f9',
    fontWeight: 'bold',
  },
  col1: { width: '10%' },
  col2: { width: '20%' },
  col3: { width: '50%' },
  col4: { width: '20%', textAlign: 'right' },

  occurrenceItem: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  occHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  occTitle: {
    fontWeight: 'bold',
    fontSize: 10,
  },
  occDate: {
    fontSize: 8,
    color: '#64748b',
  },
  occDesc: {
    fontSize: 9,
    color: '#475569',
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',

  },
  chartContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 5,
  },
});

// Componente de gráfico de barras
interface BarChartProps {
  data: Record<string, number>;
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const entries = Object.entries(data);
  const maxValue = Math.max(...entries.map(([, value]) => value));

  const barHeight = 20;
  const maxBarWidth = 280;

  return (
    <View style={{ marginTop: 10 }}>
      {entries.map(([category, count]) => {
        const barWidth = (count / maxValue) * maxBarWidth;
        const color = categoryColors[category] || '#6366f1';

        return (
          <View
            key={category}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 6,
              gap: 8
            }}
          >
            {/* Category label */}
            <Text style={{
              width: 180,
              fontSize: 8,
              color: '#475569'
            }}>
              {categoryLabels[category] || category}
            </Text>

            {/* Bar container */}
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <Svg width={barWidth} height={barHeight}>
                <Rect
                  x={0}
                  y={0}
                  width={barWidth}
                  height={barHeight}
                  fill={color}
                  rx={2}
                />
              </Svg>

              {/* Value label */}
              <Text style={{
                marginLeft: 8,
                fontSize: 9,
                fontWeight: 'bold',
                color: '#0f172a',
                minWidth: 20
              }}>
                {count}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

interface ReportPDFTemplateProps {
  reportData: {
    startDate: string;
    endDate: string;
    totalOccurrences: number;
    occurrencesByCategory: Record<string, number>;
    occurrences: OccurrenceDisplay[];
  };
}

export const ReportPDFTemplate: React.FC<ReportPDFTemplateProps> = ({ reportData }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Relatório Consolidado</Text>
            <Text style={styles.subtitle}>Defesa Civil de São Carlos</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 8, color: '#64748b' }}>Período</Text>
            <Text style={styles.period}>
              {new Date(reportData.startDate).toLocaleDateString('pt-BR')} a {new Date(reportData.endDate).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        </View>

        {/* Summary Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{reportData.totalOccurrences}</Text>
            <Text style={styles.statLabel}>Total de Ocorrências</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{Object.keys(reportData.occurrencesByCategory).length}</Text>
            <Text style={styles.statLabel}>Categorias</Text>
          </View>
        </View>

        {/* Bar Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Distribuição por Categoria</Text>
          <BarChart data={reportData.occurrencesByCategory} />
        </View>

        {/* Detailed List */}
        <Text style={styles.sectionTitle}>Detalhamento das Ocorrências</Text>
        {reportData.occurrences.map((occ, index) => (
          <View key={occ.id} style={styles.occurrenceItem} wrap={false}>
            <View style={styles.occHeader}>
              <Text style={styles.occTitle}>{index + 1}. R.A. {occ.ra} - {categoryLabels[occ.category] || occ.category}</Text>
              <Text style={styles.occDate}>{occ.dateTime}</Text>
            </View>
            <Text style={{ fontSize: 8, marginBottom: 2, color: '#64748b' }}>
              {occ.address}{occ.reference ? ` - Ref: ${occ.reference}` : ''}
            </Text>
            {occ.origins && occ.origins.length > 0 && (
              <Text style={{ fontSize: 7, marginBottom: 2, color: '#64748b' }}>Origem: {occ.origins.join(', ')}</Text>
            )}
            <Text style={styles.occDesc}>
              Descrição: {occ.description}
            </Text>
            {occ.responsibleAgents && (
              <Text style={{ fontSize: 7, marginTop: 2, color: '#475569', fontWeight: 'bold' }}>Responsáveis: {occ.responsibleAgents}</Text>
            )}
          </View>
        ))}

        {/* Footer */}
        {/* <Text style={styles.footer} fixed render={({ pageNumber, totalPages }) => (
          `Relatório gerado em ${new Date().toLocaleString('pt-BR')} - Página ${pageNumber} de ${totalPages}`
        )} /> */}
      </Page>
    </Document>
  );
};
