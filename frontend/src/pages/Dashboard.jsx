import { useEffect, useState } from 'react'
import { BedDouble, Building2, CreditCard, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getHostels, getPayments, getRooms, getStudents } from '../services/api'
import Topbar from '../components/Layout/Topbar'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/shared/LoadingSpinner'

const quickActions = [
  { to: '/students', label: 'Students' },
  { to: '/rooms', label: 'Rooms' },
  { to: '/hostels', label: 'Hostels' },
  { to: '/wardens', label: 'Wardens' },
  { to: '/payments', label: 'Payments' },
]

const iconMap = {
  students: Users,
  availableRooms: BedDouble,
  activeHostels: Building2,
  paymentsThisMonth: CreditCard,
}

export default function Dashboard() {
  const [students, setStudents] = useState([])
  const [rooms, setRooms] = useState([])
  const [hostels, setHostels] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [studentsRes, roomsRes, hostelsRes, paymentsRes] = await Promise.all([
          getStudents({ page: 1, limit: 1000 }),
          getRooms({ page: 1, limit: 1000 }),
          getHostels({ page: 1, limit: 1000 }),
          getPayments({ page: 1, limit: 1000 }),
        ])
        if (active) {
          setStudents(studentsRes.data.data || [])
          setRooms(roomsRes.data.data || [])
          setHostels(hostelsRes.data.data || [])
          setPayments(paymentsRes.data.data || [])
        }
      } catch (err) {
        if (active) {
          setError(err?.response?.data?.message || err.message || 'Failed to load dashboard')
          setStudents([])
          setRooms([])
          setHostels([])
          setPayments([])
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  if (loading) return <LoadingSpinner label="Loading dashboard..." />

  if (error) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
  }

  const totalStudents = students.length
  const availableRooms = rooms.filter((room) => !room.S_ID).length
  const activeHostels = hostels.length
  const totalPayments = payments.length
  const recentPayments = payments.slice(0, 5)

  const statCards = [
    { key: 'students', label: 'Total Students', value: totalStudents },
    { key: 'availableRooms', label: 'Available Rooms', value: availableRooms },
    { key: 'activeHostels', label: 'Active Hostels', value: activeHostels },
    { key: 'paymentsThisMonth', label: 'Total Payments', value: totalPayments },
  ]

  return (
    <div className="space-y-6">
      <Topbar title="Dashboard" subtitle="Overview of hostel operations, room occupancy, and the latest payment activity." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = iconMap[card.key]
          return (
            <Card key={card.key} className="relative overflow-hidden">
              <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-brand-50 blur-2xl" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">{card.value}</p>
                </div>
                <div className="rounded-2xl bg-brand-50 p-3 text-brand-600">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Payments</h3>
              <p className="text-sm text-slate-500">Last five records from the payments ledger.</p>
            </div>
            <Button variant="secondary" as={Link} to="/payments">
              View all
            </Button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {recentPayments.length ? (
                  recentPayments.map((payment) => (
                    <tr key={payment.Payment_ID} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{payment.student_name}</td>
                      <td className="px-4 py-3 text-slate-600">{payment.Paymentdate}</td>
                      <td className="px-4 py-3">
                        <Badge tone="indigo">{payment.Mode}</Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan="3">
                      No payment records available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
          <p className="mt-1 text-sm text-slate-500">Jump directly to the sections you manage most often.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {quickActions.map((item) => (
              <Button key={item.to} variant="secondary" as={Link} to={item.to} className="justify-start">
                {item.label}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
