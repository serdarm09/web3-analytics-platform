'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: ReactNode
  iconColor?: string
  delay?: number
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  iconColor = 'text-accent-blue',
  delay = 0
}: StatsCardProps) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="glassmorphism p-6 rounded-2xl"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white-secondary text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          
          {change !== undefined && (
            <div className="flex items-center mt-3 space-x-1">
              {isPositive && <TrendingUp className="w-4 h-4 text-accent-green" />}
              {isNegative && <TrendingDown className="w-4 h-4 text-accent-red" />}
              <span className={cn(
                "text-sm font-medium",
                isPositive && "text-accent-green",
                isNegative && "text-accent-red",
                !isPositive && !isNegative && "text-white-secondary"
              )}>
                {isPositive && '+'}
                {change}%
              </span>
              {changeLabel && (
                <span className="text-sm text-white-secondary">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        
        <div className={cn("p-3 rounded-xl bg-gray-secondary", iconColor)}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}