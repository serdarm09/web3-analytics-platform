'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gradient' | 'glow' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

type CombinedProps = PremiumButtonProps & HTMLMotionProps<"button">

const PremiumButton = forwardRef<HTMLButtonElement, CombinedProps>(
  ({ className, variant = 'gradient', size = 'md', animate = true, children, ...props }, ref) => {
    const baseStyles = 'relative inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg'
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base'
    }
    
    const variants = {
      gradient: 'bg-gradient-primary hover:bg-gradient-secondary text-white shadow-2xl hover:shadow-accent-teal/20 transform hover:scale-105 active:scale-95 border border-white/10',
      glow: 'bg-black-tertiary text-white border border-gray-600 hover:border-accent-slate hover:shadow-lg hover:shadow-accent-slate/20 hover:bg-black-quaternary backdrop-blur-sm',
      outline: 'bg-transparent border-2 border-accent-slate text-accent-slate hover:bg-accent-slate hover:text-white transform hover:scale-105 backdrop-blur-sm',
      ghost: 'bg-transparent text-gray-300 hover:bg-black-tertiary hover:text-white transform hover:scale-105 backdrop-blur-sm'
    }
    
    const Component = animate ? motion.button : 'button'
    const animationProps = animate ? {
      whileHover: { scale: 1.02 },
      whileTap: { scale: 0.98 },
      transition: { type: "spring" as const, stiffness: 400, damping: 17 }
    } : {}
    
    return (
      <Component
        ref={ref}
        className={cn(
          baseStyles,
          sizes[size],
          variants[variant],
          className
        )}
        {...animationProps}
        {...props}
      >
        {variant === 'gradient' && (
          <div className="absolute inset-0 rounded-lg bg-gradient-primary opacity-0 hover:opacity-100 blur-xl transition-opacity duration-500" />
        )}
        <span className="relative z-10">{children}</span>
      </Component>
    )
  }
)

PremiumButton.displayName = 'PremiumButton'

export { PremiumButton }