import { createContext, useContext, useEffect, useState } from 'react'
import { getMe, getStudentProfile } from '../services/api'

const AuthContext = createContext(null)

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join(''),
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [student, setStudent] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  const hydrateUser = async (token) => {
    const decoded = decodeJwt(token)
    if (!decoded?.role) {
      throw new Error('Invalid token payload')
    }

    setRole(decoded.role)
    if (decoded.role === 'admin') {
      const res = await getMe()
      setAdmin(res.data.data || null)
      setStudent(null)
      return 'admin'
    }

    if (decoded.role === 'student') {
      const res = await getStudentProfile()
      setStudent(res.data.data || null)
      setAdmin(null)
      return 'student'
    }

    throw new Error('Unsupported role')
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    hydrateUser(token)
      .catch(() => {
        localStorage.removeItem('token')
        setAdmin(null)
        setStudent(null)
        setRole(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (token) => {
    localStorage.setItem('token', token)
    return hydrateUser(token)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setAdmin(null)
    setStudent(null)
    setRole(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ admin, student, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
