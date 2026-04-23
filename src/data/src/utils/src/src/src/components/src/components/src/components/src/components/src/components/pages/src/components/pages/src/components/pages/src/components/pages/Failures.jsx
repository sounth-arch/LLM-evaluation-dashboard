import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import Badge from '../Badge.jsx'
import MetricCard from '../MetricCard.jsx'
import { DATASET } from '../../data/dataset.js'

const ERR_TYPES = ['All','Hallucination','Reasoning Error','Formatting Issue','Incomplete']
const PIE_C = ['#378ADD','#1D9E75','#D85A30','#7F77DD']

export default function Failures({ openJudge }) {
  const [errF, setErrF] = useState('All')
  const failures = useMemo(() =>
    DATASET.filter(r => !r.passed && (errF === 'All' || r.error_type === errF)), [errF])
  const errDist = ERR_TYPES.slice(1).map(e => ({ name: e, value: DATASET.filter(r => r.error_type === e).length }))

  return (
    <>
      <h1 className="page-title">Failure analysis</h1>
      <p className="page-subtitle">Failed evaluations with judge explanations. Click any row to open in Judge Panel.</p>

      <div className="grid-2 mb-2">
        <div className="card">
          <div className="chart-title">Error type distribution</div>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={errDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55}
                label={({ name, value }) => `${name.split(' ')[0]}: ${value}`} labelLine={false} fontSize={10}>
                {errDist.map((_, i) => <Cell key={i} fill={PIE_C[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="chart-title">Summary</div>
          <MetricCard label="Total failures" value={DATASET.filter(r=>!r.passed).length} accent="var(--red)" />
          <MetricCard label="Failure rate"   value={(DATASET.filter(r=>!r.passed).length/DATASET.length*100).toFixed(1)+'%'} />
        </div>
      </div>

      <div className="filters mb-1">
        <select value={errF} onChange={e => setErrF(e.target.value)}>
          {ERR_TYPES.map(e => <option key={e}>{e}</option>)}
        </select>
        <span className="hint" style={{ alignSelf: 'center' }}>{failures.length} rows</span>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>{['Model','Task','Prompt','Expected','Output','Error','Judge explanation'].map(h =>
              <th key={h}>{h}</th>
            )}</tr>
          </thead>
          <tbody>
            {failures.map(r => (
              <tr key={r.id} onClick={() => openJudge(r)}>
                <td><Badge text={r.model} color={r.model==='GPT-4'?'blue':r.model==='Claude 3'?'green':'amber'} /></td>
                <td>{r.task}</td>
                <td title={r.input_prompt}>{r.input_prompt}</td>
                <td title={r.expected_output}>{r.expected_output}</td>
                <td title={r.model_output}>{r.model_output}</td>
                <td><Badge text={r.error_type} color="red" /></td>
                <td title={r.judge_explanation}>{r.judge_explanation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
