// PRIMUS HOME PRO - Dashboard Layout
// Protected layout for authenticated users

import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { LayoutDashboard, Users, Inbox, Settings, Zap, CreditCard } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-foreground">
              Primus Home Pro
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/leads"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Users className="h-4 w-4" />
                Leads
              </Link>
              <Link
                href="/dashboard/automations"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Zap className="h-4 w-4" />
                Automations
              </Link>
              <Link
                href="/dashboard/billing"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <CreditCard className="h-4 w-4" />
                Billing
              </Link>
              <Link
                href="/dashboard/inbox"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Inbox className="h-4 w-4" />
                Inbox
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </nav>
          </div>

          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
