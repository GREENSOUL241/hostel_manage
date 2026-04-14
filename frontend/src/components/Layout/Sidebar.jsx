import { BookOpen, Building2, LayoutDashboard, Users, BedDouble, CreditCard, ClipboardCheck } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/rooms', label: 'Rooms', icon: BedDouble },
  { to: '/hostels', label: 'Hostels', icon: Building2 },
  { to: '/wardens', label: 'Wardens', icon: BookOpen },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/bookings', label: 'Bookings', icon: ClipboardCheck },
]

export default function Sidebar() {
  const { admin, logout } = useAuth()

  return (
    <aside className="flex h-full w-full flex-col bg-slate-900 px-5 py-6 text-slate-100 lg:w-72">
      <div className="mb-8 rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Hostel Manager</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">Operations Hub</h1>
        <p className="mt-2 text-sm text-slate-300">Manage rooms, residents, wardens, and payments from one place.</p>
      </div>
      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${isActive ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
      <div className="mt-auto rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
        <p className="text-xs uppercase tracking-wide text-slate-400">Logged in as</p>
        <p className="mt-1 text-sm font-semibold text-white">{admin?.username || 'Admin'}</p>
        <button
          type="button"
          onClick={logout}
          className="mt-3 w-full rounded-xl bg-rose-500 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-600"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}
