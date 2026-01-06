/**
 * PDF EXPORT FORMATTER
 *
 * Pure formatter - NO business logic, NO I/O.
 * Converts job data into PDF format for daily export.
 *
 * This is side-effect only - formatting data for external consumption.
 * Uses PDFKit for PDF generation (lightweight, no browser needed).
 */

import PDFDocument from 'pdfkit';

/**
 * Generate a daily activity report PDF.
 *
 * @param {Array} jobs - Array of job objects from the jobs Map
 * @param {Date} exportDate - Date of the export
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generateDailyReportPDF(jobs, exportDate) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const chunks = [];

      // Collect PDF chunks
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text('Next Level Electric', { align: 'center' });

      doc.fontSize(16)
         .text('Daily Activity Report', { align: 'center' })
         .moveDown();

      doc.fontSize(10)
         .font('Helvetica')
         .text(`Report Date: ${formatDate(exportDate)}`, { align: 'center' })
         .text(`Generated: ${formatDateTime(new Date())}`, { align: 'center' })
         .moveDown(2);

      // Summary Section
      addSummarySection(doc, jobs, exportDate);

      // Job Details Section
      addJobDetailsSection(doc, jobs);

      // Footer
      addFooter(doc);

      // Finalize PDF
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Add summary section to PDF.
 */
function addSummarySection(doc, jobs, exportDate) {
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => !['CLOSED', 'INVOICED'].includes(j.currentState)).length;
  const completedJobs = jobs.filter(j => ['CLOSED', 'INVOICED'].includes(j.currentState)).length;
  const totalLaborHours = jobs.reduce((sum, j) => sum + (j.totalLaborHours || 0), 0);
  const totalMaterialCost = jobs.reduce((sum, j) => sum + (j.totalMaterialCost || 0), 0);

  // Summary box
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Daily Summary', { underline: true })
     .moveDown(0.5);

  doc.fontSize(10)
     .font('Helvetica');

  const summaryData = [
    ['Total Jobs:', totalJobs],
    ['Active Jobs:', activeJobs],
    ['Completed Jobs:', completedJobs],
    ['Total Labor Hours:', totalLaborHours.toFixed(2)],
    ['Total Material Cost:', `$${totalMaterialCost.toFixed(2)}`]
  ];

  summaryData.forEach(([label, value]) => {
    doc.text(`${label} ${value}`, { indent: 20 });
  });

  doc.moveDown(2);
}

/**
 * Add job details section to PDF.
 */
function addJobDetailsSection(doc, jobs) {
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Job Details', { underline: true })
     .moveDown(1);

  // Group jobs by state
  const jobsByState = {};
  jobs.forEach(job => {
    const state = job.currentState || 'UNKNOWN';
    if (!jobsByState[state]) {
      jobsByState[state] = [];
    }
    jobsByState[state].push(job);
  });

  // Display jobs grouped by state
  const stateOrder = ['SCHEDULED', 'DISPATCHED', 'ON_SITE', 'WORK_COMPLETED', 'INSPECTION_PASSED', 'INVOICED', 'CLOSED'];

  stateOrder.forEach(state => {
    const stateJobs = jobsByState[state] || [];
    if (stateJobs.length === 0) return;

    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text(`${formatStateName(state)} (${stateJobs.length})`, { indent: 10 })
       .moveDown(0.5);

    stateJobs.forEach(job => {
      addJobEntry(doc, job);
    });

    doc.moveDown(1);
  });
}

/**
 * Add a single job entry to PDF.
 */
function addJobEntry(doc, job) {
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .text(`${job.jobId}`, { indent: 20, continued: true })
     .font('Helvetica')
     .text(` - ${job.customerName || 'Unknown Customer'}`)
     .moveDown(0.3);

  const details = [
    `Address: ${job.address || 'N/A'}`,
    `Type: ${formatJobType(job.jobType)}`,
    `Tech: ${job.assignedTechnician || 'Unassigned'}`,
    `Priority: ${job.priority || 'NORMAL'}`
  ];

  if (job.totalLaborHours > 0) {
    details.push(`Labor: ${job.totalLaborHours}h`);
  }

  if (job.totalMaterialCost > 0) {
    details.push(`Materials: $${job.totalMaterialCost.toFixed(2)}`);
  }

  doc.fontSize(9)
     .font('Helvetica')
     .text(details.join(' | '), { indent: 30 });

  if (job.notes) {
    doc.text(`Notes: ${job.notes}`, { indent: 30 });
  }

  doc.moveDown(0.5);
}

/**
 * Add footer to PDF.
 */
function addFooter(doc) {
  const pageCount = doc.bufferedPageRange().count;

  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);

    doc.fontSize(8)
       .font('Helvetica')
       .text(
         `Generated with ForgeExec | Page ${i + 1} of ${pageCount}`,
         50,
         doc.page.height - 50,
         { align: 'center' }
       );
  }
}

/**
 * Format date as YYYY-MM-DD.
 */
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Format date and time.
 */
function formatDateTime(date) {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
}

/**
 * Format state name for display.
 */
function formatStateName(state) {
  return state
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format job type for display.
 */
function formatJobType(jobType) {
  if (!jobType) return 'Unknown';

  return jobType
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}
