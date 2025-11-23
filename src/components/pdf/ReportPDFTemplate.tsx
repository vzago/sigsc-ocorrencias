import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { OccurrenceDisplay } from '@/types/occurrence.types';

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
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
  },
});

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

        {/* Categories Table (Replacing Pie Chart) */}
        <View>
          <Text style={styles.sectionTitle}>Distribuição por Categoria</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={{ width: '70%', paddingLeft: 4 }}>Categoria</Text>
              <Text style={{ width: '30%', textAlign: 'right', paddingRight: 4 }}>Quantidade</Text>
            </View>
            {Object.entries(reportData.occurrencesByCategory).map(([category, count], index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={{ width: '70%', paddingLeft: 4 }}>{category}</Text>
                <Text style={{ width: '30%', textAlign: 'right', paddingRight: 4 }}>{count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Detailed List */}
        <Text style={styles.sectionTitle}>Detalhamento das Ocorrências</Text>
        {reportData.occurrences.map((occ, index) => (
          <View key={occ.id} style={styles.occurrenceItem} wrap={false}>
            <View style={styles.occHeader}>
              <Text style={styles.occTitle}>{index + 1}. R.A. {occ.ra} - {occ.category}</Text>
              <Text style={styles.occDate}>{occ.dateTime}</Text>
            </View>
            <Text style={{ fontSize: 8, marginBottom: 2 }}>{occ.address}</Text>
            <Text style={styles.occDesc}>
              {occ.description}
            </Text>
          </View>
        ))}

        {/* Footer */}
        <Text style={styles.footer} fixed render={({ pageNumber, totalPages }) => (
          `Relatório gerado em ${new Date().toLocaleString('pt-BR')} - Página ${pageNumber} de ${totalPages}`
        )} />
      </Page>
    </Document>
  );
};

