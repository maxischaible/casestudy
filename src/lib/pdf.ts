import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Supplier, MatchResult } from '@/types/domain';

export function exportShortlistToPDF(results: MatchResult[]): void {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Supplier Shortlist Report', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
  doc.text(`Total Candidates: ${results.length}`, 20, 40);
  
  // Prepare table data
  const tableData = results.map(result => [
    result.supplier.name,
    result.supplier.country,
    `${result.switching_cost_score}%`,
    `${(result.estimated_savings_rate * 100).toFixed(1)}%`,
    result.audit_readiness,
    result.supplier.certifications.map(c => c.code).join(', '),
    `${result.supplier.lead_time_days} days`,
    `${result.supplier.moq.toLocaleString()}`
  ]);
  
  // Create table
  autoTable(doc, {
    head: [[
      'Supplier',
      'Country',
      'Match Score',
      'Est. Savings',
      'Audit Status',
      'Certifications',
      'Lead Time',
      'MOQ'
    ]],
    body: tableData,
    startY: 50,
    styles: {
      fontSize: 8,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [255, 122, 26], // Orange
      textColor: 255
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 20 },
      2: { cellWidth: 20 },
      3: { cellWidth: 20 },
      4: { cellWidth: 25 },
      5: { cellWidth: 30 },
      6: { cellWidth: 20 },
      7: { cellWidth: 20 }
    }
  });
  
  // Add summary section
  const finalY = (doc as any).lastAutoTable.finalY || 50;
  
  doc.setFontSize(14);
  doc.text('Summary', 20, finalY + 20);
  
  doc.setFontSize(10);
  const topSupplier = results[0];
  if (topSupplier) {
    doc.text(`Top Recommendation: ${topSupplier.supplier.name}`, 20, finalY + 30);
    doc.text(`Reasons: ${topSupplier.reasons.join('; ')}`, 20, finalY + 40);
    
    const avgScore = results.reduce((sum, r) => sum + r.switching_cost_score, 0) / results.length;
    doc.text(`Average Match Score: ${avgScore.toFixed(1)}%`, 20, finalY + 50);
  }
  
  // Save the PDF
  doc.save('supplier-shortlist.pdf');
}