'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface PremiumCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'gradient' | 'hover-lift' | 'default'
  padding?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

type CombinedProps = PremiumCardProps & HTMLMotionProps<"div">

const PremiumCard = forwardRef<HTMLDivElement, CombinedProps>(
  ({ className, variant = 'glass', padding = 'md', animate = true, children, ...props }, ref) => {
    const baseStyles = 'relative rounded-2xl transition-all duration-300'
    
    const paddings = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    }
    
    const variants = {
      glass: 'glassmorphism border border-white/10 hover:border-white/20 backdrop-blur-xl card-hover',
      gradient: 'bg-gradient-to-br from-black-secondary/80 to-black-tertiary/60 border border-gray-700 shadow-2xl glow-primary/20',
      'hover-lift': 'bg-black-secondary/90 border border-gray-700 hover:border-accent-purple/50 hover:glow-purple/30 card-hover backdrop-blur-sm',
      default: 'bg-black-secondary/80 border border-gray-700 backdrop-blur-sm'
    }
    
    const Component = animate ? motion.div : 'div'
    const animationProps = animate && variant === 'hover-lift' ? {
      whileHover: { y: -4 },
      transition: { type: "spring" as const, stiffness: 300, damping: 20 }
    } : {}
    
    return (
      <Component
        ref={ref}
        className={cn(
          baseStyles,
          paddings[padding],
          variants[variant],
          className
        )}
        {...animationProps}
        {...props}
      >
        {variant === 'gradient' && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-5" />
        )}
        <div className="relative z-10">{children}</div>
      </Component>
    )
  }
)

PremiumCard.displayName = 'PremiumCard'

export { PremiumCard }