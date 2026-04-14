export default function Topbar({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-soft ring-1 ring-slate-100 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">Hostel Management System</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-2 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  )
}
