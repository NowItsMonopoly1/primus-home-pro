// PRIMUS HOME PRO - Dashboard Home
// Overview and quick stats

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const { userId: clerkUserId } = await auth()

  if (!clerkUserId) {
    redirect('/sign-in')
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
  })

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  // Get stats
  const totalLeads = await prisma.lead.count({ where: { userId: user.id } })
  const newLeads = await prisma.lead.count({
    where: { userId: user.id, stage: 'New' },
  })
  const qualifiedLeads = await prisma.lead.count({
    where: { userId: user.id, stage: 'Qualified' },
  })
  const closedLeads = await prisma.lead.count({
    where: { userId: user.id, stage: 'Closed' },
  })

  const stats = [
    {
      title: 'Total Leads',
      value: totalLeads,
      icon: Users,
      description: 'All-time captures',
    },
    {
      title: 'New',
      value: newLeads,
      icon: Clock,
      description: 'Awaiting contact',
    },
    {
      title: 'Qualified',
      value: qualifiedLeads,
      icon: TrendingUp,
      description: 'High-intent leads',
    },
    {
      title: 'Closed',
      value: closedLeads,
      icon: CheckCircle,
      description: 'Won deals',
    },
  ]

  return (
    <section className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back, {user.name || 'there'}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here's what's happening with your leads today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Get started with common tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/dashboard/leads">View All Leads</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/templates/simple">Test Landing Page</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}
