import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Employees', path: '/employees' },
  { label: 'Attendance', path: '/attendance' },
  { label: 'Leave', path: '/leaves' },
  { label: 'Payroll', path: '/payroll' },
  { label: 'Departments', path: '/departments' },
  { label: 'Profile', path: '/profile' },
]

function DashboardLayout({ title, children }) {
  const navigate = useNavigate()
  const [userLabel, setUserLabel] = useState('User')

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession()
      const user = data.session?.user
      setUserLabel(user?.user_metadata?.full_name || user?.email || 'User')
    }

    loadSession()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 flex w-64 flex-col bg-[#1e293b] text-white">
        <div className="border-b border-white/10 px-6 py-5">
          <h1 className="text-xl font-bold">PayrollPro</h1>
          <p className="mt-1 text-sm text-slate-300">Management System</p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white text-slate-900'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="ml-64 min-h-screen bg-white">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <div className="text-sm text-slate-600">
            Signed in as <span className="font-medium text-slate-900">{userLabel}</span>
          </div>
        </header>

        <main className="p-8">{children || <Outlet />}</main>
      </div>
    </div>
  )
}

export default DashboardLayout
