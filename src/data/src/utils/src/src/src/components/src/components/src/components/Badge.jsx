export default function Badge({ text, color = 'gray' }) {
  return <span className={`badge badge--${color}`}>{text}</span>
}
