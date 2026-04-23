import Badge from '../Badge.jsx'
import ScoreBar from '../ScoreBar.jsx'
import { DATASET, METRIC_KEYS, METRIC_LABELS } from '../../data/dataset.js'

export default function JudgePanel({ row, setRow }) {
  const modelBadgeColor = m => m === 'GPT-4' ? 'blue' : m === 'Claude 3' ? 'green' : 'amber'

  return (
    <>
      <h1 className="page-title">LLM judge explanation panel</h1>
      <p className="page-subtitle">Inspect how the judge scores and explains any individual evaluation.</p>

      <div className="filters mb-2">
        <span className="muted">Eval #</span>
        <select value={row.id} onChange={e => setRow(DATASET[+e.target.value - 1])}>
          {DATASET.map(r => <option key={r.id} value={r.id}>#{r.id} · {r.model} · {r.task}</option>)}
        </select>
      </div>

      <div className="grid-2 mb-2">
        {/* Left: I/O */}
        <div className="card">
          <div className="chart-title">Input / output</div>
          <div style={{ fontSize: 11, marginBottom: 6 }}>
            <span className="muted">Model: </span>
            <Badge text={row.model} color={modelBadgeColor(row.model)} />
            &nbsp;<Badge text={row.task} color="gray" />
            &nbsp;<Badge text={row.difficulty} color="gray" />
          </div>
          <div style={{ fontSize: 11, marginBottom: 4, fontWeight: 500 }}>System prompt used:</div>
          <div className="code-block mb-1 italic">"{row.prompt_text}"</div>
          <div style={{ fontSize: 11, marginBottom: 4, fontWeight: 500 }}>Input prompt:</div>
          <div className="code-block mb-1">{row.input_prompt}</div>
          <div style={{ fontSize: 11, marginBottom: 4, fontWeight: 500 }}>Expected output:</div>
          <div className="code-block mb-1" style={{ color: 'var(--green)' }}>{row.expected_output}</div>
          <div style={{ fontSize: 11, marginBottom: 4, fontWeight: 500 }}>Model output:</div>
          <div className="code-block" style={{ color: row.passed ? 'var(--green)' : 'var(--red)' }}>{row.model_output}</div>
        </div>

        {/* Right: Scores */}
        <div className="card">
          <div className="chart-title">Judge scores</div>
          {[['overall_score', 'Overall (mean of 5)'], ...METRIC_KEYS.map(k => [k, METRIC_LABELS[k]])].map(([k, l]) => (
            <div key={k} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                <span className="muted">{l}</span>
                <span style={{ fontWeight: 500 }}>{(row[k] * 10).toFixed(1)}/10</span>
              </div>
              <ScoreBar value={row[k]} />
            </div>
          ))}
        </div>
      </div>

      {/* Judge reasoning */}
      <div className="card card--accent-left mb-2">
        <div style={{ fontWeight: 500, marginBottom: 6 }}>Judge reasoning</div>
        <div style={{ fontSize: 13, lineHeight: 1.7 }}>{row.judge_explanation}</div>
        <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Badge text={row.passed ? 'PASS' : 'FAIL'} color={row.passed ? 'green' : 'red'} />
          {row.error_type && <Badge text={row.error_type} color="red" />}
          <Badge text={`Overall: ${(row.overall_score * 100).toFixed(1)}%`} color="blue" />
        </div>
      </div>

      {/* Score formula */}
      <div className="card">
        <div style={{ fontWeight: 500, marginBottom: 8 }}>How this score was calculated</div>
        <div className="code-block">
          Overall = mean(Factual, Helpfulness, Instruction, Tone, Safety)<br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= mean({METRIC_KEYS.map(k => row[k].toFixed(2)).join(', ')})<br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= <strong>{row.overall_score.toFixed(3)}</strong><br /><br />
          Thresholds: Pass ≥ 0.55 · High ≥ 0.75 · Low &lt; 0.50<br />
          Eval type: {row.expected_output ? 'Reference-based' : 'Single rating'} · Prompt: {row.prompt_version}
        </div>
      </div>
    </>
  )
}
