import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface ExportClient {
  name: string;
  sector?: string | null;
  headquarters?: string | null;
  email?: string | null;
  contact_number?: string | null;
  verified?: boolean | null;
  created_at: string;
}

interface ExportMeeting {
  title: string;
  meeting_date: string;
  location?: string | null;
  status?: string | null;
  attendees?: string[] | null;
  companies?: { name: string } | null;
}

interface ExportBrief {
  brief_type?: string | null;
  generated_at: string;
  companies?: { name: string } | null;
  content: any;
}

export const exportClientsToPDF = (clients: ExportClient[], filename = 'clients-export') => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(99, 102, 241); // Primary color
  doc.text('PropIntelix - Clients Report', 20, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, 20, 28);
  doc.text(`Total Clients: ${clients.length}`, 20, 34);
  
  // Table
  autoTable(doc, {
    startY: 42,
    head: [['Company Name', 'Sector', 'Location', 'Email', 'Phone', 'Verified', 'Added']],
    body: clients.map((c) => [
      c.name,
      c.sector || '-',
      c.headquarters || '-',
      c.email || '-',
      c.contact_number || '-',
      c.verified ? 'Yes' : 'No',
      format(new Date(c.created_at), 'MMM d, yyyy'),
    ]),
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 250],
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} | PropIntelix CRM`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`${filename}.pdf`);
};

export const exportMeetingsToPDF = (meetings: ExportMeeting[], filename = 'meetings-export') => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(34, 197, 94); // Accent color
  doc.text('PropIntelix - Meetings Report', 20, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, 20, 28);
  doc.text(`Total Meetings: ${meetings.length}`, 20, 34);
  
  // Table
  autoTable(doc, {
    startY: 42,
    head: [['Title', 'Client', 'Date & Time', 'Location', 'Status', 'Attendees']],
    body: meetings.map((m) => [
      m.title,
      m.companies?.name || '-',
      format(new Date(m.meeting_date), 'MMM d, yyyy h:mm a'),
      m.location || '-',
      m.status || 'scheduled',
      m.attendees?.join(', ') || '-',
    ]),
    headStyles: {
      fillColor: [34, 197, 94],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [240, 253, 244],
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} | PropIntelix CRM`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`${filename}.pdf`);
};

export const exportBriefsToPDF = (briefs: ExportBrief[], filename = 'ai-briefs-export') => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(139, 92, 246); // Purple
  doc.text('PropIntelix - AI Briefs Report', 20, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, 20, 28);
  doc.text(`Total Briefs: ${briefs.length}`, 20, 34);
  
  // Table
  autoTable(doc, {
    startY: 42,
    head: [['Type', 'Client', 'Generated At', 'Summary']],
    body: briefs.map((b) => {
      let summary = '-';
      try {
        if (typeof b.content === 'object' && b.content.summary) {
          summary = b.content.summary.substring(0, 100) + '...';
        } else if (typeof b.content === 'string') {
          summary = b.content.substring(0, 100) + '...';
        }
      } catch {
        summary = '-';
      }
      
      return [
        b.brief_type || 'meeting',
        b.companies?.name || '-',
        format(new Date(b.generated_at), 'MMM d, yyyy h:mm a'),
        summary,
      ];
    }),
    headStyles: {
      fillColor: [139, 92, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 243, 255],
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      3: { cellWidth: 80 },
    },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} | PropIntelix CRM`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`${filename}.pdf`);
};

export const exportAllDataToPDF = (
  clients: ExportClient[],
  meetings: ExportMeeting[],
  briefs: ExportBrief[],
  filename = 'propintelix-full-export'
) => {
  const doc = new jsPDF();
  
  // Title Page
  doc.setFontSize(28);
  doc.setTextColor(99, 102, 241);
  doc.text('PropIntelix', doc.internal.pageSize.width / 2, 60, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setTextColor(100);
  doc.text('Complete Data Export', doc.internal.pageSize.width / 2, 75, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, doc.internal.pageSize.width / 2, 95, { align: 'center' });
  
  doc.setFontSize(11);
  doc.text(`Clients: ${clients.length}`, doc.internal.pageSize.width / 2, 115, { align: 'center' });
  doc.text(`Meetings: ${meetings.length}`, doc.internal.pageSize.width / 2, 125, { align: 'center' });
  doc.text(`AI Briefs: ${briefs.length}`, doc.internal.pageSize.width / 2, 135, { align: 'center' });
  
  // Clients Section
  doc.addPage();
  doc.setFontSize(18);
  doc.setTextColor(99, 102, 241);
  doc.text('Clients', 20, 20);
  
  autoTable(doc, {
    startY: 30,
    head: [['Company', 'Sector', 'Location', 'Email', 'Verified']],
    body: clients.map((c) => [
      c.name,
      c.sector || '-',
      c.headquarters || '-',
      c.email || '-',
      c.verified ? 'Yes' : 'No',
    ]),
    headStyles: { fillColor: [99, 102, 241] },
    styles: { fontSize: 8 },
  });
  
  // Meetings Section
  doc.addPage();
  doc.setFontSize(18);
  doc.setTextColor(34, 197, 94);
  doc.text('Meetings', 20, 20);
  
  autoTable(doc, {
    startY: 30,
    head: [['Title', 'Client', 'Date', 'Location', 'Status']],
    body: meetings.map((m) => [
      m.title,
      m.companies?.name || '-',
      format(new Date(m.meeting_date), 'MMM d, yyyy'),
      m.location || '-',
      m.status || 'scheduled',
    ]),
    headStyles: { fillColor: [34, 197, 94] },
    styles: { fontSize: 8 },
  });
  
  // AI Briefs Section
  doc.addPage();
  doc.setFontSize(18);
  doc.setTextColor(139, 92, 246);
  doc.text('AI Briefs', 20, 20);
  
  autoTable(doc, {
    startY: 30,
    head: [['Type', 'Client', 'Generated At']],
    body: briefs.map((b) => [
      b.brief_type || 'meeting',
      b.companies?.name || '-',
      format(new Date(b.generated_at), 'MMM d, yyyy'),
    ]),
    headStyles: { fillColor: [139, 92, 246] },
    styles: { fontSize: 8 },
  });
  
  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} | PropIntelix CRM`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`${filename}.pdf`);
};
