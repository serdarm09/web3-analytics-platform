'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PremiumInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  error?: string
  label?: string
}

const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ className, icon: Icon, iconPosition = 'left', error, label, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-200 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon size={18} />
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full rounded-lg bg-black-tertiary/60 border border-gray-600',
              'px-4 py-3 text-white placeholder:text-gray-400',
              'focus:outline-none focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20',
              'transition-all duration-300 backdrop-blur-sm',
              'hover:border-gray-500 hover:bg-black-tertiary/80',
              'focus:glow-purple/30',
              Icon && iconPosition === 'left' && 'pl-11',
              Icon && iconPosition === 'right' && 'pr-11',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              className
            )}
            {...props}
          />
          {Icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon size={18} />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

PremiumInput.displayName = 'PremiumInput'

export { PremiumInput }