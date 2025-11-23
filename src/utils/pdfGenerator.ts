import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { createRoot } from 'react-dom/client';
import React from 'react';
import { OccurrenceDisplay } from '@/types/occurrence.types';
import { OccurrencePDFTemplate } from '@/components/pdf/OccurrencePDFTemplate';
import { ReportPDFTemplate } from '@/components/pdf/ReportPDFTemplate';

// Helper function to render component, capture it, and generate PDF
const generatePDFFromComponent = async (
  component: React.ReactNode,
  filename: string
): Promise<void> => {
  // Create a container element
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = '210mm'; // A4 width
  document.body.appendChild(container);

  try {
    // Render the component
    const root = createRoot(container);
    root.render(component);

    // Wait for render and potential animations (like charts)
    await new Promise(resolve => setTimeout(resolve, 1000));

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
    const margin = 10; // 10mm margin
    const contentWidth = pdfWidth - (margin * 2);
    const contentHeight = pdfHeight - (margin * 2);

    let currentY = margin;

    // Find the main content wrapper
    const contentWrapper = container.firstElementChild as HTMLElement;
    if (!contentWrapper) {
      throw new Error("PDF content wrapper not found");
    }

    // Iterate over direct children to handle pagination
    const children = Array.from(contentWrapper.children) as HTMLElement[];

    for (let i = 0; i < children.length; i++) {
      const child = children[i];

      // Capture the child element
      if (child.offsetHeight === 0 || child.offsetWidth === 0) {
        continue;
      }

      const canvas = await html2canvas(child, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      if (canvas.width === 0 || canvas.height === 0) {
        continue;
      }

      const imgData = canvas.toDataURL('image/png');

      // Verify if we got a valid data URL
      if (imgData === 'data:,') {
        continue;
      }

      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Check if we need a new page
      if (currentY + imgHeight > pdfHeight - margin) {
        pdf.addPage();
        currentY = margin;
      }

      try {
        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 5; // Add 5mm gap between elements
      } catch (e) {
        console.warn('Failed to add image to PDF:', e);
      }
    }

    pdf.save(filename);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    // Cleanup
    document.body.removeChild(container);
  }
};

export const generateOccurrencePDF = async (occurrence: OccurrenceDisplay): Promise<void> => {
  await generatePDFFromComponent(
    React.createElement(OccurrencePDFTemplate, { occurrence }),
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
  await generatePDFFromComponent(
    React.createElement(ReportPDFTemplate, { reportData }),
    `Relatorio_Ocorrencias_${reportData.startDate}_${reportData.endDate}.pdf`
  );
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
  const pageHeight = 297;
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