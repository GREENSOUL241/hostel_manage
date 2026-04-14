import { useEffect, useState } from 'react'
import { getMyBooking, getMyPayments, makePayment } from '../../services/api'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

const modes = ['Cash', 'UPI', 'Card', 'Bank Transfer']

export default function MyPayments() {
  const [payments, setPayments] = useState([])
  const [booking, setBooking] = useState(null)
  const [form, setForm] = useState({ Paymentdate: '', Mode: 'UPI' })
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [paymentsRes, bookingRes] = await Promise.all([
        getMyPayments(),
        getMyBooking(),
      ])
      setPayments(paymentsRes.data.data || [])
      setBooking(bookingRes.data.data || null)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load payments')
      setPayments([])
      setBooking(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const canPay = booking?.status === 'approved'

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!canPay) return

    setSubmitting(true)
    try {
      await makePayment(form)
      setForm({ Paymentdate: '', Mode: 'UPI' })
      await load()
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Payment failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner label="Loading payments..." />
  if (error) return <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm font-medium text-slate-500">Payments Made</p>
        <p className="mt-2 text-3xl font-extrabold text-slate-900">{payments.length}</p>
      </Card>

      <Card>
        <h2 className="text-xl font-extrabold text-slate-900">Payment History</h2>

        {!payments.length ? (
          <p className="mt-3 text-sm text-slate-500">No payments found.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Payment ID</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {payments.map((payment) => (
                  <tr key={payment.Payment_ID}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{payment.Payment_ID}</td>
                    <td className="px-4 py-3 text-slate-600">{payment.Paymentdate}</td>
                    <td className="px-4 py-3 text-slate-600">{payment.Mode}</td>
                    <td className="px-4 py-3 text-slate-600">Paid</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-xl font-extrabold text-slate-900">Add Payment</h2>
        {!canPay ? (
          <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
            You can only make payments after your room booking is approved by admin.
          </div>
        ) : (
          <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={onSubmit}>
            <input
              type="date"
              value={form.Paymentdate}
              onChange={(event) => setForm((prev) => ({ ...prev, Paymentdate: event.target.value }))}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              required
            />

            <select
              value={form.Mode}
              onChange={(event) => setForm((prev) => ({ ...prev, Mode: event.target.value }))}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              required
            >
              {modes.map((mode) => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>

            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Payment'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
