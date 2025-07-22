'use client'

import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { PremiumCard } from '@/components/ui/premium-card'

interface AreaChartProps {
  data: any[]
  dataKey: string
  xDataKey?: string
  title?: string
  color?: string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  gradientId?: string
}

export function AreaChart({
  data,
  dataKey,
  xDataKey = 'name',
  title,
  color = '#8B5CF6',
  height = 300,
  showGrid = true,
  showLegend = false,
  gradientId = 'areaGradient'
}: AreaChartProps) {
  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

  const formatTooltipValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  return (
    <PremiumCard className="p-6">
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
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
          />
          {showLegend && <Legend />}
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </PremiumCard>
  )
}