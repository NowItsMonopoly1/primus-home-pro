'use client'

// PRIMUS HOME PRO - Template 3: Multi-Step Quiz Funnel
// Low friction, segmentation, high volume

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { leadCaptureSchema, type LeadCaptureFormData } from '@/lib/validations/lead'
import { createLead } from '@/lib/actions/create-lead'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, ChevronRight } from 'lucide-react'

export function LeadCaptureQuiz() {
  const [step, setStep] = useState(1)
  const [isSuccess, setIsSuccess] = useState(false)
  const [quizData, setQuizData] = useState<Record<string, string>>({})

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LeadCaptureFormData>({
    resolver: zodResolver(leadCaptureSchema),
    defaultValues: { source: 'LandingPage-Quiz' },
  })

  async function onSubmit(data: LeadCaptureFormData) {
    const result = await createLead({
      ...data,
      metadata: quizData,
    })

    if (result.success) setIsSuccess(true)
    else alert(result.error)
  }

  const handleQuizSelection = (key: string, value: string) => {
    setQuizData((prev) => ({ ...prev, [key]: value }))
    setStep(step + 1)
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md text-center p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Analyzing Your Needs...</h2>
          <p className="mt-2 text-muted-foreground">
            We're matching you with the best solution. Expect a message soon!
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      {/* Progress Bar */}
      <div className="mb-8 w-full max-w-md">
        <div className="mb-2 flex justify-between text-xs text-muted-foreground">
          <span>Step {step} of 3</span>
          <span>{Math.round((step / 3) * 100)}% Complete</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-center text-2xl font-bold">
                What service are you interested in?
              </h2>
              <div className="space-y-3">
                {['Roofing Repair', 'New Roof Installation', 'Solar Installation', 'Inspection Only'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleQuizSelection('serviceType', opt)}
                    className="flex w-full items-center justify-between rounded-lg border bg-card p-4 text-left hover:border-primary hover:bg-accent transition-colors"
                  >
                    <span className="font-medium">{opt}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-center text-2xl font-bold">
                What's your timeline?
              </h2>
              <div className="space-y-3">
                {['ASAP / Emergency', 'Within 30 days', '1-3 months', 'Just exploring'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleQuizSelection('timeline', opt)}
                    className="flex w-full items-center justify-between rounded-lg border bg-card p-4 text-left hover:border-primary hover:bg-accent transition-colors"
                  >
                    <span className="font-medium">{opt}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold">Last Step!</h2>
                <p className="text-sm text-muted-foreground">
                  Where should we send your personalized quote?
                </p>
              </div>

              <div className="space-y-3">
                <Input {...register('name')} placeholder="Your Name" error={errors.name?.message} />
                <Input {...register('email')} type="email" placeholder="Email Address" error={errors.email?.message} />
                <Input {...register('phone')} type="tel" placeholder="Phone Number" error={errors.phone?.message} />
              </div>

              <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
                Get My Free Quote
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                No spam. Your information is safe with us.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
