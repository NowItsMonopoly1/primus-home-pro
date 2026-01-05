/**
 * ForgeExec API Server
 * 
 * HTTP API layer that exposes ForgeExec executor functionality to the UI.
 * Bridges React UI with the deterministic execution engine.
 */

import express from 'express';
import cors from 'cors';
import { Executor } from './executor/executor.js';
import { createMockKernel } from './kernel-client/mock-kernel.js';
import { wireNLEAdapters } from './verticals/next-level-electric/adapter-wiring.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize ForgeExec
const kernel = createMockKernel();
const adapterRegistry = wireNLEAdapters();
const executor = new Executor(kernel, adapterRegistry);

// In-memory job store (replace with database in production)
const jobs = new Map();

// Sample jobs
jobs.set('JOB-001', {
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
});

jobs.set('JOB-002', {
  jobId: 'JOB-002',
  customerName: 'Bob Smith',
  customerId: 'CUST-002',
  customerPhone: '555-9876',
  address: '456 Oak Rd, Oakland, CA',
  jobType: 'EV_CHARGER_INSTALL',
  currentState: 'ON_SITE',
  assignedTechnician: 'TECH-001',
  scheduledTime: '2026-01-04T13:30:00Z',
  estimatedDuration: 120,
  priority: 'MEDIUM',
  notes: 'Tesla Wall Connector installation',
  photos: [],
  voiceNotes: [],
  materialsUsed: [],
  changeOrders: [],
  totalLaborHours: 1.5,
  totalMaterialCost: 45,
  metadata: {}
});

jobs.set('JOB-003', {
  jobId: 'JOB-003',
  customerName: 'Charlie Davis',
  customerId: 'CUST-003',
  customerPhone: '555-4433',
  address: '789 Maple Ave, San Jose, CA',
  jobType: 'SERVICE_CALL',
  currentState: 'DISPATCHED',
  assignedTechnician: 'TECH-002',
  scheduledTime: '2026-01-04T10:00:00Z',
  estimatedDuration: 60,
  priority: 'EMERGENCY',
  notes: 'Partial power loss in kitchen',
  photos: [],
  voiceNotes: [],
  materialsUsed: [],
  changeOrders: [],
  totalLaborHours: 0,
  totalMaterialCost: 0,
  metadata: {}
});

/**
 * POST /api/events
 * Submit an execution event for validation and processing
 */
app.post('/api/events', async (req, res) => {
  try {
    const event = req.body;
    const jobId = event.payload?.jobId;
    
    if (!jobId) {
      return res.status(400).json({
        accepted: false,
        message: 'Missing jobId in event payload',
        error: 'INVALID_PAYLOAD'
      });
    }

    const job = jobs.get(jobId);
    if (!job) {
      return res.status(404).json({
        accepted: false,
        message: `Job ${jobId} not found`,
        error: 'JOB_NOT_FOUND'
      });
    }

    // Execute event through ForgeExec
    const jobContext = {
      jobId: job.jobId,
      currentState: job.currentState,
      customerId: job.customerId,
      metadata: job.metadata
    };

    const result = await executor.execute(event, jobContext);

    // Update job state if transition accepted
    if (result.state && result.state !== job.currentState) {
      job.currentState = result.state;
      jobs.set(jobId, job);
    }

    res.json({
      accepted: true,
      newState: result.state,
      message: `State transition: ${jobContext.currentState} → ${result.state}`,
      outputs: result.outputs
    });

  } catch (error) {
    console.error('Event execution error:', error);
    res.status(500).json({
      accepted: false,
      message: error.message || 'Event execution failed',
      error: 'EXECUTION_ERROR'
    });
  }
});

/**
 * GET /api/jobs/:jobId
 * Get job details by ID
 */
app.get('/api/jobs/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json(job);
});

/**
 * GET /api/jobs
 * Get all jobs (optionally filter by state)
 */
app.get('/api/jobs', (req, res) => {
  const { state } = req.query;
  let jobList = Array.from(jobs.values());
  
  if (state === 'ACTIVE') {
    jobList = jobList.filter(j => 
      !['CLOSED', 'INVOICED'].includes(j.currentState)
    );
  } else if (state) {
    jobList = jobList.filter(j => j.currentState === state);
  }
  
  res.json(jobList);
});

/**
 * GET /api/technicians/:technicianId
 * Get technician status
 */
app.get('/api/technicians/:technicianId', (req, res) => {
  // Mock technician data
  const { technicianId } = req.params;
  
  const tech = {
    id: technicianId,
    name: technicianId === 'TECH-001' ? 'John Smith' : 'Jane Doe',
    isClockedIn: true,
    currentLocation: { lat: 37.7749, lng: -122.4194 },
    currentJobId: technicianId === 'TECH-001' ? 'JOB-002' : 'JOB-003',
    lastUpdate: new Date().toISOString()
  };
  
  res.json(tech);
});

/**
 * GET /
 * API root - shows available endpoints
 */
app.get('/', (req, res) => {
  res.json({
    service: 'ForgeExec API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /health',
      submitEvent: 'POST /api/events',
      getJob: 'GET /api/jobs/:jobId',
      getJobs: 'GET /api/jobs?state=ACTIVE',
      getTechnician: 'GET /api/technicians/:technicianId'
    },
    ui: 'http://localhost:5173',
    docs: 'See QUICKSTART.md for setup instructions'
  });
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'ForgeExec API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`ForgeExec API Server running on http://localhost:${PORT}`);
  console.log(`Jobs loaded: ${jobs.size}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
