import { pdf } from '@react-pdf/renderer';
import React from 'react';
import { OccurrenceDisplay } from '@/types/occurrence.types';
import { OccurrencePDFDocument } from '@/components/pdf/OccurrencePDFDocument';
import { ReportPDFTemplate } from '@/components/pdf/ReportPDFTemplate';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Helper function to generate and save PDF blob
const savePDF = async (pdfElement: React.ReactElement, filename: string) => {
  try {
    const blob = await pdf(pdfElement).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const generateOccurrencePDF = async (occurrence: OccurrenceDisplay): Promise<void> => {
  await savePDF(
    React.createElement(OccurrencePDFDocument, { occurrence }),
    `Ocorrencia_${occurrence.ra}_${new Date().toISOString().split('T')[0]}.pdf`
  );
};

export const generateReportPDF = async (
  reportData: {
    startDate: string;
    endDate: string;
    totalOccurrences: number;
    occurrencesByCategory: Record<string, number>;
    occurrences: OccurrenceDisplay[];
  }
): Promise<void> => {
  await savePDF(
    React.createElement(ReportPDFTemplate, { reportData }),
    `Relatorio_Ocorrencias_${reportData.startDate}_${reportData.endDate}.pdf`
  );
};

// Legacy/Utility function for other elements if needed (kept for compatibility or other uses)
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
  const pdfDoc = new jsPDF('p', 'mm', 'a4');

  const imgWidth = 210;
  const pageHeight = 297;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;

  let position = 0;

  pdfDoc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdfDoc.addPage();
    pdfDoc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdfDoc.save(filename);
};