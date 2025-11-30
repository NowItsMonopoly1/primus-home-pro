'use client'

// PRIMUS HOME PRO - Template 2: Scheduler with Urgency
// Countdown timer, calendar visual, high-ticket focus

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { leadCaptureSchema, type LeadCaptureFormData } from '@/lib/validations/lead'
import { createLead } from '@/lib/actions/create-lead'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Calendar, Clock, ArrowRight } from 'lucide-react'

interface LeadCaptureSchedulerProps {
  headline?: string
  offerEndsInMinutes?: number
}

export function LeadCaptureScheduler({
  headline = 'Book Your Strategy Call',
  offerEndsInMinutes = 240,
}: LeadCaptureSchedulerProps) {
  const [isSuccess, setIsSuccess] = useState(false)
  const [timeLeft, setTimeLeft] = useState(offerEndsInMinutes * 60)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LeadCaptureFormData>({
    resolver: zodResolver(leadCaptureSchema),
    defaultValues: { source: 'LandingPage-Scheduler' },
  })

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((prev) => Math.max(0, prev - 1)), 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = Math.floor(timeLeft / 3600)
  const minutes = Math.floor((timeLeft % 3600) / 60)
  const seconds = timeLeft % 60

  async function onSubmit(data: LeadCaptureFormData) {
    const result = await createLead(data)
    if (result.success) setIsSuccess(true)
    else alert(result.error)
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md text-center p-8">
          <CheckCircle2 className="mx-auto h-12 w-12 text-primary mb-4" />
          <h2 className="text-2xl font-bold">Spot Reserved!</h2>
          <p className="mt-2 text-muted-foreground">
            Check your email/SMS for the booking link.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Urgency Banner */}
      <div className="border-b bg-primary/10 py-2 text-center text-sm font-medium text-primary">
        ⏰ Limited Availability: Offer expires in{' '}
        <span className="font-mono font-bold">
          {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:
          {String(seconds).padStart(2, '0')}
        </span>
      </div>

      <div className="container mx-auto grid max-w-6xl gap-12 p-6 lg:grid-cols-2 lg:py-20">
        {/* Left: Value Prop */}
        <div className="flex flex-col justify-center space-y-8">
          <h1 className="text-4xl font-bold lg:text-5xl">{headline}</h1>
          <p className="text-lg text-muted-foreground">
            Get expert advice. No pressure. Book your 15-minute call today.
          </p>

          {/* Calendar Placeholder */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Next Available Slots</h3>
                  <p className="text-xs text-muted-foreground">Updated 5 mins ago</p>
                </div>
              </div>
              <div className="space-y-2">
                {['Tomorrow, 9:00 AM', 'Tomorrow, 2:00 PM', 'Friday, 10:00 AM'].map((slot, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border bg-card p-3"
                  >
                    <span className="text-sm">{slot}</span>
                    <span className="text-xs font-medium text-primary">OPEN</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Form */}
        <Card>
          <CardContent className="p-8">
            <div className="mb-6 flex items-center gap-2 text-sm text-primary">
              <Clock className="h-4 w-4" />
              <span>Fast-track booking enabled</span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input {...register('name')} placeholder="Your Name" error={errors.name?.message} />
              <Input {...register('phone')} type="tel" placeholder="Phone Number" error={errors.phone?.message} />
              <Input {...register('email')} type="email" placeholder="Email (optional)" />

              <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
                Reserve My Spot
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
