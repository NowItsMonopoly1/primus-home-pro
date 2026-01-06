/**
 * TEST EXPORT SYSTEM
 *
 * Quick test script to verify the daily export system works correctly.
 * Runs a sample export with mock job data.
 */

import { executeDailyExport } from './adapters/export/daily-export.js';

// Sample job data (matches the structure from api-server.js)
const sampleJobs = [
  {
    jobId: 'JOB-001',
    customerName: 'Alice Johnson',
    customerId: 'CUST-001',
    customerPhone: '555-0123',
    address: '123 Pine St, San Francisco, CA',
    jobType: 'PANEL_UPGRADE',
    currentState: 'SCHEDULED',
    assignedTechnician: 'TECH-001',
    scheduledTime: '2026-01-04T09:00:00Z',
    estimatedDuration: 240,
    priority: 'HIGH',
    notes: 'Main panel upgrade required',
    photos: [],
    voiceNotes: [],
    materialsUsed: [],
    changeOrders: [],
    totalLaborHours: 0,
    totalMaterialCost: 0,
    metadata: {}
  },
  {
    jobId: 'JOB-002',
    customerName: 'Bob Smith',
    customerId: 'CUST-002',
    customerPhone: '555-9876',
    address: '456 Oak Rd, Oakland, CA',
    jobType: 'EV_CHARGER_INSTALL',
    currentState: 'WORK_COMPLETED',
    assignedTechnician: 'TECH-001',
    scheduledTime: '2026-01-04T13:30:00Z',
    estimatedDuration: 120,
    priority: 'MEDIUM',
    notes: 'Tesla Wall Connector installation',
    photos: ['photo1.jpg', 'photo2.jpg'],
    voiceNotes: [],
    materialsUsed: [
      { item: 'Tesla Wall Connector', quantity: 1, cost: 500 },
      { item: '6AWG Wire', quantity: 50, cost: 75 }
    ],
    changeOrders: [],
    totalLaborHours: 3.5,
    totalMaterialCost: 575,
    metadata: {}
  },
  {
    jobId: 'JOB-003',
    customerName: 'Charlie Davis',
    customerId: 'CUST-003',
    customerPhone: '555-4433',
    address: '789 Maple Ave, San Jose, CA',
    jobType: 'SERVICE_CALL',
    currentState: 'INVOICED',
    assignedTechnician: 'TECH-002',
    scheduledTime: '2026-01-04T10:00:00Z',
    estimatedDuration: 60,
    priority: 'EMERGENCY',
    notes: 'Partial power loss in kitchen - breaker replaced',
    photos: ['before.jpg', 'after.jpg'],
    voiceNotes: [],
    materialsUsed: [
      { item: '20A Circuit Breaker', quantity: 1, cost: 15 }
    ],
    changeOrders: [],
    totalLaborHours: 1.5,
    totalMaterialCost: 15,
    metadata: {}
  }
];

// Test configuration (local file storage only for now)
const testConfig = {
  fileStorage: {
    enabled: true,
    baseDir: './test-exports'
  },
  email: {
    enabled: false // Disable for testing
  },
  cloud: {
    enabled: false // Disable for testing
  }
};

console.log('=================================================');
console.log('ForgeExec Daily Export - Test Script');
console.log('=================================================\n');

console.log(`Jobs to export: ${sampleJobs.length}`);
console.log(`Export directory: ${testConfig.fileStorage.baseDir}\n`);

console.log('Starting export...\n');

// Execute the export
executeDailyExport(testConfig, sampleJobs, new Date())
  .then(result => {
    console.log('\n=================================================');
    console.log('Export Complete');
    console.log('=================================================\n');

    console.log(`Success: ${result.success}`);
    console.log(`Jobs Exported: ${result.jobsExported}`);
    console.log(`Export Date: ${result.exportDate}`);
    console.log(`Timestamp: ${result.timestamp}\n`);

    console.log('Delivery Results:');
    console.log(`  Local File: ${result.delivery.localFile.success ? '✓' : '✗'}`);
    if (result.delivery.localFile.success) {
      console.log(`    Export Dir: ${result.delivery.localFile.exportDir}`);
      console.log(`    CSV: ${result.delivery.localFile.csvPath}`);
      console.log(`    PDF: ${result.delivery.localFile.pdfPath}`);
    }
    console.log(`  Email: ${result.delivery.email.success ? '✓' : '✗ (disabled for test)'}`);
    console.log(`  Cloud: ${result.delivery.cloud.success ? '✓' : '✗ (disabled for test)'}`);

    if (result.errors.length > 0) {
      console.log('\nErrors:');
      result.errors.forEach(err => {
        console.log(`  [${err.path}] ${err.error}`);
      });
    }

    console.log('\n=================================================');
    console.log('Test complete! Check the test-exports directory');
    console.log('=================================================');

    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n✗ Export failed with error:', error);
    console.error(error.stack);
    process.exit(1);
  });
