'use client'

import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { PremiumCard } from '@/components/ui/premium-card'
import { TooltipProps, CustomLabelProps } from '@/types/charts'

interface PieChartProps {
  data: Array<{
    name: string
    value: number
    color?: string
  }>
  title?: string
  height?: number
  showLegend?: boolean
  innerRadius?: number
  outerRadius?: number
}

const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#6366F1', '#14B8A6']

export function PieChart({
  data,
  title,
  height = 300,
  showLegend = true,
  innerRadius = 0,
  outerRadius = 80
}: PieChartProps) {
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatPercent = (value: number, total: number) => {
    const percent = (value / total) * 100
    return `${percent.toFixed(1)}%`
  }

  const total = data.reduce((sum, entry) => sum + entry.value, 0)

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-black/80 border border-purple-500/30 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-purple-400">
            Value: {formatValue(data.value)}
          </p>
          <p className="text-purple-400">
            Percent: {formatPercent(data.value, total)}
          </p>
        </div>
      )
    }
    return null
  }

  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: CustomLabelProps) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    if (percent < 0.05) return null

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="font-medium text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <PremiumCard className="p-6">
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              formatter={(value) => <span className="text-gray-300">{value}</span>}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </PremiumCard>
  )
}