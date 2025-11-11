import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface OccurrenceForPDF {
  id: string;
  ra: string;
  dateTime: string;
  category: string;
  status: string;
  address: string;
  requester: string;
  description: string;
  expandedData?: Record<string, string | number>;
}

export const generateOccurrencePDF = async (occurrence: OccurrenceForPDF): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Header
  pdf.setFontSize(18);
  pdf.text('DEFESA CIVIL DE SÃO CARLOS', 105, 20, { align: 'center' });
  pdf.setFontSize(14);
  pdf.text('Sistema de Registro Digital de Ocorrências', 105, 30, { align: 'center' });
  
  // Dados principais
  pdf.setFontSize(12);
  let yPosition = 50;
  
  pdf.text(`Registro de Atendimento (R.A.): ${occurrence.ra}`, 20, yPosition);
  yPosition += 10;
  
  pdf.text(`Data/Hora: ${new Date(occurrence.dateTime).toLocaleString('pt-BR')}`, 20, yPosition);
  yPosition += 10;
  
  pdf.text(`Categoria: ${occurrence.category}`, 20, yPosition);
  yPosition += 10;
  
  pdf.text(`Status: ${occurrence.status}`, 20, yPosition);
  yPosition += 10;
  
  pdf.text(`Endereço: ${occurrence.address}`, 20, yPosition);
  yPosition += 15;
  
  // Dados do Solicitante
  pdf.setFontSize(14);
  pdf.text('DADOS DO SOLICITANTE', 20, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(12);
  pdf.text(`Nome: ${occurrence.requester}`, 20, yPosition);
  yPosition += 15;
  
  // Descrição
  pdf.setFontSize(14);
  pdf.text('DESCRIÇÃO DA OCORRÊNCIA', 20, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(12);
  const splitDescription = pdf.splitTextToSize(occurrence.description, 170);
  pdf.text(splitDescription, 20, yPosition);
  yPosition += splitDescription.length * 5 + 15;
  
  // Dados específicos por categoria
  if (occurrence.expandedData) {
    pdf.setFontSize(14);
    pdf.text('DADOS ESPECÍFICOS', 20, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(12);
    Object.entries(occurrence.expandedData).forEach(([key, value]) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(`${key}: ${value}`, 20, yPosition);
      yPosition += 8;
    });
  }
  
  // Footer
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
    pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 285);
  }
  
  // Download
  pdf.save(`Ocorrencia_${occurrence.ra}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateReportPDF = async (
  reportData: {
    startDate: string;
    endDate: string;
    totalOccurrences: number;
    occurrencesByCategory: Record<string, number>;
    occurrences: OccurrenceForPDF[];
  }
): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Header
  pdf.setFontSize(18);
  pdf.text('DEFESA CIVIL DE SÃO CARLOS', 105, 20, { align: 'center' });
  pdf.setFontSize(14);
  pdf.text('Relatório Consolidado de Ocorrências', 105, 30, { align: 'center' });
  
  let yPosition = 50;
  
  // Período
  pdf.setFontSize(12);
  pdf.text(`Período: ${reportData.startDate} a ${reportData.endDate}`, 20, yPosition);
  yPosition += 15;
  
  // Estatísticas gerais
  pdf.setFontSize(14);
  pdf.text('ESTATÍSTICAS GERAIS', 20, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(12);
  pdf.text(`Total de Ocorrências: ${reportData.totalOccurrences}`, 20, yPosition);
  yPosition += 15;
  
  // Por categoria
  pdf.setFontSize(14);
  pdf.text('OCORRÊNCIAS POR CATEGORIA', 20, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(12);
  Object.entries(reportData.occurrencesByCategory).forEach(([category, count]) => {
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 20;
    }
    pdf.text(`${category}: ${count}`, 20, yPosition);
    yPosition += 8;
  });
  
  yPosition += 10;
  
  // Lista de ocorrências
  if (yPosition > 250) {
    pdf.addPage();
    yPosition = 20;
  }
  
  pdf.setFontSize(14);
  pdf.text('DETALHAMENTO DAS OCORRÊNCIAS', 20, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(10);
  reportData.occurrences.forEach((occurrence, index) => {
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.text(`${index + 1}. R.A.: ${occurrence.ra}`, 20, yPosition);
    yPosition += 5;
    pdf.text(`   Data: ${new Date(occurrence.dateTime).toLocaleDateString('pt-BR')}`, 20, yPosition);
    yPosition += 5;
    pdf.text(`   Categoria: ${occurrence.category}`, 20, yPosition);
    yPosition += 5;
    pdf.text(`   Endereço: ${occurrence.address}`, 20, yPosition);
    yPosition += 8;
  });
  
  // Footer
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
    pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 285);
  }
  
  // Download
  pdf.save(`Relatorio_Ocorrencias_${reportData.startDate}_${reportData.endDate}.pdf`);
};

export const generateElementToPDF = async (elementId: string, filename: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Elemento não encontrado');
  }
  
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true
  });
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  const imgWidth = 210;
  const pageHeight = 295;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  
  let position = 0;
  
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  
  pdf.save(filename);
};