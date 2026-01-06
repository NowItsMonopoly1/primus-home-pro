/**
 * CSV EXPORT FORMATTER
 *
 * Pure formatter - NO business logic, NO I/O.
 * Converts job data into CSV format for daily export.
 *
 * This is side-effect only - formatting data for external consumption.
 */

/**
 * Format jobs array into CSV string.
 *
 * @param {Array} jobs - Array of job objects from the jobs Map
 * @param {Date} exportDate - Date of the export
 * @returns {string} CSV formatted string
 */
export function formatJobsAsCSV(jobs, exportDate) {
  const headers = [
    'Export Date',
    'Job ID',
    'Customer Name',
    'Customer ID',
    'Customer Phone',
    'Address',
    'Job Type',
    'Current State',
    'Assigned Technician',
    'Scheduled Time',
    'Estimated Duration (min)',
    'Total Labor Hours',
    'Total Material Cost',
    'Priority',
    'Notes',
    'Photos Count',
    'Voice Notes Count',
    'Materials Used Count',
    'Change Orders Count'
  ];

  // Build CSV rows
  const rows = [headers.join(',')];

  for (const job of jobs) {
    const row = [
      exportDate.toISOString().split('T')[0], // Export date (YYYY-MM-DD)
      job.jobId || '',
      escapeCSV(job.customerName || ''),
      job.customerId || '',
      job.customerPhone || '',
      escapeCSV(job.address || ''),
      job.jobType || '',
      job.currentState || '',
      job.assignedTechnician || '',
      job.scheduledTime || '',
      job.estimatedDuration || 0,
      job.totalLaborHours || 0,
      job.totalMaterialCost || 0,
      job.priority || '',
      escapeCSV(job.notes || ''),
      (job.photos || []).length,
      (job.voiceNotes || []).length,
      (job.materialsUsed || []).length,
      (job.changeOrders || []).length
    ];

    rows.push(row.join(','));
  }

  return rows.join('\n');
}

/**
 * Escape CSV values (handle commas, quotes, newlines).
 *
 * @param {string} value - Value to escape
 * @returns {string} Escaped value
 */
function escapeCSV(value) {
  if (typeof value !== 'string') {
    return value;
  }

  // If contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

/**
 * Format technician activity into CSV.
 * (Future enhancement when event history is available)
 *
 * @param {Array} events - Array of execution events
 * @param {Date} exportDate - Date of the export
 * @returns {string} CSV formatted string
 */
export function formatTechnicianActivityAsCSV(events, exportDate) {
  const headers = [
    'Export Date',
    'Event Timestamp',
    'Job ID',
    'Event Type',
    'Technician ID',
    'Location',
    'Notes'
  ];

  const rows = [headers.join(',')];

  for (const event of events) {
    const row = [
      exportDate.toISOString().split('T')[0],
      event.timestamp || '',
      event.payload?.jobId || '',
      event.type || '',
      event.sourceId || '',
      escapeCSV(event.payload?.location || ''),
      escapeCSV(event.payload?.notes || '')
    ];

    rows.push(row.join(','));
  }

  return rows.join('\n');
}

/**
 * Create a summary CSV with key metrics.
 *
 * @param {Array} jobs - Array of job objects
 * @param {Date} exportDate - Date of the export
 * @returns {string} CSV formatted string
 */
export function formatDailySummaryAsCSV(jobs, exportDate) {
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => !['CLOSED', 'INVOICED'].includes(j.currentState)).length;
  const completedJobs = jobs.filter(j => ['CLOSED', 'INVOICED'].includes(j.currentState)).length;
  const totalLaborHours = jobs.reduce((sum, j) => sum + (j.totalLaborHours || 0), 0);
  const totalMaterialCost = jobs.reduce((sum, j) => sum + (j.totalMaterialCost || 0), 0);

  const headers = [
    'Metric',
    'Value'
  ];

  const rows = [
    headers.join(','),
    ['Export Date', exportDate.toISOString().split('T')[0]].join(','),
    ['Total Jobs', totalJobs].join(','),
    ['Active Jobs', activeJobs].join(','),
    ['Completed Jobs', completedJobs].join(','),
    ['Total Labor Hours', totalLaborHours.toFixed(2)].join(','),
    ['Total Material Cost', `$${totalMaterialCost.toFixed(2)}`].join(',')
  ];

  return rows.join('\n');
}
