// PRIMUS HOME PRO - Button Component
// Reusable button primitive with variants

import * as React from 'react'
import { cn } from '@/lib/utils/cn'
import { Loader2 } from 'lucide-react'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'default'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', isLoading, children, disabled, asChild, ...props },
    ref
  ) => {
    const variants = {
      primary:
        'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
      default:
        'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline:
        'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
    }

    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-11 px-6 text-base',
      lg: 'h-12 px-8 text-lg',
    }

    const baseClasses = cn(
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      variants[variant],
      sizes[size],
      className
    )

    // If asChild, render children directly with classes
    if (asChild) {
      return React.cloneElement(children as React.ReactElement, {
        className: baseClasses,
        ref,
      })
    }

    return (
      <button
        ref={ref}
        className={baseClasses}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }
