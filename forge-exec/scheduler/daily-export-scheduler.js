/**
 * DAILY EXPORT SCHEDULER
 *
 * Automated scheduler that triggers daily exports at 11:59 PM.
 * Runs independently of the UI/app - ensures exports happen even if app is down.
 *
 * Usage:
 *   node scheduler/daily-export-scheduler.js
 *
 * For production deployment:
 *   - Run as a system service (systemd, pm2, Windows Service)
 *   - Or use system cron/Task Scheduler
 */

import cron from 'node-cron';
import fetch from 'node-fetch';

// Configuration
const API_URL = process.env.FORGEEXEC_API_URL || 'http://localhost:3000';
const SCHEDULE = process.env.EXPORT_SCHEDULE || '59 23 * * *'; // 11:59 PM every day

console.log('=================================================');
console.log('ForgeExec Daily Export Scheduler');
console.log('=================================================');
console.log(`API URL: ${API_URL}`);
console.log(`Schedule: ${SCHEDULE} (cron format)`);
console.log(`Started: ${new Date().toISOString()}`);
console.log('=================================================\n');

/**
 * Execute daily export by calling the API.
 */
async function triggerDailyExport() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Triggering daily export...`);

  try {
    const response = await fetch(`${API_URL}/api/export/daily`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Optional: specify a date, defaults to today
        // date: new Date().toISOString()
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log(`[${timestamp}] ✓ Daily export completed successfully`);
      console.log(`  Jobs exported: ${result.jobsExported}`);
      console.log(`  Local file: ${result.delivery.localFile.success ? '✓' : '✗'}`);
      console.log(`  Email: ${result.delivery.email.success ? '✓' : '✗'}`);
      console.log(`  Cloud: ${result.delivery.cloud.success ? '✓' : '✗'}`);
    } else {
      console.error(`[${timestamp}] ✗ Daily export completed with errors`);
      console.error(`  Errors:`, result.errors);
    }

  } catch (error) {
    console.error(`[${timestamp}] ✗ Failed to trigger daily export:`, error.message);
  }

  console.log(''); // Blank line for readability
}

/**
 * Verify API connectivity on startup.
 */
async function verifyAPIConnection() {
  console.log('Verifying API connection...');

  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();

    if (data.status === 'healthy') {
      console.log('✓ API connection verified\n');
      return true;
    } else {
      console.error('✗ API unhealthy:', data);
      return false;
    }

  } catch (error) {
    console.error('✗ Cannot connect to API:', error.message);
    console.error('  Make sure the ForgeExec API server is running');
    console.error(`  Expected URL: ${API_URL}\n`);
    return false;
  }
}

/**
 * Verify export configuration on startup.
 */
async function verifyExportConfig() {
  console.log('Verifying export configuration...');

  try {
    const response = await fetch(`${API_URL}/api/export/verify`);
    const result = await response.json();

    if (result.valid) {
      console.log('✓ Export configuration valid');
      console.log(`  File storage: ${result.checks.fileStorage ? '✓' : '✗'}`);
      console.log(`  Email: ${result.checks.email ? '✓' : '✗'}`);
      console.log(`  Cloud: ${result.checks.cloud ? '✓' : '✗'}`);
      console.log('');
      return true;
    } else {
      console.warn('⚠ Export configuration has issues:');
      console.warn(`  File storage: ${result.checks.fileStorage ? '✓' : '✗'}`);
      console.warn(`  Email: ${result.checks.email ? '✓' : '✗'}`);
      console.warn(`  Cloud: ${result.checks.cloud ? '✓' : '✗'}`);
      console.warn('  At least one delivery path should be configured');
      console.warn('');
      return result.checks.fileStorage; // Continue if at least file storage works
    }

  } catch (error) {
    console.error('✗ Cannot verify export configuration:', error.message);
    console.error('');
    return false;
  }
}

/**
 * Main scheduler initialization.
 */
async function startScheduler() {
  // Verify connectivity
  const apiOk = await verifyAPIConnection();
  if (!apiOk) {
    console.error('Scheduler cannot start - API is not available');
    process.exit(1);
  }

  // Verify export configuration
  const configOk = await verifyExportConfig();
  if (!configOk) {
    console.error('Scheduler cannot start - export configuration is invalid');
    process.exit(1);
  }

  // Schedule the daily export job
  console.log('Scheduling daily export job...');
  console.log(`Next export scheduled for: ${getNextRunTime(SCHEDULE)}\n`);

  cron.schedule(SCHEDULE, () => {
    triggerDailyExport();
  });

  console.log('✓ Scheduler is running');
  console.log('  Press Ctrl+C to stop\n');

  // Optional: Run export immediately on startup for testing
  if (process.env.RUN_ON_STARTUP === 'true') {
    console.log('Running export immediately (RUN_ON_STARTUP=true)...\n');
    await triggerDailyExport();
  }
}

/**
 * Get human-readable next run time.
 */
function getNextRunTime(schedule) {
  // Parse cron schedule (simplified - assumes daily at HH:MM)
  const parts = schedule.split(' ');
  if (parts.length >= 2) {
    const minute = parts[0];
    const hour = parts[1];

    const now = new Date();
    const next = new Date();
    next.setHours(parseInt(hour), parseInt(minute), 0, 0);

    // If time has passed today, schedule for tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    return next.toLocaleString();
  }

  return 'See cron schedule: ' + schedule;
}

/**
 * Graceful shutdown handler.
 */
process.on('SIGINT', () => {
  console.log('\n\nShutting down scheduler...');
  console.log('Goodbye!');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\nReceived SIGTERM, shutting down...');
  process.exit(0);
});

// Start the scheduler
startScheduler().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
