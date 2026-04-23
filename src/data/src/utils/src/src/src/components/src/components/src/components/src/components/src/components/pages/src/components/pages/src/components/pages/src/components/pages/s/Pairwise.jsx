import { useState } from 'react'
import Badge from '../Badge.jsx'
import ScoreBar from '../ScoreBar.jsx'
import { DATASET, METRIC_KEYS, METRIC_LABELS } from '../../data/dataset.js'

export default function Pairwise() {
  const [idA, setIdA] = useState(1)
  const [idB, setIdB] = useState(2)
  const rowA = DATASET[(idA - 1) % DATASET.length]
  const rowB = DATASET[(idB - 1) % DATASET.length]
  const winner = rowA.overall_score >= rowB.overall_score ? 'A' : 'B'
  const winRow = winner === 'A' ? rowA : rowB

  const modelBadgeColor = m => m === 'GPT-4' ? 'blue' : m === 'Claude 3' ? 'green' : 'amber'

  return (
    <>
      <h1 className="page-title">Pairwise comparison</h1>
      <p className="page-subtitle">The LLM judge compares two outputs and selects the preferred response.</p>

      <div className="filters mb-2">
        {[['Response A', idA, setIdA], ['Response B', idB, setIdB]].map(([label, val, fn]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="muted">{label} (#)</span>
            <input type="number" min={1} max={80} value={val} onChange={e => fn(Math.max(1, Math.min(80, +e.target.value)))} style={{ width: 60 }} />
          </div>
        ))}
      </div>

      <div className="grid-2 mb-2">
        {[{ row: rowA, label: 'A' }, { row: rowB, label: 'B' }].map(({ row, label }) => (
          <div key={label} className={`card${winner === label ? ' card--green' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 500 }}>Response {label}</span>
              {winner === label && <Badge text="Judge prefers" color="green" />}
            </div>
            <div style={{ fontSize: 11, marginBottom: 6 }}>
              <span className="muted">Model: </span>
              <Badge text={row.model} color={modelBadgeColor(row.model)} />
              &nbsp;<Badge text={row.task} color="gray" />
              &nbsp;<Badge text={row.difficulty} color="gray" />
            </div>
            <div style={{ fontSize: 11, padding: '6px 8px', background: 'var(--color-bg-secondary)', borderRadius: 4, marginBottom: 6 }}>
              <span className="muted">Prompt: </span>{row.input_prompt}
            </div>
            <div style={{ fontSize: 11, padding: '6px 8px', background: 'var(--color-bg-secondary)', borderRadius: 4, marginBottom: 8 }}>
              <span className="muted">Output: </span>{row.model_output}
            </div>
            {METRIC_KEYS.map(k => (
              <div key={k} style={{ marginBottom: 5 }}>
                <div className="hint mb-1">{METRIC_LABELS[k]}</div>
                <ScoreBar value={row[k]} />
              </div>
            ))}
            <hr className="divider" />
            <div style={{ fontSize: 12 }}>Overall: <strong>{(row.overall_score * 100).toFixed(1)}%</strong></div>
          </div>
        ))}
      </div>

      <div className="card card--accent-green">
        <div style={{ fontWeight: 500, marginBottom: 4 }}>Judge verdict</div>
        <div style={{ fontSize: 12 }}>
          Response <strong>{winner}</strong> ({winRow.model}) is preferred with score <strong>{(winRow.overall_score*100).toFixed(1)}%</strong>.
        </div>
        <div className="muted mt-1" style={{ fontSize: 11 }}>{winRow.judge_explanation}</div>
      </div>
    </>
  )
}
