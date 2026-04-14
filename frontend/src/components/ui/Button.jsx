export default function Button({ children, variant = 'primary', className = '', type = 'button', as: Component = 'button', ...props }) {
  const variants = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
    danger: 'bg-rose-500 text-white hover:bg-rose-600',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  }

  const componentProps = Component === 'button' ? { type } : {}

  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${variants[variant]} ${className}`}
      {...componentProps}
      {...props}
    >
      {children}
    </Component>
  )
}
