export default function MetricCard({ label, value, sub, accent }) {
  return (
    <div className="metric-card">
      <div className="metric-card__label">{label}</div>
      <div className="metric-card__value" style={accent ? { color: accent } : {}}>
        {value}
      </div>
      {sub && <div className="metric-card__sub">{sub}</div>}
    </div>
  )
}
