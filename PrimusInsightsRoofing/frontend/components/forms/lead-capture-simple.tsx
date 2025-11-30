'use client'

// PRIMUS HOME PRO - Template 1: Simple Hero Form
// High-conversion, single-field lead capture

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { leadCaptureSchema, type LeadCaptureFormData } from '@/lib/validations/lead'
import { createLead } from '@/lib/actions/create-lead'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, ArrowRight } from 'lucide-react'

interface LeadCaptureSimpleProps {
  headline?: string
  subheadline?: string
  source?: string
  ctaText?: string
}

export function LeadCaptureSimple({
  headline = 'Get Your Free Roofing Inspection',
  subheadline = 'Licensed professionals. Zero-pressure quote. 24-hour response.',
  source = 'LandingPage-Simple',
  ctaText = 'Get Started',
}: LeadCaptureSimpleProps) {
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadCaptureFormData>({
    resolver: zodResolver(leadCaptureSchema),
    defaultValues: {
      source,
    },
  })

  async function onSubmit(data: LeadCaptureFormData) {
    const result = await createLead(data)

    if (result.success) {
      setIsSuccess(true)
    } else {
      alert(result.error)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Thank You!</CardTitle>
            <CardDescription className="text-base">
              We've received your request. A member of our team will reach out within 24 hours to
              schedule your free inspection.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Check your email/phone for confirmation.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-4xl space-y-8 text-center">
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {headline}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {subheadline}
          </p>
        </div>

        {/* Lead Capture Form */}
        <Card className="mx-auto w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Start Your Free Inspection</CardTitle>
            <CardDescription>
              Enter your contact info and we'll get back to you within 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                {...register('name')}
                placeholder="Your Name"
                error={errors.name?.message}
              />

              <Input
                {...register('email')}
                type="email"
                placeholder="Email Address"
                error={errors.email?.message}
              />

              <Input
                {...register('phone')}
                type="tel"
                placeholder="Phone Number"
                error={errors.phone?.message}
              />

              <Input
                {...register('message')}
                placeholder="Tell us about your project (optional)"
              />

              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
              >
                {ctaText}
                <ArrowRight className="h-4 w-4" />
              </Button>

              <p className="text-xs text-muted-foreground">
                By submitting this form, you agree to receive text messages and emails from Primus
                Home Pro. Standard rates may apply.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Social Proof */}
        <div className="mx-auto max-w-2xl space-y-4">
          <p className="text-sm font-medium text-muted-foreground">Trusted by homeowners across the region</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50 grayscale">
            <div className="text-xs font-semibold">★★★★★ 4.9/5 on Google</div>
            <div className="text-xs font-semibold">500+ Projects Completed</div>
            <div className="text-xs font-semibold">Licensed & Insured</div>
          </div>
        </div>
      </div>
    </div>
  )
}
