import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { cancelBooking, getMyBooking } from '../../services/api'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

const statusMeta = {
  pending: { tone: 'amber', label: 'Pending Approval' },
  approved: { tone: 'green', label: 'Approved - Room Assigned!' },
  rejected: { tone: 'red', label: 'Rejected' },
  cancelled: { tone: 'slate', label: 'Cancelled' },
}

export default function MyBooking() {
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getMyBooking()
      setBooking(res.data.data || null)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load booking')
      setBooking(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onCancel = async () => {
    if (!booking?.booking_id) return
    if (!window.confirm('Cancel this pending booking?')) return

    try {
      await cancelBooking(booking.booking_id)
      await load()
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Failed to cancel booking')
    }
  }

  if (loading) return <LoadingSpinner label="Loading booking details..." />
  if (error) return <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>

  if (!booking) {
    return (
      <Card>
        <h2 className="text-xl font-bold text-slate-900">No booking found</h2>
        <p className="mt-2 text-sm text-slate-500">You have not booked a room yet.</p>
        <Button as={Link} to="/student/rooms" className="mt-4">Browse Rooms</Button>
      </Card>
    )
  }

  const status = statusMeta[booking.status] || statusMeta.cancelled

  return (
    <Card>
      <h2 className="text-xl font-extrabold text-slate-900">My Booking</h2>
      <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
        <p>Room No: <span className="font-semibold text-slate-900">{booking.Room_No}</span></p>
        <p>Room Type: <span className="font-semibold text-slate-900">{booking.room?.Room_Type || '-'}</span></p>
        <p>Floor: <span className="font-semibold text-slate-900">{booking.room?.Floor_no || '-'}</span></p>
        <p>Hostel: <span className="font-semibold text-slate-900">{booking.Hostel_name}</span></p>
        <p>Location: <span className="font-semibold text-slate-900">{booking.hostel?.Hostel_Location || '-'}</span></p>
        <p>Booked At: <span className="font-semibold text-slate-900">{booking.booked_at}</span></p>
      </div>

      <div className="mt-4">
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {booking.status === 'pending' ? (
          <Button variant="secondary" className="border border-rose-200 text-rose-600 hover:bg-rose-50" onClick={onCancel}>
            Cancel Booking
          </Button>
        ) : null}
        {booking.status === 'approved' ? (
          <Button as={Link} to="/student/payments">Proceed to Payment</Button>
        ) : null}
      </div>
    </Card>
  )
}
