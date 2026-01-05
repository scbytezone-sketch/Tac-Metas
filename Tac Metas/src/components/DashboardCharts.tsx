import { useMemo, useRef, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ReferenceLine,
} from 'recharts'
import Card from './Card'
import type { Activity } from '../app/types'
import { getDailyCumulative, getServiceDistribution, getWeeklyPoints } from '../app/charts'

interface DashboardChartsProps {
  activities: Activity[]
  start: Date
  end: Date
  metaAjustada: number
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function DashboardCharts({
  activities,
  start,
  end,
  metaAjustada,
}: DashboardChartsProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  // Force removal of tabIndex to prevent focus
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.setAttribute('tabIndex', '-1')
      const focusableElements = chartRef.current.querySelectorAll('[tabIndex="0"]')
      focusableElements.forEach(el => el.setAttribute('tabIndex', '-1'))
    }
  }, [])

  const weeklyData = useMemo(
    () => getWeeklyPoints(start, end, activities),
    [start, end, activities]
  )

  const distributionData = useMemo(
    () => getServiceDistribution(activities),
    [activities]
  )

  const cumulativeData = useMemo(
    () => getDailyCumulative(start, end, activities),
    [start, end, activities]
  )

  const hasData = activities.length > 0

  if (!hasData) {
    return (
      <Card className="text-center py-8 text-slate-500 text-sm dark:text-slate-400">
        Sem dados para gráficos no período.
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {/* Chart A: Weekly Points */}
      <Card>
        <p className="text-sm font-semibold mb-4 text-slate-700 dark:text-slate-200">Pontos por Semana</p>
        <div 
          ref={chartRef}
          className="h-[180px] w-full text-xs chart-container chart-no-focus"
          style={{ 
            userSelect: 'none', 
            WebkitUserSelect: 'none', 
            WebkitTapHighlightColor: 'transparent', 
            touchAction: 'pan-y' 
          }}
          onPointerDownCapture={(e) => e.preventDefault()}
          onMouseDownCapture={(e) => e.preventDefault()}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={false}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Bar 
                dataKey="positive" 
                name="Positivos" 
                stackId="a" 
                fill="#22c55e" 
                radius={[4, 4, 4, 4]} 
                isAnimationActive={true}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Chart B: Service Distribution */}
      {distributionData.length > 0 && (
        <Card>
          <p className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">Distribuição de Serviços</p>
          <div 
            className="h-[180px] w-full flex items-center justify-center text-xs chart-container"
            style={{ 
              userSelect: 'none', 
              WebkitUserSelect: 'none', 
              WebkitTapHighlightColor: 'transparent', 
              touchAction: 'pan-y' 
            }}
            onPointerDown={(e) => e.preventDefault()}
            onMouseDown={(e) => e.preventDefault()}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={true}
                >
                  {distributionData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="ml-2 space-y-1 max-h-[160px] overflow-y-auto w-1/3">
              {distributionData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-[10px] text-slate-600 truncate dark:text-slate-400">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Chart C: Cumulative Progress */}
      <Card>
        <p className="text-sm font-semibold mb-4 text-slate-700 dark:text-slate-200">Progresso da Meta</p>
        <div 
          className="h-[180px] w-full text-xs chart-container"
          style={{ 
            userSelect: 'none', 
            WebkitUserSelect: 'none', 
            WebkitTapHighlightColor: 'transparent', 
            touchAction: 'pan-y' 
          }}
          onPointerDown={(e) => e.preventDefault()}
          onMouseDown={(e) => e.preventDefault()}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cumulativeData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ stroke: '#64748b', strokeWidth: 1, strokeDasharray: '3 3' }} />
              <ReferenceLine y={metaAjustada} stroke="#64748b" strokeDasharray="3 3" label={{ value: 'Meta', position: 'insideTopRight', fontSize: 10, fill: '#64748b' }} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
