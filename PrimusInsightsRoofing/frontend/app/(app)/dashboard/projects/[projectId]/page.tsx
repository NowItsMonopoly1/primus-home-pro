'use client';

import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  getProjectDetails, 
  updateMilestoneStatus,
} from '@/lib/actions/create-project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Define proper types for project details
interface ProjectLead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  systemSizeKw: number | null;
  estimatedAnnualProduction: number | null;
  roofOrientation: string | null;
}

interface ProjectMilestone {
  id: string;
  name: string;
  description: string | null;
  category: string;
  sequence: number;
  isComplete: boolean;
  completedAt: Date | null;
  completedBy: string | null;
  dueDate: Date | null;
}

interface ProjectDocument {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  isApproved: boolean;
  createdAt: Date;
}

interface ProjectDetails {
  id: string;
  leadId: string;
  currentStage: string;
  status: string;
  contractSignedAt: Date | null;
  targetCompletionDate: Date | null;
  lead: ProjectLead;
  milestones: ProjectMilestone[];
  documents: ProjectDocument[];
}

const categoryIcons: Record<string, string> = {
  ENGINEERING: '📐',
  HOA: '🏘️',
  PERMITTING: '📋',
  INSTALLATION: '🔧',
  INSPECTION: '🔍',
  UTILITY: '⚡',
  PTO: '✅',
};

const categoryColors: Record<string, string> = {
  ENGINEERING: 'border-l-blue-500',
  HOA: 'border-l-purple-500',
  PERMITTING: 'border-l-yellow-500',
  INSTALLATION: 'border-l-orange-500',
  INSPECTION: 'border-l-pink-500',
  UTILITY: 'border-l-cyan-500',
  PTO: 'border-l-green-500',
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<'milestones' | 'documents'>('milestones');

  useEffect(() => {
    async function loadProject() {
      const data = await getProjectDetails(projectId) as ProjectDetails | null;
      setProject(data);
      setLoading(false);
    }
    loadProject();
  }, [projectId]);

  const handleMilestoneToggle = (milestone: ProjectMilestone) => {
    startTransition(async () => {
      const result = await updateMilestoneStatus(milestone.id, !milestone.isComplete);
      if (result.success) {
        // Refresh project data
        const data = await getProjectDetails(projectId) as ProjectDetails | null;
        setProject(data);
      }
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200 rounded" />
          <div className="h-4 w-48 bg-gray-100 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 h-96 bg-gray-100 rounded-lg" />
            <div className="h-96 bg-gray-100 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">🚫</div>
            <h3 className="text-lg font-semibold mb-2">Project not found</h3>
            <p className="text-gray-500 mb-4">
              This project may have been deleted or you don&apos;t have access.
            </p>
            <Button asChild>
              <Link href="/dashboard/projects">Back to Projects</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedCount = project.milestones.filter((m) => m.isComplete).length;
  const progressPercent = Math.round((completedCount / project.milestones.length) * 100);

  // Group milestones by category
  const milestonesByCategory = project.milestones.reduce<Record<string, ProjectMilestone[]>>((acc, m) => {
    if (!acc[m.category]) acc[m.category] = [];
    acc[m.category].push(m);
    return acc;
  }, {});

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" asChild className="p-0 h-auto">
              <Link href="/dashboard/projects" className="text-gray-500 hover:text-gray-700">
                ← Projects
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {project.lead.name || project.lead.email}
          </h1>
          <p className="text-gray-500">{project.lead.address}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            project.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
            project.status === 'ON_HOLD' ? 'bg-yellow-100 text-yellow-800' :
            project.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {project.status}
          </span>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/leads?id=${project.leadId}`}>View Lead</Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Current Stage</div>
            <div className="text-xl font-bold">{project.currentStage}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Progress</div>
            <div className="text-xl font-bold">{progressPercent}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">System Size</div>
            <div className="text-xl font-bold">
              {project.lead.systemSizeKw?.toFixed(2) || '—'} kW
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Est. Production</div>
            <div className="text-xl font-bold">
              {project.lead.estimatedAnnualProduction 
                ? `${Math.round(project.lead.estimatedAnnualProduction).toLocaleString()} kWh/yr`
                : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={activeTab === 'milestones' ? 'default' : 'outline'}
          onClick={() => setActiveTab('milestones')}
        >
          Milestones ({completedCount}/{project.milestones.length})
        </Button>
        <Button
          variant={activeTab === 'documents' ? 'default' : 'outline'}
          onClick={() => setActiveTab('documents')}
        >
          Documents ({project.documents.length})
        </Button>
      </div>

      {/* Content */}
      {activeTab === 'milestones' ? (
        <div className="space-y-6">
          {Object.entries(milestonesByCategory).map(([category, milestones]) => (
            <Card key={category}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>{categoryIcons[category] || '📌'}</span>
                  {category.charAt(0) + category.slice(1).toLowerCase()}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${categoryColors[category]} bg-gray-50 hover:bg-gray-100 transition-colors ${isPending ? 'opacity-50' : ''}`}
                  >
                    <button
                      onClick={() => handleMilestoneToggle(milestone)}
                      disabled={isPending}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        milestone.isComplete
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-400'
                      }`}
                    >
                      {milestone.isComplete && '✓'}
                    </button>
                    <div className="flex-1">
                      <div className={`font-medium ${milestone.isComplete ? 'line-through text-gray-500' : ''}`}>
                        {milestone.name}
                      </div>
                      {milestone.description && (
                        <div className="text-sm text-gray-500">{milestone.description}</div>
                      )}
                    </div>
                    {milestone.completedAt && (
                      <div className="text-xs text-gray-400">
                        {new Date(milestone.completedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Document Vault</CardTitle>
              <Button variant="outline" size="sm" disabled>
                + Upload Document
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {project.documents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-3">📁</div>
                <p>No documents uploaded yet</p>
                <p className="text-sm">Upload permits, contracts, and inspection reports</p>
              </div>
            ) : (
              <div className="space-y-2">
                {project.documents.map((doc) => (
                  <DocumentRow key={doc.id} document={doc} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DocumentRow({ document }: { document: ProjectDocument }) {
  const iconMap: Record<string, string> = {
    'application/pdf': '📄',
    'image/jpeg': '🖼️',
    'image/png': '🖼️',
    default: '📎',
  };

  const icon = iconMap[document.mimeType || 'default'] || iconMap.default;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{document.fileName}</div>
        <div className="text-sm text-gray-500">{document.documentType}</div>
      </div>
      {document.isApproved && (
        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
          Approved
        </span>
      )}
      <div className="text-xs text-gray-400">
        {new Date(document.createdAt).toLocaleDateString()}
      </div>
      <Button variant="ghost" size="sm" asChild>
        <a href={document.fileUrl} target="_blank" rel="noopener noreferrer">
          View
        </a>
      </Button>
    </div>
  );
}
