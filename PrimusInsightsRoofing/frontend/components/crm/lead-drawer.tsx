'use client'

// PRIMUS HOME PRO - Lead Drawer Component
// Detailed side panel view for lead management

import { useState } from 'react'
import type { LeadWithMeta } from '@/types'
import { updateLeadStage, addLeadNote } from '@/lib/actions/crm'
import { X, Clock, BrainCircuit, Send, Mail, Phone } from 'lucide-react'
import { ScoreBadge, IntentBadge, SentimentBadge } from './badges'
import { Button } from '@/components/ui/button'
import { AIActionPanel } from '@/components/ai/ai-action-panel'

interface LeadDrawerProps {
  lead: LeadWithMeta
  onClose: () => void
}

export function LeadDrawer({ lead, onClose }: LeadDrawerProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [noteText, setNoteText] = useState('')

  async function handleStageChange(newStage: string) {
    setIsUpdating(true)
    await updateLeadStage(lead.id, newStage)
    setIsUpdating(false)
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
            {['New', 'Contacted', 'Qualified', 'Closed'].map((stage) => (
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

        {/* Activity Timeline */}
        <div className="mb-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Activity
          </h3>
          <div className="relative ml-2 space-y-4 border-l border-border pl-4">
            {lead.events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet</p>
            ) : (
              lead.events.map((event) => (
                <div key={event.id} className="relative">
                  <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border border-border bg-background" />
                  <p className="text-sm text-foreground">
                    {event.content || event.type.replace(/_/g, ' ')}
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(event.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
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
