import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { OccurrenceDisplay } from '@/types/occurrence.types';

// Register a font if needed, otherwise use standard fonts
// Font.register({ family: 'Roboto', src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf' });

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#334155', // slate-700
    lineHeight: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#0f172a', // primary color (approx)
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b', // slate-500
    marginTop: 8,
  },
  raNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  dateGenerated: {
    fontSize: 8,
    color: '#94a3b8',
    marginTop: 8,
  },
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc', // slate-50
    padding: 10,
    borderRadius: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0', // slate-200
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 8,
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  col2: {
    flexDirection: 'row',
    gap: 20,
  },
  half: {
    width: '50%',
  },
  label: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    color: '#0f172a',
    fontWeight: 'medium',
  },
  field: {
    marginBottom: 6,
  },
  descriptionBox: {
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    textAlign: 'justify',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
});

const categoryLabels: Record<string, string> = {
  vistoria_ambiental: "Vistoria Ambiental",
  risco_vegetacao: "Risco - Vegetação/Árvore",
  incendio_vegetacao: "Incêndio em Vegetação",
  outras: "Outras Ocorrências"
};

const statusLabels: Record<string, string> = {
  aberta: "Aberta",
  andamento: "Em Andamento",
  fechada: "Fechada"
};

interface OccurrencePDFDocumentProps {
  occurrence: OccurrenceDisplay;
}

export const OccurrencePDFDocument: React.FC<OccurrencePDFDocumentProps> = ({ occurrence }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View>
              <Text style={styles.title}>Relatório de Ocorrência</Text>
              <Text style={styles.subtitle}>Defesa Civil de São Carlos</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.raNumber}>R.A. {occurrence.ra}</Text>
            <Text style={styles.dateGenerated}>Gerado em {new Date().toLocaleDateString('pt-BR')}</Text>
          </View>
        </View>

        {/* Status Banner */}
        <View style={styles.statusBanner}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: '#475569', marginRight: 5 }}>STATUS ATUAL:</Text>
            <Text style={styles.statusText}>{statusLabels[occurrence.status] || occurrence.status}</Text>
          </View>
          <Text style={{ fontSize: 10 }}>Data de Registro: {occurrence.dateTime}</Text>
        </View>

        {/* Two Column Layout for General Data and Location */}
        <View style={styles.col2}>
          {/* Dados Gerais */}
          <View style={styles.half}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dados Gerais</Text>

              {occurrence.sspdsNumber && (
                <View style={styles.field}>
                  <Text style={styles.label}>Número SSPDS</Text>
                  <Text style={styles.value}>{occurrence.sspdsNumber}</Text>
                </View>
              )}

              <View style={styles.field}>
                <Text style={styles.label}>Categoria</Text>
                <Text style={styles.value}>{categoryLabels[occurrence.category] || occurrence.category}</Text>
              </View>

              {occurrence.subcategory && (
                <View style={styles.field}>
                  <Text style={styles.label}>Subcategoria</Text>
                  <Text style={styles.value}>{occurrence.subcategory}</Text>
                </View>
              )}

              {occurrence.cobradeCode && (
                <View style={styles.field}>
                  <Text style={styles.label}>Código COBRADE</Text>
                  <Text style={styles.value}>{occurrence.cobradeCode}</Text>
                </View>
              )}

              {occurrence.endDateTime && (
                <View style={styles.field}>
                  <Text style={styles.label}>Data/Hora Fim</Text>
                  <Text style={styles.value}>{occurrence.endDateTime}</Text>
                </View>
              )}

              {occurrence.isConfidential !== undefined && (
                <View style={styles.field}>
                  <Text style={styles.label}>Confidencial</Text>
                  <Text style={styles.value}>{occurrence.isConfidential ? 'Sim' : 'Não'}</Text>
                </View>
              )}

              {occurrence.origins && occurrence.origins.length > 0 && (
                <View style={styles.field}>
                  <Text style={styles.label}>Origem do Chamado</Text>
                  <View style={styles.tagContainer}>
                    {occurrence.origins.map((origin, i) => (
                      <Text key={i} style={styles.tag}>{origin}</Text>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Localização */}
          <View style={styles.half}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Localização</Text>

              <View style={styles.field}>
                <Text style={styles.label}>Endereço</Text>
                <Text style={styles.value}>{occurrence.address}</Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                {occurrence.addressNumber && (
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.label}>Número</Text>
                    <Text style={styles.value}>{occurrence.addressNumber}</Text>
                  </View>
                )}
                {occurrence.neighborhood && (
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.label}>Bairro</Text>
                    <Text style={styles.value}>{occurrence.neighborhood}</Text>
                  </View>
                )}
              </View>

              {occurrence.reference && (
                <View style={styles.field}>
                  <Text style={styles.label}>Referência</Text>
                  <Text style={styles.value}>{occurrence.reference}</Text>
                </View>
              )}

              {(occurrence.latitude || occurrence.longitude || occurrence.altitude) && (
                <View style={styles.field}>
                  <Text style={styles.label}>Coordenadas</Text>
                  <Text style={styles.value}>
                    {occurrence.latitude && `Lat: ${occurrence.latitude}`}
                    {occurrence.latitude && occurrence.longitude && ' / '}
                    {occurrence.longitude && `Long: ${occurrence.longitude}`}
                    {occurrence.altitude && ` / Alt: ${occurrence.altitude}m`}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Two Column Layout for Requester and Specific Data */}
        <View style={styles.col2}>
          {/* Solicitante */}
          <View style={styles.half}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Solicitante</Text>

              <View style={styles.field}>
                <Text style={styles.label}>Nome</Text>
                <Text style={styles.value}>{occurrence.requester}</Text>
              </View>

              {occurrence.institution && (
                <View style={styles.field}>
                  <Text style={styles.label}>Instituição</Text>
                  <Text style={styles.value}>{occurrence.institution}</Text>
                </View>
              )}

              {occurrence.phone && (
                <View style={styles.field}>
                  <Text style={styles.label}>Telefone</Text>
                  <Text style={styles.value}>{occurrence.phone}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Dados Específicos */}
          <View style={styles.half}>
            {(occurrence.areaType || occurrence.affectedArea || occurrence.temperature || occurrence.humidity || occurrence.impactType || occurrence.impactMagnitude || occurrence.hasWaterBody !== undefined) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dados Específicos</Text>

                {occurrence.areaType && (
                  <View style={styles.field}>
                    <Text style={styles.label}>Tipo de Área</Text>
                    <Text style={styles.value}>{occurrence.areaType}</Text>
                  </View>
                )}

                {occurrence.affectedArea && (
                  <View style={styles.field}>
                    <Text style={styles.label}>Área Atingida</Text>
                    <Text style={styles.value}>{occurrence.affectedArea} m²</Text>
                  </View>
                )}

                {(occurrence.temperature || occurrence.humidity) && (
                  <View style={styles.field}>
                    <Text style={styles.label}>Clima</Text>
                    <Text style={styles.value}>
                      {occurrence.temperature ? `${occurrence.temperature}°C` : ''}
                      {occurrence.temperature && occurrence.humidity ? ' / ' : ''}
                      {occurrence.humidity ? `${occurrence.humidity}%` : ''}
                    </Text>
                  </View>
                )}

                {occurrence.hasWaterBody !== undefined && (
                  <View style={styles.field}>
                    <Text style={styles.label}>Presença de Corpo d'Água</Text>
                    <Text style={styles.value}>{occurrence.hasWaterBody ? 'Sim' : 'Não'}</Text>
                  </View>
                )}

                {occurrence.impactType && (
                  <View style={styles.field}>
                    <Text style={styles.label}>Tipo de Impacto</Text>
                    <Text style={styles.value}>{occurrence.impactType}</Text>
                  </View>
                )}

                {occurrence.impactMagnitude && (
                  <View style={styles.field}>
                    <Text style={styles.label}>Magnitude do Impacto</Text>
                    <Text style={styles.value}>{occurrence.impactMagnitude}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Descrição */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição da Ocorrência</Text>
          <View style={styles.descriptionBox}>
            <Text>{occurrence.description}</Text>
          </View>
        </View>

        {/* Relato Detalhado */}
        {occurrence.detailedReport && (
          <View style={styles.section} break={occurrence.detailedReport.length > 500}>
            <Text style={styles.sectionTitle}>Relato Detalhado</Text>
            <View style={styles.descriptionBox}>
              <Text>{occurrence.detailedReport}</Text>
            </View>
          </View>
        )}

        {/* Observações */}
        {occurrence.observations && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <View style={styles.descriptionBox}>
              <Text>{occurrence.observations}</Text>
            </View>
          </View>
        )}

        {/* Providências e Recursos */}
        <View style={styles.col2}>
          {/* Providências */}
          <View style={styles.half}>
            {(occurrence.teamActions?.length || occurrence.activatedOrganisms?.length) ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Providências</Text>

                {occurrence.teamActions && occurrence.teamActions.length > 0 && (
                  <View style={styles.field}>
                    <Text style={styles.label}>Ações da Equipe</Text>
                    <View style={styles.tagContainer}>
                      {occurrence.teamActions.map((action, i) => (
                        <Text key={i} style={styles.tag}>{action}</Text>
                      ))}
                    </View>
                  </View>
                )}

                {occurrence.activatedOrganisms && occurrence.activatedOrganisms.length > 0 && (
                  <View style={styles.field}>
                    <Text style={styles.label}>Órgãos Acionados</Text>
                    <View style={styles.tagContainer}>
                      {occurrence.activatedOrganisms.map((org, i) => (
                        <Text key={i} style={styles.tag}>{org}</Text>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ) : null}
          </View>

          {/* Recursos */}
          <View style={styles.half}>
            {(occurrence.vehicles?.length || occurrence.materials) ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recursos</Text>

                {occurrence.vehicles && occurrence.vehicles.length > 0 && (
                  <View style={styles.field}>
                    <Text style={styles.label}>Veículos</Text>
                    <View style={styles.tagContainer}>
                      {occurrence.vehicles.map((vehicle, i) => (
                        <Text key={i} style={styles.tag}>{vehicle}</Text>
                      ))}
                    </View>
                  </View>
                )}

                {occurrence.materials && (
                  <View style={styles.field}>
                    <Text style={styles.label}>Materiais</Text>
                    <Text style={styles.value}>{occurrence.materials}</Text>
                  </View>
                )}
              </View>
            ) : null}
          </View>
        </View>

        {/* Footer with Responsible Agents */}
        {occurrence.responsibleAgents && (
          <View style={styles.footer} fixed>
            <Text style={styles.label}>Agentes Responsáveis</Text>
            <Text style={styles.value}>{occurrence.responsibleAgents}</Text>
            <Text style={[styles.dateGenerated, { marginTop: 5, textAlign: 'right' }]} render={({ pageNumber, totalPages }) => (
              `${pageNumber} / ${totalPages}`
            )} />
          </View>
        )}
      </Page>
    </Document>
  );
};
