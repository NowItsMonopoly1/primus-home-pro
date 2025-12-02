'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUserProjects } from '@/lib/actions/create-project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type ProjectWithProgress = Awaited<ReturnType<typeof getUserProjects>>[number];

const stageColors: Record<string, string> = {
  Engineering: 'bg-blue-100 text-blue-800',
  HOA: 'bg-purple-100 text-purple-800',
  Permitting: 'bg-yellow-100 text-yellow-800',
  Installation: 'bg-orange-100 text-orange-800',
  Inspection: 'bg-pink-100 text-pink-800',
  Utility: 'bg-cyan-100 text-cyan-800',
  Complete: 'bg-green-100 text-green-800',
};

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-500',
  ON_HOLD: 'bg-yellow-500',
  CANCELLED: 'bg-red-500',
  COMPLETED: 'bg-blue-500',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      const data = await getUserProjects();
      setProjects(data);
      setLoading(false);
    }
    loadProjects();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500">Track installation progress and milestones</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/leads">View Leads</Link>
          </Button>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">🏗️</div>
            <h3 className="text-lg font-semibold mb-2">No active projects</h3>
            <p className="text-gray-500 text-center max-w-md mb-4">
              Projects are created automatically when leads are marked as &quot;Closed Won&quot;
              and have an accepted proposal.
            </p>
            <Button asChild>
              <Link href="/dashboard/leads">Go to Leads</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {project.lead.name || project.lead.email}
                      </CardTitle>
                      <p className="text-sm text-gray-500 truncate">
                        {project.lead.address || 'No address'}
                      </p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${statusColors[project.status]}`} 
                         title={project.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Stage badge */}
                  <div className="mb-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${stageColors[project.currentStage] || 'bg-gray-100 text-gray-800'}`}>
                      {project.currentStage}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestones count */}
                  <p className="text-sm text-gray-500">
                    {project.completedMilestones} of {project.totalMilestones} milestones complete
                  </p>

                  {/* System size */}
                  {project.lead.systemSizeKw && (
                    <p className="text-sm text-gray-500 mt-1">
                      ☀️ {project.lead.systemSizeKw.toFixed(2)} kW system
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
