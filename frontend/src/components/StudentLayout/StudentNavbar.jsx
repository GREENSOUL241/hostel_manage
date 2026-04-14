import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/student/dashboard', label: 'Dashboard' },
  { to: '/student/rooms', label: 'Browse Rooms' },
  { to: '/student/booking', label: 'My Booking' },
  { to: '/student/payments', label: 'Payments' },
  { to: '/student/profile', label: 'Profile' },
]

export default function StudentNavbar() {
  const { student, logout } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600" />
          <span className="text-sm font-bold text-slate-900 md:text-base">APSIT Hostel</span>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <span className="text-sm font-medium text-slate-700">{student?.Fname || 'Student'}</span>
          <button type="button" onClick={logout} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Logout
          </button>
        </div>

        <button type="button" onClick={() => setOpen((value) => !value)} className="rounded-lg border border-slate-200 p-2 md:hidden">
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="grid gap-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
            <span className="text-sm font-medium text-slate-700">{student?.Fname || 'Student'}</span>
            <button type="button" onClick={logout} className="text-sm font-semibold text-rose-600">
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </header>
  )
}
