import { useMemo } from 'react'
import { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import MetricCard from '../MetricCard.jsx'
import { DATASET, MODELS, TASKS, DIFFICULTIES, MODEL_COLORS, METRIC_KEYS, METRIC_LABELS } from '../../data/dataset.js'
import { applyFilters, avg, getModelStats, getTrendData } from '../../utils/judgeLogic.js'

const TC = ['#7F77DD','#1D9E75','#D85A30','#BA7517']

export default function Overview({ filterModel, setFM, filterTask, setFT, filterDiff, setFD }) {
  const rows = useMemo(() => applyFilters(DATASET, filterModel, filterTask, filterDiff), [filterModel, filterTask, filterDiff])
  const modelStats = useMemo(() => getModelStats(rows), [rows])
  const trendData  = useMemo(() => getTrendData(rows), [rows])

  const radarData = METRIC_KEYS.map(k => {
    const o = { metric: METRIC_LABELS[k] }
    MODELS.forEach(m => { const r = rows.filter(x => x.model === m); o[m] = r.length ? +avg(r, k).toFixed(3) : 0 })
    return o
  })

  return (
    <>
      <h1 className="page-title">Overview</h1>
      <p className="page-subtitle">Aggregate evaluation results across all models, tasks, and prompt versions.</p>

      {/* Filters */}
      <div className="filters">
        {[['Model', ['All',...MODELS], filterModel, setFM],
          ['Task',  ['All',...TASKS],  filterTask,  setFT],
          ['Difficulty', ['All',...DIFFICULTIES], filterDiff, setFD]
        ].map(([, opts, v, fn]) => (
          <select key={opts[0]} value={v} onChange={e => fn(e.target.value)}>
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
      </div>

      {/* KPI row */}
      <div className="flex-row mb-2">
        <MetricCard label="Avg overall score" value={(avg(rows,'overall_score')*100).toFixed(1)+'%'} accent="var(--blue)" sub={`${rows.length} evals`} />
        <MetricCard label="Pass rate"    value={(rows.filter(r=>r.passed).length/rows.length*100).toFixed(1)+'%'} accent="var(--green)" />
        <MetricCard label="Avg latency"  value={Math.round(avg(rows,'latency_ms'))+'ms'} />
        <MetricCard label="Avg factual"  value={(avg(rows,'factual_score')*100).toFixed(1)+'%'} accent="var(--purple)" />
        <MetricCard label="Avg safety"   value={(avg(rows,'safety_score')*100).toFixed(1)+'%'} accent="var(--green)" />
      </div>

      {/* Charts row */}
      <div className="grid-2 mb-2">
        <div className="card">
          <div className="chart-title">Score trend by model</div>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={[0.4, 1]} tick={{ fontSize: 10 }} />
              <Tooltip formatter={v => v?.toFixed(3)} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              {MODELS.map(m => <Line key={m} type="monotone" dataKey={m} stroke={MODEL_COLORS[m]} dot={false} strokeWidth={2} />)}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="chart-title">Multi-metric radar by model</div>
          <ResponsiveContainer width="100%" height={190}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
              {MODELS.map(m => <Radar key={m} name={m} dataKey={m} stroke={MODEL_COLORS[m]} fill={MODEL_COLORS[m]} fillOpacity={0.15} />)}
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Tooltip formatter={v => v?.toFixed(3)} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* All 5 metrics per model */}
      <div className="card">
        <div className="chart-title">All 5 metrics by model</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={modelStats.map(m => ({ ...m, ...Object.fromEntries(METRIC_KEYS.map(k => [METRIC_LABELS[k], m[k]])) }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="model" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} />
            <Tooltip formatter={v => v.toFixed(3)} />
            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            {Object.entries(METRIC_LABELS).map(([, l], i) => <Bar key={l} dataKey={l} fill={TC[i % TC.length]} radius={[2, 2, 0, 0]} />)}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}
