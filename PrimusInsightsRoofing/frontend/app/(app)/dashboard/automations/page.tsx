// PRIMUS HOME PRO - Dashboard: Automations
// Manage automation rules and triggers

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getAutomationsForUser } from '@/lib/data/automations'
import { AutomationsList } from '@/components/automations/automations-list'

export const metadata = {
  title: 'Automations | Primus Home Pro',
  description: 'Manage your automation rules',
}

export default async function AutomationsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // Fetch user's automations
  const automations = await getAutomationsForUser(userId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Automations</h1>
        <p className="mt-2 text-muted-foreground">
          Manage automated workflows that trigger based on lead activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="text-2xl font-bold">{automations.length}</div>
          <div className="text-sm text-muted-foreground">Total Automations</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="text-2xl font-bold">
            {automations.filter((a) => a.enabled).length}
          </div>
          <div className="text-sm text-muted-foreground">Active</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="text-2xl font-bold">
            {automations.filter((a) => !a.enabled).length}
          </div>
          <div className="text-sm text-muted-foreground">Disabled</div>
        </div>
      </div>

      {/* List */}
      <AutomationsList automations={automations} />
    </div>
  )
}
