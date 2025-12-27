/**
 * Demand Letter PDF Generation
 * Generates professional PDF demand letters for tenant organizing
 */

import jsPDF from 'jspdf';

export interface DemandLetterData {
  recipientName: string;
  recipientAddress?: string;
  propertyAddress: string;
  propertyCity?: string;
  demands: string[];
  deadline: string; // e.g., "30 days", "March 15, 2025"
  signatories: string[]; // Tenant names
  generatedDate?: Date;
  organizationName?: string;
  organizationAddress?: string;
  organizationPhone?: string;
  organizationEmail?: string;
}

/**
 * Generate a professional demand letter PDF
 * Returns a Blob that can be downloaded or emailed
 */
export function generateDemandLetterPDF(data: DemandLetterData): Blob {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margins = { top: 15, left: 20, right: 20, bottom: 15 };
  const contentWidth = pageWidth - margins.left - margins.right;

  let yPos = margins.top;

  // Helper to add text with automatic line breaking
  const addMultilineText = (text: string, fontSize: number, style: 'normal' | 'bold' = 'normal', align: 'left' | 'center' = 'left') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', style);

    const lines = doc.splitTextToSize(text, contentWidth);
    const lineHeight = fontSize * 0.353; // Approximate line height in mm

    // Check if we need a new page
    if (yPos + lineHeight * lines.length > pageHeight - margins.bottom) {
      doc.addPage();
      yPos = margins.top;
    }

    doc.text(lines, margins.left, yPos, { align, maxWidth: contentWidth });
    yPos += lineHeight * lines.length + 3; // Add spacing after text

    return yPos;
  };

  // Header: Organization name/RSTU branding
  if (data.organizationName) {
    yPos = addMultilineText(data.organizationName, 14, 'bold', 'left');
  } else {
    yPos = addMultilineText('Reno-Sparks Tenants Union', 14, 'bold', 'left');
  }

  // Organization contact info (smaller)
  if (data.organizationAddress) {
    yPos = addMultilineText(data.organizationAddress, 9, 'normal', 'left');
  }
  if (data.organizationPhone) {
    yPos = addMultilineText(`Phone: ${data.organizationPhone}`, 9, 'normal', 'left');
  }
  if (data.organizationEmail) {
    yPos = addMultilineText(`Email: ${data.organizationEmail}`, 9, 'normal', 'left');
  }

  yPos += 5; // Add spacing before date

  // Date
  const letterDate = data.generatedDate ?
    data.generatedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) :
    new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  yPos = addMultilineText(`Date: ${letterDate}`, 10, 'normal', 'left');
  yPos += 3;

  // Recipient section
  yPos = addMultilineText('To:', 10, 'normal', 'left');
  yPos = addMultilineText(data.recipientName, 10, 'normal', 'left');
  if (data.recipientAddress) {
    yPos = addMultilineText(data.recipientAddress, 10, 'normal', 'left');
  }

  yPos += 5;

  // Re: line
  yPos = addMultilineText(`Re: Formal Demand for Repairs - ${data.propertyAddress}`, 10, 'bold', 'left');
  yPos += 3;

  // Opening paragraph
  yPos = addMultilineText(
    'Dear ' + data.recipientName + ':',
    10,
    'normal',
    'left'
  );

  yPos += 3;

  // Body text
  yPos = addMultilineText(
    'We, the undersigned tenants of the property located at ' + data.propertyAddress + ', hereby submit the following formal demands that must be addressed within ' + data.deadline + ' from the date of this letter.',
    10,
    'normal',
    'left'
  );

  yPos += 5;

  // Demands section
  yPos = addMultilineText('DEMANDS:', 11, 'bold', 'left');
  yPos += 2;

  data.demands.forEach((demand, index) => {
    const demandText = `${index + 1}. ${demand}`;
    yPos = addMultilineText(demandText, 10, 'normal', 'left');
  });

  yPos += 5;

  // Deadline and consequences
  const deadlineDate = new Date();
  // Add days to deadline (extract number from deadline string)
  const daysMatch = data.deadline.match(/\d+/);
  if (daysMatch) {
    deadlineDate.setDate(deadlineDate.getDate() + parseInt(daysMatch[0]));
  }

  yPos = addMultilineText(
    `Response Deadline: ${deadlineDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    10,
    'bold',
    'left'
  );

  yPos += 3;

  yPos = addMultilineText(
    'Failure to adequately address these demands may result in further collective action by the tenants of this property.',
    10,
    'normal',
    'left'
  );

  yPos += 8;

  // Closing
  yPos = addMultilineText(
    'Sincerely,',
    10,
    'normal',
    'left'
  );

  yPos += 15; // Space for signatures

  // Signature lines and tenant names
  yPos = addMultilineText('SIGNATORIES:', 10, 'bold', 'left');
  yPos += 3;

  data.signatories.forEach((signatory, index) => {
    yPos = addMultilineText(`${index + 1}. ${signatory}`, 10, 'normal', 'left');
  });

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'This demand letter was generated by Reno-Sparks Tenants Union organizing platform.',
    margins.left,
    pageHeight - 10,
    { align: 'center', maxWidth: contentWidth }
  );

  return doc.output('blob');
}

/**
 * Download a demand letter PDF with the specified filename
 */
export function downloadDemandLetterPDF(data: DemandLetterData, filename: string = 'demand-letter.pdf'): void {
  const blob = generateDemandLetterPDF(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get email body content for sending demand letter
 * Returns mailto: formatted content
 */
export function generateDemandLetterMailto(data: DemandLetterData): string {
  const subject = `Formal Demand for Repairs - ${data.propertyAddress}`;
  const body = `
Dear ${data.recipientName},

We, the undersigned tenants of the property located at ${data.propertyAddress}, hereby submit the following formal demands that must be addressed within ${data.deadline} from the date of this letter.

DEMANDS:
${data.demands.map((demand, i) => `${i + 1}. ${demand}`).join('\n')}

Response Deadline: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}

Failure to adequately address these demands may result in further collective action by the tenants of this property.

Sincerely,
${data.signatories.map((s, i) => `${i + 1}. ${s}`).join('\n')}

---
Generated by Reno-Sparks Tenants Union
  `.trim();

  return `mailto:${data.recipientName}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Generate filename with property address and date
 */
export function generateDemandLetterFilename(propertyAddress: string): string {
  const address = propertyAddress
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30);

  const date = new Date().toISOString().split('T')[0];
  return `demand-letter-${address}-${date}.pdf`;
}
