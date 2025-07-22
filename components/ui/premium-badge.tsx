'use client'

import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface PremiumBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default' | 'outline' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
}

export function PremiumBadge({ 
  className, 
  variant = 'default', 
  size = 'md', 
  pulse = false,
  children,
  ...props 
}: PremiumBadgeProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full'
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }
  
  const variants = {
    success: 'bg-green-500/20 text-green-400 border border-green-500/30 backdrop-blur-sm',
    warning: 'bg-orange-500/20 text-orange-400 border border-orange-500/30 backdrop-blur-sm',
    error: 'bg-red-500/20 text-red-400 border border-red-500/30 backdrop-blur-sm',
    info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30 backdrop-blur-sm',
    default: 'bg-black-tertiary/80 text-white border border-gray-600 backdrop-blur-sm',
    outline: 'bg-transparent text-accent-purple border border-accent-purple/50 backdrop-blur-sm hover:bg-accent-purple/10',
    gradient: 'bg-gradient-primary text-white border border-white/10 backdrop-blur-sm glow-primary/30'
  }
  
  return (
    <span className="relative inline-flex">
      <span
        className={cn(
          baseStyles,
          sizes[size],
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
      {pulse && (
        <span className={cn(
          "absolute inset-0 rounded-full animate-ping",
          variant === 'success' && 'bg-accent-green/20',
          variant === 'warning' && 'bg-accent-orange/20',
          variant === 'error' && 'bg-accent-red/20',
          variant === 'info' && 'bg-accent-blue/20',
          variant === 'default' && 'bg-gray-secondary/20'
        )} />
      )}
    </span>
  )
}