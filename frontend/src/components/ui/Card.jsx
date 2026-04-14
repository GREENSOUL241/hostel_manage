export default function Card({ children, className = '' }) {
  return <div className={`rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-100 ${className}`}>{children}</div>
}
