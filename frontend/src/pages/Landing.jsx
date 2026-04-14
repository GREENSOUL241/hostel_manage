import { Link } from 'react-router-dom'

const features = [
  {
    title: 'Browse Rooms',
    description: 'Explore available rooms with smart filters and real-time availability updates.',
  },
  {
    title: 'Book Instantly',
    description: 'Submit booking requests in seconds and track approval status from your dashboard.',
  },
  {
    title: 'Pay Online',
    description: 'Complete hostel fee payments securely after your room booking gets approved.',
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <section className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200">APSIT Hostel Portal</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight md:text-5xl">Book your room, manage payments, all in one place</h1>
          <p className="mt-5 max-w-2xl text-sm text-slate-200 md:text-base">
            A unified hostel platform for students and administrators to manage registrations, room bookings, approvals, and payments.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600">
              Register as Student
            </Link>
            <Link to="/login" className="rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Admin Login
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-6 py-6 text-center text-sm text-slate-500">
        APSIT Institute of Engineering - Hostel Management Portal
      </footer>
    </div>
  )
}
