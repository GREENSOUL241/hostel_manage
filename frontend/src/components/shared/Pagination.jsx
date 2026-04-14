export default function Pagination({ page, pages, onPageChange }) {
  if (!pages || pages <= 1) return null

  const pageNumbers = Array.from({ length: pages }, (_, index) => index + 1)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-sm text-slate-600">
        Page <span className="font-semibold text-slate-900">{page}</span> of <span className="font-semibold text-slate-900">{pages}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {pageNumbers.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onPageChange(value)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${value === page ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  )
}
