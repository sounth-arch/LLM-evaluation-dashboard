import { useState, useMemo } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Badge from '../Badge.jsx'
import ScoreBar from '../ScoreBar.jsx'
import { DATASET, MODELS, MODEL_COLORS, METRIC_KEYS, METRIC_LABELS } from '../../data/dataset.js'
import { avg, getModelStats, bestModel, getRadarData } from '../../utils/judgeLogic.js'

export default function ModelComparison() {
  const [cmpA, setCmpA] = useState('GPT-4')
  const [cmpB, setCmpB] = useState('Claude 3')

  const modelStats = useMemo(() => getModelStats(DATASET), [])
  const best       = useMemo(() => bestModel(modelStats), [modelStats])
  const radarData  = useMemo(() => getRadarData(DATASET, cmpA, cmpB), [cmpA, cmpB])
  const cmpData    = [cmpA, cmpB].map(m => {
    const r = DATASET.filter(x => x.model === m)
    const o = { model: m }
    METRIC_KEYS.forEach(k => { o[k] = +avg(r, k).toFixed(3) })
    o.overall  = +avg(r, 'overall_score').toFixed(3)
    o.latency  = +avg(r, 'latency_ms').toFixed(0)
    o.cost     = +avg(r, 'cost').toFixed(4)
    return o
  })

  return (
    <>
      <h1 className="page-title">Model comparison</h1>
      <p className="page-subtitle">Head-to-head comparison across all evaluation dimensions.</p>

      <div className="filters mb-2">
        <select value={cmpA} onChange={e => setCmpA(e.target.value)}>{MODELS.map(m => <option key={m}>{m}</option>)}</select>
        <span className="muted" style={{ alignSelf: 'center' }}>vs</span>
        <select value={cmpB} onChange={e => setCmpB(e.target.value)}>{MODELS.map(m => <option key={m}>{m}</option>)}</select>
      </div>

      <div className="flex-row mb-2">
        {cmpData.map(m => (
          <div key={m.model} className={`card${m.model === best.model ? ' card--highlighted' : ''}`} style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontWeight: 500 }}>{m.model}</span>
              {m.model === best.model && <Badge text="Best overall" color="blue" />}
            </div>
            {METRIC_KEYS.map(k => (
              <div key={k} style={{ marginBottom: 6 }}>
                <div className="hint mb-1">{METRIC_LABELS[k]}</div>
                <ScoreBar value={m[k]} />
              </div>
            ))}
            <hr className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span className="muted">Latency</span><span style={{ fontWeight: 500 }}>{m.latency}ms</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span className="muted">Avg cost</span><span style={{ fontWeight: 500 }}>${m.cost}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="chart-title">Radar: {cmpA} vs {cmpB}</div>
        <ResponsiveContainer width="100%" height={230}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
            {[cmpA, cmpB].map(m => <Radar key={m} name={m} dataKey={m} stroke={MODEL_COLORS[m]} fill={MODEL_COLORS[m]} fillOpacity={0.2} />)}
            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            <Tooltip formatter={v => v?.toFixed(3)} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}
