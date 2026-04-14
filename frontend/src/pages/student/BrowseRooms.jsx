import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookRoom, getAvailableRooms, getMyBooking } from '../../services/api'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

const roomTone = {
  Single: 'cyan',
  Double: 'indigo',
  Triple: 'amber',
}

export default function BrowseRooms() {
  const navigate = useNavigate()

  const [rooms, setRooms] = useState([])
  const [filters, setFilters] = useState({ hostel_name: '', room_type: '', floor_no: '' })
  const [activeBooking, setActiveBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        hostel_name: filters.hostel_name || undefined,
        room_type: filters.room_type || undefined,
        floor_no: filters.floor_no ? Number(filters.floor_no) : undefined,
      }
      const [roomsRes, bookingRes] = await Promise.all([
        getAvailableRooms(params),
        getMyBooking(),
      ])
      setRooms(roomsRes.data.data || [])
      setActiveBooking(bookingRes.data.data || null)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load available rooms')
      setRooms([])
      setActiveBooking(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const hostelOptions = useMemo(() => {
    const map = new Set(rooms.map((item) => item.Hostel_name).filter(Boolean))
    return Array.from(map)
  }, [rooms])

  const hasActiveBooking = activeBooking && ['pending', 'approved'].includes(activeBooking.status)

  const handleBook = async (room) => {
    if (!window.confirm(`Book Room ${room.Room_No} in ${room.Hostel_name || 'selected hostel'}?`)) {
      return
    }

    try {
      await bookRoom({ Room_No: room.Room_No, Hostel_name: room.Hostel_name })
      window.alert('Booking submitted! Awaiting admin approval.')
      navigate('/student/booking')
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Booking failed')
    }
  }

  const clearFilters = () => setFilters({ hostel_name: '', room_type: '', floor_no: '' })

  if (loading) return <LoadingSpinner label="Loading available rooms..." />

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-xl font-extrabold text-slate-900">Browse Available Rooms</h2>
        <p className="mt-1 text-sm text-slate-500">Filter rooms by hostel, room type, or floor.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <select
            value={filters.hostel_name}
            onChange={(event) => setFilters((prev) => ({ ...prev, hostel_name: event.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">All Hostels</option>
            {hostelOptions.map((hostel) => (
              <option key={hostel} value={hostel}>{hostel}</option>
            ))}
          </select>

          <select
            value={filters.room_type}
            onChange={(event) => setFilters((prev) => ({ ...prev, room_type: event.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">All Types</option>
            <option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="Triple">Triple</option>
          </select>

          <input
            type="number"
            min="0"
            value={filters.floor_no}
            onChange={(event) => setFilters((prev) => ({ ...prev, floor_no: event.target.value }))}
            placeholder="Floor No"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />

          <div className="flex gap-2">
            <Button onClick={load} className="flex-1">Apply</Button>
            <Button variant="secondary" onClick={clearFilters} className="flex-1">Clear</Button>
          </div>
        </div>
      </Card>

      {hasActiveBooking ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          You already have an active booking.
        </div>
      ) : null}

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      {!rooms.length ? (
        <Card>
          <p className="text-sm text-slate-500">No available rooms found for selected filters.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => (
            <Card key={room.Room_No}>
              <p className="text-xs uppercase tracking-wide text-slate-500">Room</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900">{room.Room_No}</p>

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>Floor: <span className="font-semibold text-slate-800">{room.Floor_no}</span></p>
                <p>Hostel: <span className="font-semibold text-slate-800">{room.Hostel_name || '-'}</span></p>
                <p>Location: <span className="font-semibold text-slate-800">{room.Hostel_Location || '-'}</span></p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Badge tone={roomTone[room.Room_Type] || 'slate'}>{room.Room_Type}</Badge>
                <Button disabled={Boolean(hasActiveBooking || !room.Hostel_name)} onClick={() => handleBook(room)}>
                  Book This Room
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
