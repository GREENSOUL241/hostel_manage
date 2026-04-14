import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout/Layout'
import StudentLayout from './components/StudentLayout/StudentLayout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Rooms from './pages/Rooms'
import Hostels from './pages/Hostels'
import Wardens from './pages/Wardens'
import Payments from './pages/Payments'
import Bookings from './pages/Bookings'
import StudentDashboard from './pages/student/StudentDashboard'
import BrowseRooms from './pages/student/BrowseRooms'
import MyBooking from './pages/student/MyBooking'
import MyPayments from './pages/student/MyPayments'
import MyProfile from './pages/student/MyProfile'

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

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" replace />
  }

  const decoded = decodeJwt(token)
  if (!decoded?.role || decoded.role !== role) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={(
              <ProtectedRoute role="admin">
                <Layout />
              </ProtectedRoute>
            )}
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="hostels" element={<Hostels />} />
            <Route path="wardens" element={<Wardens />} />
            <Route path="payments" element={<Payments />} />
            <Route path="bookings" element={<Bookings />} />
          </Route>

          <Route
            path="/student"
            element={(
              <ProtectedRoute role="student">
                <StudentLayout />
              </ProtectedRoute>
            )}
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="rooms" element={<BrowseRooms />} />
            <Route path="booking" element={<MyBooking />} />
            <Route path="payments" element={<MyPayments />} />
            <Route path="profile" element={<MyProfile />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
