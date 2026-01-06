/**
 * CLOUD STORAGE UTILITY
 *
 * Side-effect only - NO business logic.
 * Uploads daily exports to cloud storage (SharePoint/OneDrive).
 *
 * This module supports Microsoft Graph API for SharePoint/OneDrive.
 * Can be extended to support Google Drive, AWS S3, etc.
 */

import fetch from 'node-fetch';

/**
 * Upload files to SharePoint/OneDrive using Microsoft Graph API.
 *
 * @param {Object} config - Cloud storage configuration
 * @param {string} config.type - Storage type ('sharepoint' or 'onedrive')
 * @param {string} config.accessToken - Microsoft Graph API access token
 * @param {string} config.siteId - SharePoint site ID (for SharePoint)
 * @param {string} config.driveId - Drive ID
 * @param {string} config.folderPath - Base folder path for exports
 * @param {Object} files - Export files
 * @param {Buffer} files.csvBuffer - CSV file buffer
 * @param {Buffer} files.pdfBuffer - PDF file buffer
 * @param {Date} exportDate - Export date
 * @returns {Promise<Object>}
 */
export async function uploadToCloud(config, files, exportDate) {
  const dateStr = exportDate.toISOString().split('T')[0]; // YYYY-MM-DD
  const year = exportDate.getFullYear();

  // Create folder structure: /2026/2026-01-06/
  const folderPath = `${config.folderPath}/${year}/${dateStr}`;

  try {
    // Ensure folder exists
    await ensureFolderExists(config, folderPath);

    // Upload CSV
    const csvResult = await uploadFile(
      config,
      folderPath,
      `daily-report-${dateStr}.csv`,
      files.csvBuffer
    );

    // Upload PDF
    const pdfResult = await uploadFile(
      config,
      folderPath,
      `daily-report-${dateStr}.pdf`,
      files.pdfBuffer
    );

    console.log(`[Cloud Storage] Files uploaded successfully to ${folderPath}`);

    return {
      success: true,
      csvUrl: csvResult.webUrl,
      pdfUrl: pdfResult.webUrl,
      folderPath
    };

  } catch (error) {
    console.error(`[Cloud Storage] Upload failed:`, error);
    throw error;
  }
}

/**
 * Ensure folder exists in cloud storage (create if needed).
 *
 * @param {Object} config - Cloud storage configuration
 * @param {string} folderPath - Full folder path
 * @returns {Promise<Object>}
 */
async function ensureFolderExists(config, folderPath) {
  const pathParts = folderPath.split('/').filter(p => p.length > 0);
  let currentPath = '';

  for (const part of pathParts) {
    currentPath = currentPath ? `${currentPath}/${part}` : part;

    try {
      // Try to get folder
      await getFolder(config, currentPath);
    } catch (error) {
      // Folder doesn't exist, create it
      if (error.status === 404) {
        await createFolder(config, currentPath);
      } else {
        throw error;
      }
    }
  }

  return { path: folderPath };
}

/**
 * Get folder from cloud storage.
 */
async function getFolder(config, folderPath) {
  const url = buildGraphUrl(config, `root:/${folderPath}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = new Error(`Failed to get folder: ${response.statusText}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

/**
 * Create folder in cloud storage.
 */
async function createFolder(config, folderPath) {
  const parts = folderPath.split('/').filter(p => p.length > 0);
  const folderName = parts.pop();
  const parentPath = parts.length > 0 ? `root:/${parts.join('/')}` : 'root';

  const url = buildGraphUrl(config, `${parentPath}/children`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      folder: {},
      '@microsoft.graph.conflictBehavior': 'rename'
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to create folder: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Upload file to cloud storage.
 */
async function uploadFile(config, folderPath, filename, buffer) {
  const url = buildGraphUrl(config, `root:/${folderPath}/${filename}:/content`);

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${config.accessToken}`,
      'Content-Type': 'application/octet-stream'
    },
    body: buffer
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file ${filename}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Build Microsoft Graph API URL.
 */
function buildGraphUrl(config, path) {
  const baseUrl = 'https://graph.microsoft.com/v1.0';

  if (config.type === 'sharepoint' && config.siteId) {
    return `${baseUrl}/sites/${config.siteId}/drive/${path}`;
  } else {
    // OneDrive or default drive
    return `${baseUrl}/me/drive/${path}`;
  }
}

/**
 * Verify cloud storage configuration (test connection).
 *
 * @param {Object} config - Cloud storage configuration
 * @returns {Promise<boolean>}
 */
export async function verifyCloudConfig(config) {
  try {
    const url = buildGraphUrl(config, 'root');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Configuration test failed: ${response.statusText}`);
    }

    console.log('[Cloud Storage] Configuration verified successfully');
    return true;

  } catch (error) {
    console.error('[Cloud Storage] Configuration verification failed:', error);
    return false;
  }
}
