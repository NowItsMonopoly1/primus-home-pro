'use client'

// PRIMUS HOME PRO - Automations List
// Dashboard view for managing automations

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { AutomationWithConfig, AutomationConfig } from '@/types'
import { toggleAutomation } from '@/lib/actions/automations-ui'
import { AutomationEditor } from './automation-editor'
import { Button } from '@/components/ui/button'

interface AutomationsListProps {
  automations: AutomationWithConfig[]
  onRefresh?: () => void
}

export function AutomationsList({ automations, onRefresh }: AutomationsListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editingAutomation, setEditingAutomation] = useState<AutomationWithConfig | null>(null)

  function handleToggle(automation: AutomationWithConfig) {
    startTransition(async () => {
      await toggleAutomation(automation.id, automation.userId, !automation.enabled)
      if (onRefresh) {
        onRefresh()
      } else {
        router.refresh()
      }
    })
  }

  function handleSaved() {
    if (onRefresh) {
      onRefresh()
    } else {
      router.refresh()
    }
  }

  return (
    <>
      <div className="space-y-4">
        {automations.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 p-12 text-center">
            <p className="text-muted-foreground">No automations yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Run the seed script to create default automations.
            </p>
          </div>
        ) : (
          automations.map((automation) => {
            const config = (automation.config as AutomationConfig) || {}

            return (
              <div
                key={automation.id}
                className="rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  {/* Left: Info */}
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{automation.name}</h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          automation.enabled
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {automation.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <div className="mb-3 space-y-1 text-sm text-muted-foreground">
                      <p>
                        <span className="font-medium">Trigger:</span>{' '}
                        <code className="rounded bg-muted px-1 py-0.5 text-xs">
                          {automation.trigger}
                        </code>
                      </p>
                      <p>
                        <span className="font-medium">Channel:</span>{' '}
                        {config.channel === 'email' ? '📧 Email' : '📱 SMS'}
                      </p>
                      {config.conditions && (
                        <p>
                          <span className="font-medium">Conditions:</span>{' '}
                          {config.conditions.minScore !== undefined &&
                            `Score ≥ ${config.conditions.minScore}`}
                          {config.conditions.maxScore !== undefined &&
                            config.conditions.maxScore < 100 &&
                            ` & ≤ ${config.conditions.maxScore}`}
                          {config.conditions.intentIn &&
                            ` • Intent: ${config.conditions.intentIn.join(', ')}`}
                          {config.conditions.stageIn &&
                            ` • Stage: ${config.conditions.stageIn.join(', ')}`}
                        </p>
                      )}
                    </div>

                    <div className="rounded-md bg-muted/50 p-3 text-sm">
                      <p className="line-clamp-2 font-mono text-xs text-muted-foreground">
                        {automation.template}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="ml-6 flex flex-col items-end gap-3">
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggle(automation)}
                      disabled={isPending}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        automation.enabled ? 'bg-primary' : 'bg-muted'
                      }`}
                      role="switch"
                      aria-checked={automation.enabled ? 'true' : 'false'}
                      aria-label={`Toggle ${automation.name}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          automation.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>

                    {/* Edit Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingAutomation(automation)}
                      disabled={isPending}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Editor Modal */}
      {editingAutomation && (
        <AutomationEditor
          automation={editingAutomation}
          onClose={() => setEditingAutomation(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  )
}
