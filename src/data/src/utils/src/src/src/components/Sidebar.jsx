const NAV = ['Overview','Model Comparison','Breakdown','Failures','Experiments','Pairwise','Judge Panel','Cost Tracking']

export default function Sidebar({ nav, setNav }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">LLM-as-a-Judge</div>
      {NAV.map(n => (
        <div
          key={n}
          className={`sidebar__item${nav === n ? ' active' : ''}`}
          onClick={() => setNav(n)}
        >
          {n}
        </div>
      ))}
      <div className="sidebar__meta">
        80 evaluations<br />
        3 models · 4 tasks<br />
        3 prompt versions
      </div>
    </aside>
  )
}
