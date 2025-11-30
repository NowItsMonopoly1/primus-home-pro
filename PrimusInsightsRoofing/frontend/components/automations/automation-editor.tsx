'use client'

// PRIMUS HOME PRO - Automation Editor
// Drawer for editing automation settings, conditions, and templates

import { useState, useTransition } from 'react'
import type { AutomationWithConfig, AutomationConfig, AIChannel, AIIntent, LeadStage } from '@/types'
import { updateAutomation } from '@/lib/actions/automations-ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AutomationEditorProps {
  automation: AutomationWithConfig
  onClose: () => void
  onSaved: () => void
}

export function AutomationEditor({ automation, onClose, onSaved }: AutomationEditorProps) {
  const [isPending, startTransition] = useTransition()

  // Form state
  const config = automation.config || {}
  const [name, setName] = useState(automation.name)
  const [template, setTemplate] = useState(automation.template)
  const [channel, setChannel] = useState<AIChannel>(config.channel || 'email')
  const [delayMinutes, setDelayMinutes] = useState(config.delayMinutes || 0)

  // Conditions
  const [minScore, setMinScore] = useState(config.conditions?.minScore ?? 0)
  const [maxScore, setMaxScore] = useState(config.conditions?.maxScore ?? 100)
  const [intentIn, setIntentIn] = useState<AIIntent[]>(config.conditions?.intentIn || [])
  const [stageIn, setStageIn] = useState<LeadStage[]>(config.conditions?.stageIn || [])

  // Available options
  const intents: AIIntent[] = ['Booking', 'Info', 'Pricing', 'Support', 'Spam']
  const stages: LeadStage[] = ['New', 'Contacted', 'Qualified', 'Closed', 'Lost']

  function handleSave() {
    startTransition(async () => {
      const newConfig: AutomationConfig = {
        channel,
        delayMinutes,
        conditions: {
          minScore,
          maxScore,
          intentIn: intentIn.length > 0 ? intentIn : undefined,
          stageIn: stageIn.length > 0 ? stageIn : undefined,
        },
      }

      const result = await updateAutomation(automation.id, automation.userId, {
        name,
        template,
        config: newConfig,
      })

      if (result.success) {
        onSaved()
        onClose()
      }
    })
  }

  function toggleIntent(intent: AIIntent) {
    setIntentIn((prev) =>
      prev.includes(intent) ? prev.filter((i) => i !== intent) : [...prev, intent]
    )
  }

  function toggleStage(stage: LeadStage) {
    setStageIn((prev) =>
      prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative h-full w-full max-w-2xl overflow-y-auto bg-background p-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">Edit Automation</h2>
            <p className="text-sm text-muted-foreground">
              Trigger: <span className="font-mono text-xs">{automation.trigger}</span>
            </p>
          </div>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            ✕
          </Button>
        </div>

        {/* Settings Section */}
        <section className="mb-6">
          <h3 className="mb-3 text-lg font-semibold">Settings</h3>

          {/* Name */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Welcome New Leads"
              disabled={isPending}
            />
          </div>

          {/* Channel */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">Channel</label>
            <div className="flex gap-2">
              <Button
                variant={channel === 'email' ? 'default' : 'outline'}
                onClick={() => setChannel('email')}
                disabled={isPending}
                className="flex-1"
              >
                Email
              </Button>
              <Button
                variant={channel === 'sms' ? 'default' : 'outline'}
                onClick={() => setChannel('sms')}
                disabled={isPending}
                className="flex-1"
              >
                SMS
              </Button>
            </div>
          </div>

          {/* Delay */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">
              Delay (minutes) - <span className="text-xs text-muted-foreground">Future feature</span>
            </label>
            <Input
              type="number"
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(Number(e.target.value))}
              min={0}
              disabled={isPending}
            />
          </div>
        </section>

        {/* Conditions Section */}
        <section className="mb-6">
          <h3 className="mb-3 text-lg font-semibold">Conditions</h3>

          {/* Score Range */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              Score Range: {minScore} - {maxScore}
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-muted-foreground">Min</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="w-full"
                  disabled={isPending}
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-muted-foreground">Max</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={maxScore}
                  onChange={(e) => setMaxScore(Number(e.target.value))}
                  className="w-full"
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          {/* Intent Filters */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              Intent Filters <span className="text-xs text-muted-foreground">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {intents.map((intent) => (
                <Button
                  key={intent}
                  variant={intentIn.includes(intent) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleIntent(intent)}
                  disabled={isPending}
                >
                  {intent}
                </Button>
              ))}
            </div>
          </div>

          {/* Stage Filters */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              Stage Filters <span className="text-xs text-muted-foreground">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {stages.map((stage) => (
                <Button
                  key={stage}
                  variant={stageIn.includes(stage) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleStage(stage)}
                  disabled={isPending}
                >
                  {stage}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Template Section */}
        <section className="mb-6">
          <h3 className="mb-3 text-lg font-semibold">Template</h3>
          <div className="mb-2">
            <label className="mb-1 block text-sm font-medium">Message Template</label>
            <textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Hi {{name}}, thanks for your interest..."
              disabled={isPending}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Available variables: <code>{'{{name}}'}</code>, <code>{'{{businessType}}'}</code>,{' '}
            <code>{'{{agentName}}'}</code>
          </p>
        </section>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
