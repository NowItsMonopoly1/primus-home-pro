// PRIMUS HOME PRO - CRM Badge Components
// Atomic status indicators with consistent styling

import { cn } from '@/lib/utils/cn'

export function ScoreBadge({ score }: { score: number }) {
  const color =
    score > 70
      ? 'text-primary bg-primary/10 border-primary/20'
      : score > 40
        ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
        : 'text-muted-foreground bg-muted/10 border-muted/20'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        color
      )}
    >
      {score}
    </span>
  )
}

export function IntentBadge({ intent }: { intent: string }) {
  const isHot = ['Booking', 'Buying', 'Urgent'].includes(intent)

  return (
    <span
      className={cn(
        'text-xs font-medium',
        isHot ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      {intent}
    </span>
  )
}

export function StageBadge({ stage }: { stage: string }) {
  const colors: Record<string, string> = {
    New: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    Contacted: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    Qualified: 'bg-primary/10 text-primary border-primary/20',
    Closed: 'bg-green-500/10 text-green-500 border-green-500/20',
    Lost: 'bg-red-500/10 text-red-500 border-red-500/20',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium',
        colors[stage] || 'bg-muted text-muted-foreground border-border'
      )}
    >
      {stage}
    </span>
  )
}

export function SentimentBadge({ sentiment }: { sentiment: string }) {
  const colors: Record<string, string> = {
    Positive: 'text-green-500',
    Neutral: 'text-muted-foreground',
    Negative: 'text-red-500',
  }

  return (
    <span className={cn('text-xs font-medium', colors[sentiment] || 'text-muted-foreground')}>
      {sentiment}
    </span>
  )
}
