import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { registerStudent } from '../services/api'

const EMAIL_PATTERN = /^[^\s@]+@apsit\.edu\.in$/

export default function Register() {
  const navigate = useNavigate()
  const auth = useAuth()

  const [Fname, setFname] = useState('')
  const [Minit, setMinit] = useState('')
  const [Lname, setLname] = useState('')
  const [GENDER, setGender] = useState('M')
  const [ADDRESS, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validateEmail = (value) => {
    if (!EMAIL_PATTERN.test(value)) {
      setEmailError('Only @apsit.edu.in emails are allowed')
      return false
    }
    setEmailError('')
    return true
  }

  const onSubmit = async (event) => {
    event.preventDefault()

    if (!validateEmail(email)) {
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await registerStudent({
        Fname,
        Minit: Minit || null,
        Lname,
        GENDER,
        ADDRESS,
        email,
        password,
      })
      const token = res.data.data?.access_token
      if (!token) throw new Error('Token missing in response')
      await auth.login(token)
      navigate('/student/dashboard')
    } catch (err) {
      const detail = err?.response?.data?.detail
      if (typeof detail === 'string') {
        setError(detail)
      } else if (detail?.message) {
        setError(detail.message)
      } else {
        setError(err?.response?.data?.message || 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-soft ring-1 ring-slate-200">
        <div className="mb-6 text-center">
          <h1 className="mt-2 text-3xl font-extrabold text-indigo-600">Student Registration</h1>
          <p className="mt-1 text-sm text-slate-500">Create your APSIT hostel portal account</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">First Name</span>
              <input
                type="text"
                value={Fname}
                onChange={(event) => setFname(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Middle Initial</span>
              <input
                type="text"
                value={Minit}
                onChange={(event) => setMinit(event.target.value.toUpperCase().slice(0, 1))}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
                maxLength={1}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Last Name</span>
              <input
                type="text"
                value={Lname}
                onChange={(event) => setLname(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Gender</span>
            <select
              value={GENDER}
              onChange={(event) => setGender(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
              required
            >
              <option value="M">M</option>
              <option value="F">F</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Address</span>
            <textarea
              value={ADDRESS}
              onChange={(event) => setAddress(event.target.value)}
              className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => validateEmail(email)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
              placeholder="student@apsit.edu.in"
              required
            />
            {emailError ? <p className="mt-1 text-xs text-red-600">{emailError}</p> : null}
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Password</span>
              <div className="mt-2 flex items-center rounded-xl border border-slate-200 px-3">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full py-2.5 text-sm outline-none"
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-slate-500">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Confirm Password</span>
              <div className="mt-2 flex items-center rounded-xl border border-slate-200 px-3">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full py-2.5 text-sm outline-none"
                  placeholder="Repeat password"
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} className="text-slate-500">
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account? <Link className="font-semibold text-indigo-600" to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
