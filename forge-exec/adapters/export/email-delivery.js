/**
 * EMAIL DELIVERY UTILITY
 *
 * Side-effect only - NO business logic.
 * Sends daily exports via email.
 *
 * Uses Nodemailer for email delivery.
 */

import nodemailer from 'nodemailer';

/**
 * Send daily export via email.
 *
 * @param {Object} config - Email configuration
 * @param {string} config.host - SMTP host
 * @param {number} config.port - SMTP port
 * @param {string} config.user - SMTP username
 * @param {string} config.pass - SMTP password
 * @param {string} config.from - From email address
 * @param {Array<string>} config.to - Recipient email addresses
 * @param {Object} attachments - Export files
 * @param {Buffer} attachments.csvBuffer - CSV file buffer
 * @param {Buffer} attachments.pdfBuffer - PDF file buffer
 * @param {Date} exportDate - Export date
 * @returns {Promise<void>}
 */
export async function sendDailyExportEmail(config, attachments, exportDate) {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465, // true for 465, false for other ports
    auth: {
      user: config.user,
      pass: config.pass
    }
  });

  // Format date for subject and filename
  const dateStr = exportDate.toISOString().split('T')[0]; // YYYY-MM-DD

  // Prepare email
  const mailOptions = {
    from: config.from,
    to: config.to.join(', '),
    subject: `Daily Activity Report - ${dateStr}`,
    text: buildEmailBody(exportDate),
    html: buildEmailBodyHTML(exportDate),
    attachments: [
      {
        filename: `daily-report-${dateStr}.csv`,
        content: attachments.csvBuffer
      },
      {
        filename: `daily-report-${dateStr}.pdf`,
        content: attachments.pdfBuffer
      }
    ]
  };

  // Send email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Delivery] Daily export sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Delivery] Failed to send daily export:`, error);
    throw error;
  }
}

/**
 * Build email body (plain text).
 */
function buildEmailBody(exportDate) {
  const dateStr = exportDate.toISOString().split('T')[0];

  return `
Daily Activity Report - ${dateStr}

This is your automated daily export from ForgeExec.

Attached files:
- daily-report-${dateStr}.csv (machine-readable data for accounting/payroll)
- daily-report-${dateStr}.pdf (human-readable daily summary)

This export was generated automatically at ${new Date().toLocaleString()}.

Data Safety Notice:
This export is part of your Business Continuity Protection system.
Even if the ForgeExec app is temporarily unavailable, your daily activity records are preserved and delivered automatically.

---
Generated with ForgeExec
Next Level Electric
`.trim();
}

/**
 * Build email body (HTML).
 */
function buildEmailBodyHTML(exportDate) {
  const dateStr = exportDate.toISOString().split('T')[0];

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #2c3e50;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background-color: #f9f9f9;
      padding: 20px;
      border: 1px solid #ddd;
      border-top: none;
    }
    .attachments {
      background-color: #e8f4f8;
      border-left: 4px solid #3498db;
      padding: 15px;
      margin: 15px 0;
    }
    .footer {
      background-color: #ecf0f1;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #7f8c8d;
      border-radius: 0 0 5px 5px;
    }
    .notice {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 15px 0;
    }
    ul {
      margin: 10px 0;
    }
    li {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Daily Activity Report</h1>
    <h2>${dateStr}</h2>
  </div>

  <div class="content">
    <p>This is your automated daily export from <strong>ForgeExec</strong>.</p>

    <div class="attachments">
      <strong>Attached Files:</strong>
      <ul>
        <li><strong>daily-report-${dateStr}.csv</strong> - Machine-readable data for accounting/payroll systems</li>
        <li><strong>daily-report-${dateStr}.pdf</strong> - Human-readable daily activity summary</li>
      </ul>
    </div>

    <p>This export was generated automatically at <strong>${new Date().toLocaleString()}</strong>.</p>

    <div class="notice">
      <strong>Data Safety Notice:</strong><br>
      This export is part of your <strong>Business Continuity Protection</strong> system.
      Even if the ForgeExec app is temporarily unavailable, your daily activity records are preserved and delivered automatically.
    </div>
  </div>

  <div class="footer">
    Generated with ForgeExec<br>
    <strong>Next Level Electric</strong>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Verify email configuration (test connection).
 *
 * @param {Object} config - Email configuration
 * @returns {Promise<boolean>}
 */
export async function verifyEmailConfig(config) {
  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass
      }
    });

    await transporter.verify();
    console.log('[Email Delivery] Configuration verified successfully');
    return true;
  } catch (error) {
    console.error('[Email Delivery] Configuration verification failed:', error);
    return false;
  }
}
