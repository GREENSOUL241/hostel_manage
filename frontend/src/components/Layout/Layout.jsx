import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="lg:sticky lg:top-0 lg:h-screen lg:w-72">
        <Sidebar />
      </div>
      <main className="flex-1 px-4 py-4 lg:px-8 lg:py-6">
        <Outlet />
      </main>
    </div>
  )
}
