'use client'

// PRIMUS HOME PRO - Lead Drawer Component
// Detailed side panel view for lead management

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { LeadWithMeta } from '@/types'
import { updateLeadStage, addLeadNote } from '@/lib/actions/crm'
import { createProjectFromLead } from '@/lib/actions/create-project'
import { X, Clock, BrainCircuit, Send, Mail, Phone, HardHat, FileText } from 'lucide-react'
import { ScoreBadge, IntentBadge, SentimentBadge } from './badges'
import { Button } from '@/components/ui/button'
import { AIActionPanel } from '@/components/ai/ai-action-panel'

interface LeadDrawerProps {
  lead: LeadWithMeta & { project?: { id: string } | null }
  onClose: () => void
}

export function LeadDrawer({ lead, onClose }: LeadDrawerProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [isPending, startTransition] = useTransition()

  const isClosedWon = lead.stage === 'Closed Won' || lead.stage === 'Won' || lead.stage === 'Closed'

  async function handleStageChange(newStage: string) {
    setIsUpdating(true)
    await updateLeadStage(lead.id, newStage)
    setIsUpdating(false)
  }

  async function handleCreateProject() {
    startTransition(async () => {
      const result = await createProjectFromLead(lead.id)
      if (result.success && result.projectId) {
        router.push(`/dashboard/projects/${result.projectId}`)
      }
    })
  }

  async function handleGoToProject() {
    if (lead.project?.id) {
      router.push(`/dashboard/projects/${lead.project.id}`)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <aside
        className="h-full w-full max-w-md overflow-y-auto border-l border-border bg-background p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">
              {lead.name || 'Anonymous Lead'}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <ScoreBadge score={lead.lastScore || 0} />
              <IntentBadge intent={lead.lastIntent || 'New'} />
              <SentimentBadge sentiment={lead.lastSentiment || 'Neutral'} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contact Info */}
        <div className="mb-6 space-y-2 rounded-lg border border-border bg-card p-4">
          {lead.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a
                href={`mailto:${lead.email}`}
                className="text-primary hover:underline"
              >
                {lead.email}
              </a>
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a
                href={`tel:${lead.phone}`}
                className="text-primary hover:underline"
              >
                {lead.phone}
              </a>
            </div>
          )}
          {lead.source && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Source: {lead.source}</span>
            </div>
          )}
        </div>

        {/* AI Action Panel - Live Reply Generation */}
        <div className="mb-6">
          <AIActionPanel lead={lead} />
        </div>

        {/* AI Summary */}
        <div className="mb-6 space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
            <BrainCircuit className="h-3 w-3" /> AI Insight
          </div>
          <p className="text-sm text-foreground">
            Lead shows{' '}
            <span className="font-medium">
              {lead.lastScore && lead.lastScore > 70 ? 'high' : lead.lastScore && lead.lastScore > 40 ? 'moderate' : 'low'}
            </span>{' '}
            intent based on recent interactions.
            {lead.lastIntent === 'Booking' && (
              <span className="text-primary"> Recommended: Send booking link.</span>
            )}
          </p>
        </div>

        {/* Stage Actions */}
        <div className="mb-6">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Update Stage
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {['New', 'Contacted', 'Qualified', 'Closed Won'].map((stage) => (
              <button
                key={stage}
                onClick={() => handleStageChange(stage)}
                disabled={isUpdating}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  lead.stage === stage
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground hover:border-primary/50'
                } disabled:opacity-50`}
              >
                {stage}
              </button>
            ))}
          </div>
        </div>

        {/* Project Actions - Show for Closed Won leads */}
        {isClosedWon && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-green-700">
              <HardHat className="h-4 w-4" /> Installation Project
            </h3>
            {lead.project ? (
              <Button
                onClick={handleGoToProject}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <FileText className="mr-2 h-4 w-4" />
                Go to Project Dashboard
              </Button>
            ) : (
              <Button
                onClick={handleCreateProject}
                disabled={isPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isPending ? (
                  <>Creating Project...</>
                ) : (
                  <>
                    <HardHat className="mr-2 h-4 w-4" />
                    Create Installation Project
                  </>
                )}
              </Button>
            )}
            <p className="mt-2 text-xs text-green-600">
              {lead.project 
                ? 'Track milestones, permits, and installation progress'
                : 'Auto-generates milestone checklist for permitting & installation'}
            </p>
          </div>
        )}

        {/* Activity Timeline */}
        <div className="mb-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Activity
          </h3>
          <div className="relative ml-2 space-y-4 border-l border-border pl-4">
            {lead.events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet</p>
            ) : (
              lead.events.map((event) => {
                const payload = event.payload as Record<string, unknown> | null
                const eventIcon = getEventIcon(event.type, payload)
                const eventText = getEventText(event.type, event.content, payload)
                
                return (
                  <div key={event.id} className="relative">
                    <div className={`absolute -left-[21px] top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${getEventBgColor(event.type, payload)}`}>
                      {eventIcon}
                    </div>
                    <p className="text-sm text-foreground pl-1">
                      {eventText}
                    </p>
                    <span className="text-[10px] text-muted-foreground pl-1">
                      {new Date(event.createdAt).toLocaleString()}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Add Note */}
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            if (!noteText.trim()) return
            const formData = new FormData()
            formData.append('leadId', lead.id)
            formData.append('note', noteText)
            await addLeadNote(formData)
            setNoteText('')
          }}
          className="relative"
        >
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add internal note..."
            className="h-20 w-full rounded-lg border border-input bg-background p-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={!noteText.trim()}
            className="absolute bottom-2 right-2 rounded-lg bg-primary p-1.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-3 w-3" />
          </button>
        </form>
      </aside>
    </div>
  )
}

// Helper functions for timeline display
function getEventIcon(type: string, payload: Record<string, unknown> | null): string {
  const action = payload?.action as string | undefined
  
  if (action === 'project_created') return '🏗️'
  if (action === 'milestone_updated') {
    return payload?.isComplete ? '✅' : '⏸️'
  }
  if (action === 'proposal_generated') return '📄'
  if (action === 'proposal_accepted') return '✍️'
  
  switch (type) {
    case 'STAGE_CHANGE': return '📊'
    case 'NOTE_ADDED': return '📝'
    case 'STATUS_UPDATE': return '🔄'
    case 'EMAIL_SENT': return '📧'
    case 'CALL_LOGGED': return '📞'
    case 'SOLAR_ANALYSIS': return '☀️'
    default: return '•'
  }
}

function getEventBgColor(type: string, payload: Record<string, unknown> | null): string {
  const action = payload?.action as string | undefined
  
  if (action === 'project_created') return 'bg-green-100'
  if (action === 'milestone_updated') return 'bg-blue-100'
  if (action === 'proposal_accepted') return 'bg-green-100'
  
  switch (type) {
    case 'STAGE_CHANGE': return 'bg-purple-100'
    case 'NOTE_ADDED': return 'bg-yellow-100'
    case 'SOLAR_ANALYSIS': return 'bg-orange-100'
    default: return 'bg-gray-100'
  }
}

function getEventText(
  type: string, 
  content: string | null, 
  payload: Record<string, unknown> | null
): string {
  if (content) return content
  
  const action = payload?.action as string | undefined
  
  if (action === 'project_created') {
    return 'Installation project created'
  }
  if (action === 'milestone_updated') {
    const name = payload?.milestoneName as string
    const isComplete = payload?.isComplete as boolean
    return isComplete 
      ? `✓ Completed: ${name}` 
      : `Reopened: ${name}`
  }
  if (action === 'proposal_generated') {
    return 'Financial proposal generated'
  }
  if (action === 'proposal_accepted') {
    return 'Contract signed and accepted!'
  }
  
  return type.replace(/_/g, ' ')
}
