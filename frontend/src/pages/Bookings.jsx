import { useEffect, useState } from 'react'
import { approveBooking, getAllBookings, rejectBooking } from '../services/api'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Topbar from '../components/Layout/Topbar'
import LoadingSpinner from '../components/shared/LoadingSpinner'

const filters = ['all', 'pending', 'approved', 'rejected']

function statusTone(status) {
  if (status === 'pending') return 'amber'
  if (status === 'approved') return 'green'
  if (status === 'rejected') return 'red'
  return 'slate'
}

export default function Bookings() {
  const [list, setList] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async (selected = filter) => {
    setLoading(true)
    setError('')
    try {
      const params = selected === 'all' ? undefined : { status: selected }
      const res = await getAllBookings(params)
      setList(res.data.data || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load bookings')
      setList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load('all')
  }, [])

  const onApprove = async (id) => {
    try {
      await approveBooking(id)
      window.alert('Booking approved. Room assigned to student.')
      await load()
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Approval failed')
    }
  }

  const onReject = async (id) => {
    try {
      await rejectBooking(id)
      window.alert('Booking rejected.')
      await load()
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Rejection failed')
    }
  }

  if (loading) return <LoadingSpinner label="Loading bookings..." />

  return (
    <div className="space-y-6">
      <Topbar title="Bookings" subtitle="Review and process student room booking requests." />

      <Card>
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.map((item) => (
            <Button
              key={item}
              variant={filter === item ? 'primary' : 'secondary'}
              onClick={async () => {
                setFilter(item)
                await load(item)
              }}
            >
              {item[0].toUpperCase() + item.slice(1)}
            </Button>
          ))}
        </div>

        {error ? <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        {!list.length ? (
          <p className="text-sm text-slate-500">No bookings available for this filter.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Booking ID</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Room No</th>
                  <th className="px-4 py-3">Hostel</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Booked At</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {list.map((row) => (
                  <tr key={row.booking_id}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{row.booking_id}</td>
                    <td className="px-4 py-3 text-slate-700">{row.student_name || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{row.Room_No}</td>
                    <td className="px-4 py-3 text-slate-700">{row.Hostel_name}</td>
                    <td className="px-4 py-3"><Badge tone={statusTone(row.status)}>{row.status}</Badge></td>
                    <td className="px-4 py-3 text-slate-600">{row.booked_at}</td>
                    <td className="px-4 py-3">
                      {row.status === 'pending' ? (
                        <div className="flex gap-2">
                          <Button className="px-3 py-1.5 text-xs" onClick={() => onApprove(row.booking_id)}>Approve</Button>
                          <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => onReject(row.booking_id)}>Reject</Button>
                        </div>
                      ) : (
                        <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
