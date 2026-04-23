import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Overview       from './components/pages/Overview.jsx'
import ModelComparison from './components/pages/ModelComparison.jsx'
import Breakdown      from './components/pages/Breakdown.jsx'
import Failures       from './components/pages/Failures.jsx'
import Experiments    from './components/pages/Experiments.jsx'
import Pairwise       from './components/pages/Pairwise.jsx'
import JudgePanel     from './components/pages/JudgePanel.jsx'
import CostTracking   from './components/pages/CostTracking.jsx'
import { DATASET }    from './data/dataset.js'

export default function App() {
  const [nav, setNav]           = useState('Overview')
  const [filterModel, setFM]    = useState('All')
  const [filterTask, setFT]     = useState('All')
  const [filterDiff, setFD]     = useState('All')
  const [judgeRow, setJudgeRow] = useState(DATASET[0])

  const openJudge = row => { setJudgeRow(row); setNav('Judge Panel') }

  const pages = {
    'Overview':         <Overview       filterModel={filterModel} setFM={setFM} filterTask={filterTask} setFT={setFT} filterDiff={filterDiff} setFD={setFD} />,
    'Model Comparison': <ModelComparison />,
    'Breakdown':        <Breakdown       filterModel={filterModel} setFM={setFM} filterTask={filterTask} setFT={setFT} filterDiff={filterDiff} setFD={setFD} />,
    'Failures':         <Failures        openJudge={openJudge} />,
    'Experiments':      <Experiments />,
    'Pairwise':         <Pairwise />,
    'Judge Panel':      <JudgePanel      row={judgeRow} setRow={setJudgeRow} />,
    'Cost Tracking':    <CostTracking />,
  }

  return (
    <div className="app-shell">
      <Sidebar nav={nav} setNav={setNav} />
      <main className="main-content">{pages[nav]}</main>
    </div>
  )
}
