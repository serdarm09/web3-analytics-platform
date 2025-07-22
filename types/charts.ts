// Chart Types

export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: string | number
}

export interface TooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
    dataKey: string
    payload: ChartDataPoint
  }>
  label?: string
}

export interface CustomLabelProps {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
  index: number
}