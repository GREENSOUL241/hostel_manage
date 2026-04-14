import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyBooking, getMyPayments, getStudentProfile } from '../../services/api'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

function statusTone(status) {
  if (status === 'approved') return 'green'
  if (status === 'pending') return 'amber'
  if (status === 'rejected') return 'red'
  return 'slate'
}

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null)
  const [booking, setBooking] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [profileRes, bookingRes, paymentsRes] = await Promise.all([
          getStudentProfile(),
          getMyBooking(),
          getMyPayments(),
        ])
        if (!active) return
        setProfile(profileRes.data.data || null)
        setBooking(bookingRes.data.data || null)
        setPayments(paymentsRes.data.data || [])
      } catch (err) {
        if (!active) return
        setError(err?.response?.data?.message || 'Failed to load dashboard')
        setProfile(null)
        setBooking(null)
        setPayments([])
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const myRoom = useMemo(() => {
    if (booking?.status === 'approved') return booking.Room_No
    if (profile?.Room_No) return profile.Room_No
    return null
  }, [booking, profile])

  if (loading) return <LoadingSpinner label="Loading student dashboard..." />
  if (error) return <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>

  const bookingStatus = booking?.status || 'none'

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-extrabold text-slate-900">Welcome back, {profile?.Fname || 'Student'}!</h2>
        <p className="mt-2 text-sm text-slate-500">Manage your booking, payment history, and profile details.</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm font-medium text-slate-500">My Room</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{myRoom || 'Not Assigned'}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-500">Booking Status</p>
          <div className="mt-2">
            <Badge tone={statusTone(bookingStatus)}>{bookingStatus}</Badge>
          </div>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-500">Payments Made</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{payments.length}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-500">Hostel</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{booking?.Hostel_name || '-'}</p>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Button as={Link} to="/student/rooms" className="justify-center">Browse Available Rooms</Button>
          <Button as={Link} to="/student/payments" variant="secondary" className="justify-center" disabled={booking?.status !== 'approved'}>
            Make Payment
          </Button>
          <Button as={Link} to="/student/booking" variant="secondary" className="justify-center">View Booking</Button>
        </div>
      </Card>
    </div>
  )
}
