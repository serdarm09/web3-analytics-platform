'use client'

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { PremiumCard } from '@/components/ui/premium-card'

interface BarChartProps {
  data: any[]
  dataKey: string
  xDataKey?: string
  title?: string
  color?: string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  barSize?: number
}

export function BarChart({
  data,
  dataKey,
  xDataKey = 'name',
  title,
  color = '#8B5CF6',
  height = 300,
  showGrid = true,
  showLegend = false,
  barSize = 40
}: BarChartProps) {
  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toFixed(0)
  }

  const formatTooltipValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value)
  }

  return (
    <PremiumCard className="p-6">
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={1}/>
              <stop offset="100%" stopColor={color} stopOpacity={0.6}/>
            </linearGradient>
          </defs>
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255,255,255,0.1)" 
              vertical={false}
            />
          )}
          <XAxis 
            dataKey={xDataKey}
            stroke="rgba(255,255,255,0.5)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.5)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatValue}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0,0,0,0.8)', 
              border: '1px solid rgba(139,92,246,0.3)',
              borderRadius: '8px',
              backdropFilter: 'blur(4px)'
            }}
            labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
            formatter={(value: number) => formatTooltipValue(value)}
            cursor={{ fill: 'rgba(139,92,246,0.1)' }}
          />
          {showLegend && <Legend />}
          <Bar 
            dataKey={dataKey} 
            fill="url(#barGradient)"
            radius={[8, 8, 0, 0]}
            maxBarSize={barSize}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </PremiumCard>
  )
}