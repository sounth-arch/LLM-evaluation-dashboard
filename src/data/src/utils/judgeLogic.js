// ─────────────────────────────────────────────────────────────────────────────
// Judge logic helpers — scoring, aggregation, filtering
// ─────────────────────────────────────────────────────────────────────────────

import { MODELS, TASKS, DIFFICULTIES, PROMPT_VERS, METRIC_KEYS } from '../data/dataset.js'

/** Average a numeric field across rows */
export const avg = (rows, key) =>
  rows.reduce((a, r) => a + r[key], 0) / rows.length

/** Score tier label */
export const scoreTier = score =>
  score >= 0.75 ? 'high' : score >= 0.55 ? 'mid' : 'low'

/** CSS class for score bar fill */
export const scoreFillClass = score =>
  score >= 0.75 ? 'score-bar__fill--high'
  : score >= 0.55 ? 'score-bar__fill--mid'
  : 'score-bar__fill--low'

/** Filter dataset by sidebar dropdowns */
export const applyFilters = (rows, model, task, difficulty) =>
  rows.filter(r =>
    (model === 'All' || r.model === model) &&
    (task === 'All' || r.task === task) &&
    (difficulty === 'All' || r.difficulty === difficulty)
  )

/** Model aggregate stats */
export const getModelStats = rows =>
  MODELS.map(m => {
    const r = rows.filter(x => x.model === m)
    if (!r.length) return null
    const o = { model: m, count: r.length }
    METRIC_KEYS.forEach(k => { o[k] = +avg(r, k).toFixed(3) })
    o.overall  = +avg(r, 'overall_score').toFixed(3)
    o.latency  = +avg(r, 'latency_ms').toFixed(0)
    o.cost     = +avg(r, 'cost').toFixed(4)
    o.pass     = +(r.filter(x => x.passed).length / r.length * 100).toFixed(1)
    return o
  }).filter(Boolean)

/** Best model by overall score */
export const bestModel = stats =>
  stats.reduce((a, b) => b.overall > a.overall ? b : a, stats[0] || { model: '' })

/** Score trend by date (per model) */
export const getTrendData = (rows) => {
  const days = {}
  rows.forEach(r => {
    if (!days[r.timestamp])
      days[r.timestamp] = {
        date: r.timestamp,
        ...Object.fromEntries(MODELS.map(m => [m, { t: 0, n: 0 }]))
      }
    days[r.timestamp][r.model].t += r.overall_score
    days[r.timestamp][r.model].n++
  })
  return Object.values(days)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(d => {
      const o = { date: d.date.slice(5) }
      MODELS.forEach(m => { o[m] = d[m].n ? +( d[m].t / d[m].n).toFixed(3) : null })
      return o
    })
}

/** Per-task multi-metric data */
export const getTaskData = rows =>
  TASKS.map(t => {
    const r = rows.filter(x => x.task === t)
    const o = { task: t }
    METRIC_KEYS.forEach(k => { o[k] = r.length ? +avg(r, k).toFixed(3) : 0 })
    return o
  })

/** Per-difficulty pass rate */
export const getDiffData = rows =>
  DIFFICULTIES.map(d => {
    const r = rows.filter(x => x.difficulty === d)
    return {
      difficulty: d,
      pass: r.length ? +(r.filter(x => x.passed).length / r.length * 100).toFixed(1) : 0,
      avg:  r.length ? +(avg(r, 'overall_score') * 100).toFixed(1) : 0,
    }
  })

/** Prompt version stats */
export const getPromptData = rows =>
  PROMPT_VERS.map(p => {
    const r = rows.filter(x => x.prompt_version === p)
    return {
      version: p,
      overall: r.length ? +avg(r, 'overall_score').toFixed(3) : 0,
      pass:    r.length ? +(r.filter(x => x.passed).length / r.length * 100).toFixed(1) : 0,
      count:   r.length,
    }
  })

/** Cost-over-time for line chart */
export const getCostByDate = rows => {
  const days = {}
  rows.forEach(r => {
    if (!days[r.timestamp]) days[r.timestamp] = { date: r.timestamp, cost: 0 }
    days[r.timestamp].cost += r.cost
  })
  return Object.values(days)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(d => ({ date: d.date.slice(5), cost: +d.cost.toFixed(4) }))
}

/** Cost vs performance per model */
export const getCostVsPerf = rows =>
  MODELS.map(m => {
    const r = rows.filter(x => x.model === m)
    return {
      model: m,
      cost:  +(avg(r, 'cost')).toFixed(4),
      score: +(avg(r, 'overall_score')).toFixed(3),
    }
  })

/** Radar data (per-metric averages across two models) */
export const getRadarData = (rows, modelA, modelB) => {
  const get = m => {
    const r = rows.filter(x => x.model === m)
    return r.length ? avg(r, 'overall_score') : 0
  }
  return METRIC_KEYS.map(k => {
    const ra = rows.filter(x => x.model === modelA)
    const rb = rows.filter(x => x.model === modelB)
    return {
      metric: k.replace('_score', '').replace('helpfulness', 'helpful').replace('instruction', 'instruct'),
      [modelA]: ra.length ? +avg(ra, k).toFixed(3) : 0,
      [modelB]: rb.length ? +avg(rb, k).toFixed(3) : 0,
    }
  })
}
