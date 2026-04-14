import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login as loginRequest } from '../services/api'

export default function Login() {
  const [mode, setMode] = useState('admin')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const auth = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    const payload = mode === 'admin'
      ? { username, password }
      : { email, password }

    try {
      const res = await loginRequest(payload)
      const token = res.data.data?.access_token
      const role = res.data.data?.role
      if (!token) {
        throw new Error('Token missing in response')
      }

      const hydratedRole = await auth.login(token)
      const resolvedRole = role || hydratedRole
      if (resolvedRole === 'student') {
        navigate('/student/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F172A] px-4 py-8 font-sans">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-slate-100">
        <div className="mb-6 text-center">
          <h1 className="mt-2 text-2xl font-extrabold text-indigo-600">Hostel MS</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to continue</p>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode('admin')}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === 'admin' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'}`}
          >
            Admin Login
          </button>
          <button
            type="button"
            onClick={() => setMode('student')}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === 'student' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'}`}
          >
            Student Login
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === 'admin' ? (
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Username</span>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
                placeholder="admin"
                required
              />
            </label>
          ) : (
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
                placeholder="student@apsit.edu.in"
                required
              />
            </label>
          )}

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <div className="mt-2 flex items-center rounded-xl border border-slate-200 px-3">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full py-2.5 text-sm outline-none"
                placeholder="••••••••"
                required
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-slate-500">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          New student? <Link className="font-semibold text-indigo-600" to="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}