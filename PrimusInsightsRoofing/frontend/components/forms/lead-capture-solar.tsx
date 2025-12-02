'use client'

// PRIMUS HOME PRO - Solar Lead Capture Form
// Captures address for Google Solar API site analysis

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { leadCaptureSchema, type LeadCaptureFormData } from '@/lib/validations/lead'
import { createLead } from '@/lib/actions/create-lead'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Sun, Zap, DollarSign, MapPin } from 'lucide-react'

interface LeadCaptureSolarProps {
  headline?: string
  subheadline?: string
  source?: string
  ctaText?: string
}

export function LeadCaptureSolar({
  headline = 'Get Your Free Solar Analysis',
  subheadline = 'See how much you could save with solar. Instant roof analysis powered by satellite imagery.',
  source = 'LandingPage-Solar',
  ctaText = 'Analyze My Roof',
}: LeadCaptureSolarProps) {
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-background p-6">
        <Card className="w-full max-w-md text-center border-yellow-200 shadow-xl">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500">
              <Sun className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Analyzing Your Roof!</CardTitle>
            <CardDescription className="text-base">
              Our AI is analyzing satellite imagery of your property to calculate your solar potential.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-500"></div>
              <span className="text-sm">Analysis in progress...</span>
            </div>
            <p className="text-sm text-muted-foreground">
              We'll contact you within 24 hours with your personalized solar report including savings
              estimates and system recommendations.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-background p-6">
      <div className="w-full max-w-4xl space-y-8 text-center">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 px-4 py-2 text-sm font-medium text-orange-800">
            <Sun className="h-4 w-4" />
            <span>Powered by Google Solar API</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            {headline}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{subheadline}</p>
        </div>

        {/* Benefits */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-yellow-200 bg-white/50">
            <CardContent className="flex flex-col items-center gap-2 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                <Zap className="h-5 w-5 text-yellow-600" />
              </div>
              <span className="font-medium">Instant Analysis</span>
              <span className="text-sm text-muted-foreground">AI-powered roof assessment</span>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-white/50">
            <CardContent className="flex flex-col items-center gap-2 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <span className="font-medium">See Savings</span>
              <span className="text-sm text-muted-foreground">Estimated yearly savings</span>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-white/50">
            <CardContent className="flex flex-col items-center gap-2 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <span className="font-medium">Panel Layout</span>
              <span className="text-sm text-muted-foreground">Custom design for your roof</span>
            </CardContent>
          </Card>
        </div>

        {/* Form Card */}
        <Card className="mx-auto max-w-md border-yellow-200 shadow-xl">
          <CardHeader>
            <CardTitle>Enter Your Address</CardTitle>
            <CardDescription>
              We'll analyze your roof using satellite imagery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Input
                  placeholder="Your full address (123 Main St, City, State)"
                  {...register('address')}
                  className="h-12"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Input
                    placeholder="Name"
                    {...register('name')}
                    className="h-10"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    {...register('email')}
                    className="h-10"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Input
                  type="tel"
                  placeholder="Phone (optional)"
                  {...register('phone')}
                  className="h-10"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <input type="hidden" {...register('source')} />

              <Button
                type="submit"
                className="h-12 w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-base font-semibold hover:from-yellow-600 hover:to-orange-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sun className="h-5 w-5" />
                    {ctaText}
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <span>✓ Free Analysis</span>
          <span>✓ No Credit Card Required</span>
          <span>✓ Licensed Installers</span>
          <span>✓ 25-Year Warranty</span>
        </div>
      </div>
    </div>
  )
}
