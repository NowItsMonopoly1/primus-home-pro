/**
 * LOCAL FILE STORAGE UTILITY
 *
 * Side-effect only - NO business logic.
 * Saves daily exports to local filesystem.
 *
 * Creates organized folder structure: /exports/2026/2026-01-06/
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * Save export files to local filesystem.
 *
 * @param {Object} config - File storage configuration
 * @param {string} config.baseDir - Base directory for exports
 * @param {Object} files - Export files
 * @param {Buffer|string} files.csvBuffer - CSV file content
 * @param {Buffer} files.pdfBuffer - PDF file buffer
 * @param {Date} exportDate - Export date
 * @returns {Promise<Object>}
 */
export async function saveToLocalFiles(config, files, exportDate) {
  const dateStr = exportDate.toISOString().split('T')[0]; // YYYY-MM-DD
  const year = exportDate.getFullYear();

  // Create folder structure: exports/2026/2026-01-06/
  const exportDir = path.join(config.baseDir, String(year), dateStr);

  try {
    // Ensure directory exists
    await fs.mkdir(exportDir, { recursive: true });

    // Save CSV file
    const csvPath = path.join(exportDir, `daily-report-${dateStr}.csv`);
    await fs.writeFile(csvPath, files.csvBuffer);

    // Save PDF file
    const pdfPath = path.join(exportDir, `daily-report-${dateStr}.pdf`);
    await fs.writeFile(pdfPath, files.pdfBuffer);

    // Save metadata file (for audit trail)
    const metadataPath = path.join(exportDir, 'metadata.json');
    const metadata = {
      exportDate: dateStr,
      generatedAt: new Date().toISOString(),
      files: {
        csv: `daily-report-${dateStr}.csv`,
        pdf: `daily-report-${dateStr}.pdf`
      },
      system: 'ForgeExec',
      version: '1.0.0'
    };
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    console.log(`[File Storage] Files saved to ${exportDir}`);

    return {
      success: true,
      csvPath,
      pdfPath,
      metadataPath,
      exportDir
    };

  } catch (error) {
    console.error(`[File Storage] Save failed:`, error);
    throw error;
  }
}

/**
 * Get list of all exports.
 *
 * @param {Object} config - File storage configuration
 * @param {Object} options - Query options
 * @param {string} options.year - Filter by year (optional)
 * @param {number} options.limit - Max number of results (optional)
 * @returns {Promise<Array>}
 */
export async function listExports(config, options = {}) {
  try {
    const baseDir = config.baseDir;
    const exports = [];

    // Check if base directory exists
    try {
      await fs.access(baseDir);
    } catch {
      return []; // No exports yet
    }

    // Get year directories
    const years = await fs.readdir(baseDir);

    for (const year of years) {
      if (options.year && year !== String(options.year)) {
        continue; // Skip if filtering by year
      }

      const yearDir = path.join(baseDir, year);
      const stat = await fs.stat(yearDir);

      if (!stat.isDirectory()) continue;

      // Get date directories
      const dates = await fs.readdir(yearDir);

      for (const date of dates) {
        const dateDir = path.join(yearDir, date);
        const dateStat = await fs.stat(dateDir);

        if (!dateStat.isDirectory()) continue;

        // Read metadata if exists
        const metadataPath = path.join(dateDir, 'metadata.json');
        let metadata = null;

        try {
          const metadataContent = await fs.readFile(metadataPath, 'utf8');
          metadata = JSON.parse(metadataContent);
        } catch {
          // No metadata file, use defaults
          metadata = {
            exportDate: date,
            generatedAt: dateStat.mtime.toISOString()
          };
        }

        exports.push({
          date,
          year,
          path: dateDir,
          metadata
        });
      }
    }

    // Sort by date (newest first)
    exports.sort((a, b) => b.date.localeCompare(a.date));

    // Apply limit if specified
    if (options.limit) {
      return exports.slice(0, options.limit);
    }

    return exports;

  } catch (error) {
    console.error(`[File Storage] List exports failed:`, error);
    throw error;
  }
}

/**
 * Get a specific export by date.
 *
 * @param {Object} config - File storage configuration
 * @param {string} date - Export date (YYYY-MM-DD)
 * @returns {Promise<Object>}
 */
export async function getExport(config, date) {
  const year = date.split('-')[0];
  const exportDir = path.join(config.baseDir, year, date);

  try {
    // Check if directory exists
    await fs.access(exportDir);

    // Read metadata
    const metadataPath = path.join(exportDir, 'metadata.json');
    const metadataContent = await fs.readFile(metadataPath, 'utf8');
    const metadata = JSON.parse(metadataContent);

    // Get file paths
    const csvPath = path.join(exportDir, metadata.files.csv);
    const pdfPath = path.join(exportDir, metadata.files.pdf);

    return {
      date,
      year,
      path: exportDir,
      metadata,
      files: {
        csv: csvPath,
        pdf: pdfPath
      }
    };

  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Export not found for date ${date}`);
    }
    throw error;
  }
}

/**
 * Clean up old exports (retention policy).
 *
 * @param {Object} config - File storage configuration
 * @param {number} retentionDays - Number of days to keep exports
 * @returns {Promise<Object>}
 */
export async function cleanupOldExports(config, retentionDays) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];

  try {
    const allExports = await listExports(config);
    let deletedCount = 0;

    for (const exportItem of allExports) {
      if (exportItem.date < cutoffStr) {
        // Delete old export directory
        await fs.rm(exportItem.path, { recursive: true });
        deletedCount++;
        console.log(`[File Storage] Deleted old export: ${exportItem.date}`);
      }
    }

    console.log(`[File Storage] Cleanup complete: ${deletedCount} old exports deleted`);

    return {
      success: true,
      deletedCount,
      cutoffDate: cutoffStr
    };

  } catch (error) {
    console.error(`[File Storage] Cleanup failed:`, error);
    throw error;
  }
}

/**
 * Verify file storage configuration (test write access).
 *
 * @param {Object} config - File storage configuration
 * @returns {Promise<boolean>}
 */
export async function verifyFileStorageConfig(config) {
  try {
    // Ensure base directory exists
    await fs.mkdir(config.baseDir, { recursive: true });

    // Test write access
    const testFile = path.join(config.baseDir, '.write-test');
    await fs.writeFile(testFile, 'test');
    await fs.unlink(testFile);

    console.log('[File Storage] Configuration verified successfully');
    return true;

  } catch (error) {
    console.error('[File Storage] Configuration verification failed:', error);
    return false;
  }
}
