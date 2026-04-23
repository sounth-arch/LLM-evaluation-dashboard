import { useMemo } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { DATASET, MODELS, TASKS, DIFFICULTIES, METRIC_KEYS, METRIC_LABELS } from '../../data/dataset.js'
import { applyFilters, getTaskData, getDiffData } from '../../utils/judgeLogic.js'

const TC = ['#7F77DD','#1D9E75','#D85A30','#BA7517']

export default function Breakdown({ filterModel, setFM, filterTask, setFT, filterDiff, setFD }) {
  const rows     = useMemo(() => applyFilters(DATASET, filterModel, filterTask, filterDiff), [filterModel, filterTask, filterDiff])
  const taskData = useMemo(() => getTaskData(rows), [rows])
  const diffData = useMemo(() => getDiffData(rows), [rows])

  return (
    <>
      <h1 className="page-title">Evaluation breakdown</h1>
      <p className="page-subtitle">Scores by task type, difficulty, and metric.</p>

      <div className="filters">
        {[['All',...MODELS], ['All',...TASKS], ['All',...DIFFICULTIES]].map((opts, i) => {
          const [v, fn] = [[filterModel,setFM],[filterTask,setFT],[filterDiff,setFD]][i]
          return <select key={i} value={v} onChange={e => fn(e.target.value)}>{opts.map(o=><option key={o}>{o}</option>)}</select>
        })}
      </div>

      <div className="grid-2 mb-2">
        <div className="card">
          <div className="chart-title">5 metrics by task type</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={taskData.map(t => ({ task: t.task, ...Object.fromEntries(METRIC_KEYS.map(k => [METRIC_LABELS[k], t[k]])) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="task" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} />
              <Tooltip formatter={v => v.toFixed(3)} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
              {Object.values(METRIC_LABELS).map((l, i) => <Bar key={l} dataKey={l} fill={TC[i % TC.length]} radius={[2,2,0,0]} />)}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="chart-title">Pass rate by difficulty</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={diffData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="difficulty" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="pass" name="Pass %" fill="#1D9E75" radius={[2,2,0,0]} />
              <Bar dataKey="avg"  name="Avg score %" fill="#7F77DD" radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="chart-title">Safety & tone distribution</div>
        <div style={{ display: 'flex', gap: 20 }}>
          {['safety_score','tone_score'].map(metric => {
            const bins = [
              { name: 'High (≥0.75)', value: rows.filter(r => r[metric] >= 0.75).length },
              { name: 'Mid (0.5–0.75)', value: rows.filter(r => r[metric] >= 0.5 && r[metric] < 0.75).length },
              { name: 'Low (<0.5)', value: rows.filter(r => r[metric] < 0.5).length },
            ]
            return (
              <div key={metric} style={{ flex: 1 }}>
                <div className="hint" style={{ textAlign: 'center', marginBottom: 4 }}>{METRIC_LABELS[metric]}</div>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={bins} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55}
                      label={({ name, percent }) => `${name.split(' ')[0]} ${(percent*100).toFixed(0)}%`}
                      labelLine={false} fontSize={10}>
                      {bins.map((_, i) => <Cell key={i} fill={['#1D9E75','#BA7517','#A32D2D'][i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
