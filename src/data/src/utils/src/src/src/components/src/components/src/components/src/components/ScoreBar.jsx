import { scoreFillClass } from '../utils/judgeLogic.js'

export default function ScoreBar({ value }) {
  return (
    <div className="score-bar">
      <div className="score-bar__track">
        <div
          className={`score-bar__fill ${scoreFillClass(value)}`}
          style={{ width: `${(value * 100).toFixed(0)}%` }}
        />
      </div>
      <span className="score-bar__label">{(value * 100).toFixed(0)}%</span>
    </div>
  )
}
