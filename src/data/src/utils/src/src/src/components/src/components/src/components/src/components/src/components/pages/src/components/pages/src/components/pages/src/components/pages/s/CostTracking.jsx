import { useMemo } from 'react'
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import MetricCard from '../MetricCard.jsx'
import { DATASET, MODELS, MODEL_COLORS } from '../../data/dataset.js'
import { getCostByDate, getCostVsPerf, avg } from '../../utils/judgeLogic.js'

export default function CostTracking() {
  const costByDate = useMemo(() => getCostByDate(DATASET), [])
  const cvp        = useMemo(() => getCostVsPerf(DATASET), [])
  const totalCost  = DATASET.reduce((a, r) => a + r.cost, 0)

  return (
    <>
      <h1 className="page-title">Cost & efficiency tracking</h1>
      <p className="page-subtitle">Cost vs performance across models and over time.</p>

      <div className="flex-row mb-2">
        <MetricCard label="Total cost" value={'$' + totalCost.toFixed(3)} accent="var(--orange)" />
        {MODELS.map(m => (
          <MetricCard key={m} label={m} value={'$' + DATASET.filter(r => r.model === m).reduce((a, r) => a + r.cost, 0).toFixed(3)} />
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="chart-title">Cost over time</div>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={costByDate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={v => '$' + v.toFixed(4)} />
              <Line type="monotone" dataKey="cost" stroke="var(--orange)" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="chart-title">Total cost by model</div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={MODELS.map(m => ({ model: m, cost: +(DATASET.filter(r => r.model === m).reduce((a,r) => a+r.cost, 0)).toFixed(3) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="model" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={v => '$' + v} />
              <Bar dataKey="cost" radius={[4,4,0,0]}>
                {MODELS.map((m, i) => <Cell key={i} fill={MODEL_COLORS[m]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card grid-2--span">
          <div className="chart-title">Cost vs performance — value for money</div>
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="cost" name="Avg cost ($)" tick={{ fontSize: 10 }} label={{ value: 'Avg cost ($)', position: 'insideBottom', offset: -4, fontSize: 10 }} />
              <YAxis dataKey="score" name="Overall score" domain={[0.6, 0.95]} tick={{ fontSize: 10 }} label={{ value: 'Score', angle: -90, position: 'insideLeft', fontSize: 10 }} />
              <Tooltip formatter={(v, n) => [typeof v === 'number' ? v.toFixed(4) : v, n]} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              {cvp.map(m => <Scatter key={m.model} name={m.model} data={[m]} fill={MODEL_COLORS[m]} />)}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}
