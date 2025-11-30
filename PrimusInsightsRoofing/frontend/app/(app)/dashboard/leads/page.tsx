// PRIMUS HOME PRO - Leads Dashboard Page
// Command Center for lead management

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getLeadsForUser } from '@/lib/data/leads'
import { LeadsTable } from '@/components/crm/leads-table'
import { prisma } from '@/lib/db/prisma'

export default async function LeadsPage() {
  const { userId: clerkUserId } = await auth()

  if (!clerkUserId) {
    redirect('/sign-in')
  }

  // Find user by Clerk ID
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
  })

  if (!user) {
    // User not synced yet from webhook
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Setting up your account...</h2>
          <p className="mt-2 text-muted-foreground">
            Please refresh the page in a moment.
          </p>
        </div>
      </div>
    )
  }

  const leads = await getLeadsForUser(user.id)

  return (
    <section className="mx-auto max-w-7xl space-y-6 p-6 md:p-10">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Leads</h1>
          <p className="mt-1 text-muted-foreground">
            Manage and track your incoming opportunities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-border bg-card px-4 py-2">
            <span className="text-sm font-medium text-muted-foreground">Total:</span>
            <span className="ml-2 text-lg font-bold text-foreground">{leads.length}</span>
          </div>
        </div>
      </header>

      {/* Table */}
      <LeadsTable initialLeads={leads} />
    </section>
  )
}
