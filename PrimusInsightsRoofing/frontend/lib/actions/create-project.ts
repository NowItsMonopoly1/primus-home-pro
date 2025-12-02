'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { runAutomations } from '@/lib/automations/engine';

// Milestone name to automation trigger mapping
const MILESTONE_TRIGGERS: Record<string, string> = {
  'Permit Application Submitted': 'milestone.permit_submitted',
  'Permit Approved': 'milestone.permit_approved',
  'Installation Scheduled': 'milestone.installation_scheduled',
  'Installation Complete': 'milestone.installation_complete',
  'Final Inspection Passed': 'milestone.inspection_passed',
  'PTO Received': 'milestone.pto_received',
};

// Standard milestones for solar installation projects
const STANDARD_MILESTONES = [
  { name: 'Site Survey Completed', category: 'ENGINEERING', sortOrder: 1, description: 'On-site measurement and shading analysis' },
  { name: 'Engineering Design Finalized', category: 'ENGINEERING', sortOrder: 2, description: 'System design and structural review' },
  { name: 'HOA Application Submitted', category: 'HOA', sortOrder: 3, description: 'Submit architectural change request to HOA' },
  { name: 'HOA Approval Received', category: 'HOA', sortOrder: 4, description: 'HOA approves solar installation' },
  { name: 'Permit Application Submitted', category: 'PERMITTING', sortOrder: 5, description: 'Submit building permit to local AHJ' },
  { name: 'Permit Approved', category: 'PERMITTING', sortOrder: 6, description: 'Building permit approved by jurisdiction' },
  { name: 'Materials Ordered', category: 'INSTALLATION', sortOrder: 7, description: 'Panels, inverters, racking ordered' },
  { name: 'Materials Received', category: 'INSTALLATION', sortOrder: 8, description: 'All equipment delivered to warehouse' },
  { name: 'Installation Scheduled', category: 'INSTALLATION', sortOrder: 9, description: 'Installation date confirmed with customer' },
  { name: 'Installation Complete', category: 'INSTALLATION', sortOrder: 10, description: 'Physical installation finished' },
  { name: 'Final Inspection Passed', category: 'INSPECTION', sortOrder: 11, description: 'City/county inspection approved' },
  { name: 'Utility Interconnection Applied', category: 'UTILITY', sortOrder: 12, description: 'Net metering application submitted' },
  { name: 'Utility Meter Installed', category: 'UTILITY', sortOrder: 13, description: 'Bi-directional meter installed' },
  { name: 'PTO Received', category: 'PTO', sortOrder: 14, description: 'Permission to Operate granted - system live!' },
];

export interface CreateProjectResult {
  success: boolean;
  projectId?: string;
  error?: string;
}

/**
 * Creates a new project from a closed-won lead
 * Auto-generates standard milestone checklist
 */
export async function createProjectFromLead(leadId: string): Promise<CreateProjectResult> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Get the lead and verify ownership
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, userId },
      include: {
        project: true,
        proposals: {
          where: { status: 'ACCEPTED' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!lead) {
      return { success: false, error: 'Lead not found' };
    }

    // Check if project already exists
    if (lead.project) {
      return { success: true, projectId: lead.project.id };
    }

    // Verify lead is in appropriate stage
    if (lead.stage !== 'Closed Won' && lead.stage !== 'Won') {
      return { 
        success: false, 
        error: 'Lead must be in "Closed Won" stage to create a project' 
      };
    }

    // Calculate target completion date (typically 60-90 days from contract)
    const targetCompletion = new Date();
    targetCompletion.setDate(targetCompletion.getDate() + 75);

    // Create project with milestones
    const project = await prisma.project.create({
      data: {
        leadId: lead.id,
        currentStage: 'Engineering',
        status: 'ACTIVE',
        contractSignedAt: lead.proposals[0]?.acceptedAt || new Date(),
        targetCompletionDate: targetCompletion,
        notes: `Project created from lead: ${lead.name || lead.email}`,
        milestones: {
          create: STANDARD_MILESTONES.map((m) => ({
            name: m.name,
            description: m.description,
            category: m.category,
            sortOrder: m.sortOrder,
            isComplete: false,
          })),
        },
      },
      include: {
        milestones: true,
      },
    });

    // Update lead stage if needed
    await prisma.lead.update({
      where: { id: leadId },
      data: { stage: 'Closed Won' },
    });

    // Log event
    await prisma.leadEvent.create({
      data: {
        leadId: lead.id,
        type: 'STAGE_CHANGE',
        payload: {
          action: 'project_created',
          projectId: project.id,
          milestonesCreated: project.milestones.length,
        },
      },
    });

    revalidatePath('/dashboard/leads');
    revalidatePath(`/dashboard/projects/${project.id}`);

    return { success: true, projectId: project.id };
  } catch (error) {
    console.error('Create project error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create project' 
    };
  }
}

/**
 * Get project details with milestones and documents
 */
export async function getProjectDetails(projectId: string) {
  const { userId } = await auth();
  if (!userId) return null;

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      lead: { userId },
    },
    include: {
      lead: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          systemSizeKW: true,
          annualKwhProduction: true,
          roofOrientation: true,
        },
      },
      milestones: {
        orderBy: { sequence: 'asc' },
      },
      documents: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return project;
}

/**
 * Update milestone completion status
 */
export async function updateMilestoneStatus(
  milestoneId: string,
  isComplete: boolean
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Verify ownership through project -> lead -> user chain
    const milestone = await prisma.projectMilestone.findFirst({
      where: {
        id: milestoneId,
        project: {
          lead: { userId },
        },
      },
      include: {
        project: {
          include: { lead: true },
        },
      },
    });

    if (!milestone) {
      return { success: false, error: 'Milestone not found' };
    }

    // Update milestone
    await prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: {
        isComplete,
        completedAt: isComplete ? new Date() : null,
        completedBy: isComplete ? userId : null,
        automationTriggered: isComplete, // Mark that automation has been fired
      },
    });

    // Update project stage based on completed milestones
    const newStage = await updateProjectStage(milestone.projectId);

    // Log event
    await prisma.leadEvent.create({
      data: {
        leadId: milestone.project.leadId,
        type: 'STATUS_UPDATE',
        payload: {
          action: 'milestone_updated',
          milestoneName: milestone.name,
          milestoneCategory: milestone.category,
          isComplete,
        },
      },
    });

    // Trigger milestone automation if completing (not uncompleting)
    if (isComplete) {
      const triggerName = MILESTONE_TRIGGERS[milestone.name];
      if (triggerName) {
        // Fire automation asynchronously
        runAutomations({
          leadId: milestone.project.leadId,
          trigger: triggerName,
          data: {
            projectId: milestone.projectId,
            milestoneName: milestone.name,
            milestoneCategory: milestone.category,
            projectStage: newStage,
          },
        }).catch((err) => console.error('[AUTO] Milestone trigger error:', err));
      }
    }

    revalidatePath(`/dashboard/projects/${milestone.projectId}`);
    revalidatePath('/dashboard/leads');

    return { success: true };
  } catch (error) {
    console.error('Update milestone error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update milestone' 
    };
  }
}

/**
 * Auto-update project stage based on milestone completion
 * Returns the new stage for automation triggers
 */
async function updateProjectStage(projectId: string): Promise<string> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      milestones: {
        orderBy: { sequence: 'asc' },
      },
    },
  });

  if (!project) return 'Engineering';

  // Find the current stage based on completed milestones
  const completedCategories = new Set<string>();
  let currentStage = 'Engineering';

  for (const milestone of project.milestones) {
    if (milestone.isComplete) {
      completedCategories.add(milestone.category);
    }
  }

  // Determine stage based on milestone categories
  if (completedCategories.has('PTO')) {
    currentStage = 'Complete';
  } else if (completedCategories.has('UTILITY')) {
    currentStage = 'Utility';
  } else if (completedCategories.has('INSPECTION')) {
    currentStage = 'Inspection';
  } else if (completedCategories.has('INSTALLATION')) {
    currentStage = 'Installation';
  } else if (completedCategories.has('PERMITTING')) {
    currentStage = 'Permitting';
  } else if (completedCategories.has('HOA')) {
    currentStage = 'HOA';
  } else if (completedCategories.has('ENGINEERING')) {
    currentStage = 'Engineering';
  }

  // Check if all milestones complete
  const allComplete = project.milestones.every((m) => m.isComplete);
  const status = allComplete ? 'COMPLETED' : 'ACTIVE';

  await prisma.project.update({
    where: { id: projectId },
    data: {
      currentStage,
      status,
    },
  });

  return currentStage;
}

/**
 * Get all projects for the current user
 */
export async function getUserProjects() {
  const { userId } = await auth();
  if (!userId) return [];

  const projects = await prisma.project.findMany({
    where: {
      lead: { userId },
    },
    include: {
      lead: {
        select: {
          name: true,
          email: true,
          address: true,
          systemSizeKW: true,
        },
      },
      milestones: {
        select: {
          isComplete: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Add progress calculation
  return projects.map((project) => ({
    ...project,
    progress: Math.round(
      (project.milestones.filter((m) => m.isComplete).length / 
       project.milestones.length) * 100
    ),
    completedMilestones: project.milestones.filter((m) => m.isComplete).length,
    totalMilestones: project.milestones.length,
  }));
}

/**
 * Add a document to a project
 */
export async function addProjectDocument(
  projectId: string,
  documentData: {
    documentType: string;
    fileName: string;
    fileUrl: string;
    fileSize?: number;
    mimeType?: string;
    notes?: string;
  }
): Promise<{ success: boolean; documentId?: string; error?: string }> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Verify ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        lead: { userId },
      },
    });

    if (!project) {
      return { success: false, error: 'Project not found' };
    }

    const document = await prisma.projectDocument.create({
      data: {
        projectId,
        documentType: documentData.documentType,
        fileName: documentData.fileName,
        fileUrl: documentData.fileUrl,
        fileSize: documentData.fileSize,
        mimeType: documentData.mimeType,
        uploadedBy: userId,
        notes: documentData.notes,
      },
    });

    revalidatePath(`/dashboard/projects/${projectId}`);

    return { success: true, documentId: document.id };
  } catch (error) {
    console.error('Add document error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to add document' 
    };
  }
}
