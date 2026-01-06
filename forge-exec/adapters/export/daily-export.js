/**
 * DAILY EXPORT ORCHESTRATOR
 *
 * Coordinates the daily export process.
 * Side-effect only - NO business logic.
 *
 * Triple-path delivery:
 * 1. Local file system
 * 2. Email delivery
 * 3. Cloud storage (SharePoint/OneDrive)
 *
 * This ensures data resilience even if the app/UI is down.
 */

import { formatJobsAsCSV, formatDailySummaryAsCSV } from './csv-formatter.js';
import { generateDailyReportPDF } from './pdf-formatter.js';
import { sendDailyExportEmail } from './email-delivery.js';
import { uploadToCloud } from './cloud-storage.js';
import { saveToLocalFiles } from './file-storage.js';

/**
 * Execute daily export.
 *
 * @param {Object} config - Export configuration
 * @param {Array} jobs - Array of job objects from the jobs Map
 * @param {Date} exportDate - Date to export (defaults to today)
 * @returns {Promise<Object>}
 */
export async function executeDailyExport(config, jobs, exportDate = new Date()) {
  const startTime = new Date();
  console.log(`[Daily Export] Starting export for ${exportDate.toISOString().split('T')[0]}`);

  const results = {
    success: false,
    exportDate: exportDate.toISOString().split('T')[0],
    timestamp: startTime.toISOString(),
    jobsExported: jobs.length,
    delivery: {
      localFile: { success: false },
      email: { success: false },
      cloud: { success: false }
    },
    errors: []
  };

  try {
    // Step 1: Generate export files
    console.log('[Daily Export] Generating export files...');
    const files = await generateExportFiles(jobs, exportDate);

    // Step 2: Triple-path delivery (all paths execute independently)
    const deliveryPromises = [];

    // Path 1: Local file storage (always executed)
    if (config.fileStorage?.enabled !== false) {
      deliveryPromises.push(
        saveToLocalFiles(config.fileStorage, files, exportDate)
          .then(result => {
            results.delivery.localFile = { success: true, ...result };
            console.log('[Daily Export] ✓ Local file storage successful');
          })
          .catch(error => {
            results.delivery.localFile = { success: false, error: error.message };
            results.errors.push({ path: 'localFile', error: error.message });
            console.error('[Daily Export] ✗ Local file storage failed:', error.message);
          })
      );
    }

    // Path 2: Email delivery (if configured)
    if (config.email?.enabled) {
      deliveryPromises.push(
        sendDailyExportEmail(config.email, files, exportDate)
          .then(result => {
            results.delivery.email = { success: true, ...result };
            console.log('[Daily Export] ✓ Email delivery successful');
          })
          .catch(error => {
            results.delivery.email = { success: false, error: error.message };
            results.errors.push({ path: 'email', error: error.message });
            console.error('[Daily Export] ✗ Email delivery failed:', error.message);
          })
      );
    }

    // Path 3: Cloud storage (if configured)
    if (config.cloud?.enabled) {
      deliveryPromises.push(
        uploadToCloud(config.cloud, files, exportDate)
          .then(result => {
            results.delivery.cloud = { success: true, ...result };
            console.log('[Daily Export] ✓ Cloud storage successful');
          })
          .catch(error => {
            results.delivery.cloud = { success: false, error: error.message };
            results.errors.push({ path: 'cloud', error: error.message });
            console.error('[Daily Export] ✗ Cloud storage failed:', error.message);
          })
      );
    }

    // Wait for all delivery paths to complete
    await Promise.allSettled(deliveryPromises);

    // Export is successful if at least one delivery path succeeded
    const anySuccess = results.delivery.localFile.success ||
                      results.delivery.email.success ||
                      results.delivery.cloud.success;

    results.success = anySuccess;

    const endTime = new Date();
    const duration = endTime - startTime;

    console.log(`[Daily Export] Completed in ${duration}ms - Success: ${anySuccess}`);

    return results;

  } catch (error) {
    console.error('[Daily Export] Fatal error:', error);
    results.errors.push({ path: 'general', error: error.message });
    return results;
  }
}

/**
 * Generate export files (CSV and PDF).
 *
 * @param {Array} jobs - Array of job objects
 * @param {Date} exportDate - Export date
 * @returns {Promise<Object>}
 */
async function generateExportFiles(jobs, exportDate) {
  // Generate CSV (job details)
  const csvContent = formatJobsAsCSV(jobs, exportDate);
  const csvBuffer = Buffer.from(csvContent, 'utf8');

  // Generate summary CSV
  const summaryContent = formatDailySummaryAsCSV(jobs, exportDate);
  const summaryBuffer = Buffer.from(summaryContent, 'utf8');

  // Generate PDF
  const pdfBuffer = await generateDailyReportPDF(jobs, exportDate);

  return {
    csvBuffer,
    summaryBuffer,
    pdfBuffer
  };
}

/**
 * Verify all export configurations.
 *
 * @param {Object} config - Export configuration
 * @returns {Promise<Object>}
 */
export async function verifyExportConfiguration(config) {
  const results = {
    valid: false,
    checks: {
      fileStorage: false,
      email: false,
      cloud: false
    },
    errors: []
  };

  try {
    // Check file storage
    if (config.fileStorage?.enabled !== false) {
      const { verifyFileStorageConfig } = await import('./file-storage.js');
      results.checks.fileStorage = await verifyFileStorageConfig(config.fileStorage);
    }

    // Check email
    if (config.email?.enabled) {
      const { verifyEmailConfig } = await import('./email-delivery.js');
      results.checks.email = await verifyEmailConfig(config.email);
    }

    // Check cloud storage
    if (config.cloud?.enabled) {
      const { verifyCloudConfig } = await import('./cloud-storage.js');
      results.checks.cloud = await verifyCloudConfig(config.cloud);
    }

    // Configuration is valid if at least one delivery path is configured
    results.valid = results.checks.fileStorage || results.checks.email || results.checks.cloud;

    return results;

  } catch (error) {
    results.errors.push(error.message);
    return results;
  }
}

/**
 * Get export statistics.
 *
 * @param {Object} config - Export configuration
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export async function getExportStats(config, options = {}) {
  try {
    const { listExports } = await import('./file-storage.js');
    const exports = await listExports(config.fileStorage, options);

    return {
      totalExports: exports.length,
      latestExport: exports[0] || null,
      exports
    };

  } catch (error) {
    console.error('[Daily Export] Failed to get stats:', error);
    throw error;
  }
}
