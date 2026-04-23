import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Badge from '../Badge.jsx'
import { DATASET, METRIC_KEYS, METRIC_LABELS, PROMPT_TEXTS } from '../../data/dataset.js'
import { getPromptData } from '../../utils/judgeLogic.js'

const TC = ['#7F77DD','#1D9E75','#D85A30','#BA7517']

export default function Experiments() {
  const pvData = useMemo(() => getPromptData(DATASET), [])
  const bestPv = pvData.reduce((a, b) => b.overall > a.overall ? b : a, pvData[0])

  return (
    <>
      <h1 className="page-title">Prompt / experiment tracking</h1>
      <p className="page-subtitle">Compare prompt versions to find which system prompt drives the best results.</p>

      <div className="flex-row mb-2">
        {pvData.map(p => (
          <div key={p.version} className={`card${p.version === bestPv.version ? ' card--green' : ''}`} style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 500 }}>Prompt {p.version}</span>
              {p.version === bestPv.version && <Badge text="Best" color="green" />}
            </div>
            <div className="hint italic mb-1">"{PROMPT_TEXTS[p.version].slice(0, 55)}…"</div>
            {[['Overall score', (p.overall*100).toFixed(1)+'%'],['Pass rate', p.pass+'%'],['Count', p.count]].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:12, padding:'3px 0', borderBottom:'0.5px solid var(--color-border-light)' }}>
                <span className="muted">{k}</span><span style={{fontWeight:500}}>{v}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="chart-title">Overall score by prompt version</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={pvData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="version" tick={{ fontSize: 11 }} />
              <YAxis domain={[0.5, 1]} tick={{ fontSize: 10 }} />
              <Tooltip formatter={v => v.toFixed(3)} />
              <Bar dataKey="overall" fill="#7F77DD" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="chart-title">5-metric breakdown by prompt</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={pvData.map(p => {
              const rows = DATASET.filter(r => r.prompt_version === p.version)
              const o = { version: p.version }
              METRIC_KEYS.forEach(k => { o[METRIC_LABELS[k]] = rows.length ? +(rows.reduce((a,r)=>a+r[k],0)/rows.length).toFixed(3) : 0 })
              return o
            })}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="version" tick={{ fontSize: 11 }} />
              <YAxis domain={[0,1]} tick={{ fontSize: 10 }} />
              <Tooltip formatter={v => v.toFixed(3)} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
              {Object.values(METRIC_LABELS).map((l,i) => <Bar key={l} dataKey={l} fill={TC[i%TC.length]} radius={[2,2,0,0]} />)}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}
