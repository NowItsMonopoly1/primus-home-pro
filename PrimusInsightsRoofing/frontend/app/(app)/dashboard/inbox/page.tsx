// PRIMUS HOME PRO - Inbox Page
// Message center for lead communications

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Inbox, Mail, MessageSquare, Bell } from 'lucide-react'
import Link from 'next/link'

export default async function InboxPage() {
  const { userId: clerkUserId } = await auth()

  if (!clerkUserId) {
    redirect('/sign-in')
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
  })

  if (!user) {
    redirect('/sign-in')
  }

  // Get recent lead events that are messages
  const recentMessages = await prisma.leadEvent.findMany({
    where: {
      lead: {
        userId: user.id,
      },
      type: {
        in: ['EMAIL_RECEIVED', 'SMS_RECEIVED', 'FORM_SUBMIT'],
      },
    },
    include: {
      lead: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  })

  const stats = {
    unread: recentMessages.length,
    emails: recentMessages.filter((m) => m.type === 'EMAIL_RECEIVED').length,
    sms: recentMessages.filter((m) => m.type === 'SMS_RECEIVED').length,
    forms: recentMessages.filter((m) => m.type === 'FORM_SUBMIT').length,
  }

  return (
    <section className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Inbox</h1>
          <p className="mt-1 text-muted-foreground">
            All your lead communications in one place
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unread}</div>
            <p className="text-xs text-muted-foreground">Recent activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emails}</div>
            <p className="text-xs text-muted-foreground">Received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sms}</div>
            <p className="text-xs text-muted-foreground">Text messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Form Submissions</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.forms}</div>
            <p className="text-xs text-muted-foreground">New leads</p>
          </CardContent>
        </Card>
      </div>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
          <CardDescription>
            Latest communications from your leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Inbox className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-semibold">No messages yet</h3>
              <p className="mb-4 max-w-sm text-muted-foreground">
                When leads submit forms or reply to your messages, they'll appear here.
              </p>
              <Link href="/templates/simple">
                <Button>View Lead Capture Templates</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentMessages.map((message) => (
                <div
                  key={message.id}
                  className="flex items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    {message.type === 'EMAIL_RECEIVED' && (
                      <Mail className="h-5 w-5 text-primary" />
                    )}
                    {message.type === 'SMS_RECEIVED' && (
                      <MessageSquare className="h-5 w-5 text-primary" />
                    )}
                    {message.type === 'FORM_SUBMIT' && (
                      <Bell className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {message.lead.name || message.lead.email || 'Unknown Lead'}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {message.content || 'No content'}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                        {message.type.replace('_', ' ')}
                      </span>
                      <Link
                        href={`/dashboard/leads`}
                        className="text-xs text-primary hover:underline"
                      >
                        View Lead →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
