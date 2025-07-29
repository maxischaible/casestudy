import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ShortlistItem {
  supplierName: string;
  score: number;
  savingsPct: number;
  audit: string;
  country: string;
  processes: string[];
  materials: string[];
}

interface ExportMeta {
  part?: string;
  date: string;
  scope: string;
}

export function exportShortlistPdf(items: ShortlistItem[], meta: ExportMeta): void {
  try {
    // Create new PDF document in landscape orientation
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Brand colors matching the webapp (HSL 24 100% 55% = RGB 255, 100, 20)
    const brandOrange: [number, number, number] = [255, 100, 20];
    const grayLight: [number, number, number] = [248, 250, 252];
    const grayMedium: [number, number, number] = [148, 163, 184];
    const grayDark: [number, number, number] = [51, 65, 85];
    const white: [number, number, number] = [255, 255, 255];

    // Add subtle background pattern
    doc.setFillColor(...grayLight);
    doc.rect(0, 0, 297, 210, 'F');

    // Header section with brand styling
    doc.setFillColor(...brandOrange);
    doc.rect(0, 0, 297, 35, 'F');

    // Add tacto logo area (simulate with text for now)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...white);
    doc.text('tacto', 20, 22);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Sourcing Platform', 20, 28);

    // Main title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Supplier Comparison Report', 120, 22);

    // Meta information section
    doc.setFillColor(...white);
    doc.rect(15, 40, 267, 20, 'F');
    doc.setDrawColor(...grayMedium);
    doc.setLineWidth(0.5);
    doc.rect(15, 40, 267, 20, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...grayDark);
    
    doc.text('Part Specification:', 20, 47);
    doc.setFont('helvetica', 'bold');
    doc.text(meta.part || 'N/A', 20, 52);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Export Date:', 120, 47);
    doc.setFont('helvetica', 'bold');
    doc.text(meta.date, 120, 52);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Region Scope:', 220, 47);
    doc.setFont('helvetica', 'bold');
    doc.text(meta.scope, 220, 52);

    // Prepare table data with better formatting
    const tableData = items.map((item, index) => [
      item.supplierName,
      `${item.score}/100`,
      `${item.savingsPct.toFixed(1)}%`,
      item.audit,
      item.country,
      item.processes.slice(0, 3).join(', ') + (item.processes.length > 3 ? '...' : ''),
      item.materials.slice(0, 3).join(', ') + (item.materials.length > 3 ? '...' : '')
    ]);

    // Generate table with webapp-consistent styling
    autoTable(doc, {
      head: [['Supplier Name', 'Match Score', 'Est. Savings', 'Audit Status', 'Country', 'Key Processes', 'Materials']],
      body: tableData,
      startY: 68,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        lineColor: grayMedium,
        lineWidth: 0.5
      },
      headStyles: {
        fillColor: brandOrange,
        textColor: white,
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: { top: 6, right: 4, bottom: 6, left: 4 }
      },
      bodyStyles: {
        fontSize: 8,
        textColor: grayDark,
        cellPadding: { top: 5, right: 4, bottom: 5, left: 4 }
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold' }, // Supplier name - emphasized
        1: { cellWidth: 22, halign: 'center' }, // Score
        2: { cellWidth: 22, halign: 'center', textColor: [34, 197, 94] }, // Savings - green
        3: { cellWidth: 28, halign: 'center' }, // Audit status
        4: { cellWidth: 25, halign: 'center' }, // Country
        5: { cellWidth: 55, fontSize: 7 }, // Processes
        6: { cellWidth: 45, fontSize: 7 } // Materials
      },
      margin: { left: 15, right: 15 },
      // Custom cell styling for audit status
      didParseCell: function(data: any) {
        if (data.column.index === 3) { // Audit status column
          if (data.cell.text[0] === 'Audit-ready') {
            data.cell.styles.textColor = [34, 197, 94]; // Green
          } else if (data.cell.text[0] === 'Minor gaps') {
            data.cell.styles.textColor = [251, 191, 36]; // Yellow
          } else {
            data.cell.styles.textColor = [239, 68, 68]; // Red
          }
        }
      }
    });

    // Summary section
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    // Summary box
    doc.setFillColor(250, 250, 250);
    doc.rect(15, finalY, 267, 25, 'F');
    doc.setDrawColor(...grayMedium);
    doc.rect(15, finalY, 267, 25, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...grayDark);
    doc.text('Summary', 20, finalY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Total suppliers evaluated: ${items.length}`, 20, finalY + 15);
    
    const avgScore = items.reduce((sum, item) => sum + item.score, 0) / items.length;
    doc.text(`Average match score: ${avgScore.toFixed(1)}/100`, 100, finalY + 15);
    
    const avgSavings = items.reduce((sum, item) => sum + item.savingsPct, 0) / items.length;
    doc.text(`Average potential savings: ${avgSavings.toFixed(1)}%`, 200, finalY + 15);

    // Footer with brand styling
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(...brandOrange);
    doc.rect(0, pageHeight - 20, 297, 20, 'F');

    doc.setFontSize(8);
    doc.setTextColor(...white);
    doc.text('Generated by tacto Sourcing Platform', 20, pageHeight - 10);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 200, pageHeight - 10);

    // Generate filename with better naming convention
    const timestamp = new Date().toISOString().split('T')[0];
    const partSuffix = meta.part ? `_${meta.part.replace(/[^a-zA-Z0-9]/g, '')}` : '';
    const filename = `tacto_supplier_comparison${partSuffix}_${timestamp}.pdf`;

    // Save the PDF
    doc.save(filename);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF export');
  }
}