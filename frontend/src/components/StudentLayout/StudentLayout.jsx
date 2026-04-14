import { Outlet } from 'react-router-dom'
import StudentNavbar from './StudentNavbar'

export default function StudentLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <StudentNavbar />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <Outlet />
      </main>
    </div>
  )
}
