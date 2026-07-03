import { useEffect, useState } from 'react'
import { KeyRound, ShieldCheck, Menu, X } from 'lucide-react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import useAuth from '../hooks/useAuth'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊' },
  { label: 'Employees', path: '/employees', icon: '👥' },
  { label: 'Attendance', path: '/attendance', icon: '📅' },
  { label: 'Leave', path: '/leaves', icon: '🏖️' },
  { label: 'Payroll', path: '/payroll', icon: '💰' },
  { label: 'Departments', path: '/departments', icon: '🏢' },
  { label: 'Profile', path: '/profile', icon: '👤' },
]

const settingsNavItems = [
  { label: 'Roles', path: '/roles', icon: ShieldCheck },
  { label: 'Permissions', path: '/permissions', icon: KeyRound },
  { label: 'Audit Logs', path: '/audit-logs', icon: '📋' },
]

function DashboardLayout({ title, children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, userRole, roleName } = useAuth()
  const [userLabel, setUserLabel] = useState('User')
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setIsOpen(false)
      else setIsOpen(true)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession()
      const user = data.session?.user
      setUserLabel(user?.user_metadata?.full_name || user?.email || 'User')
    }

    loadSession()
  }, [])

  // Close sidebar on route change (mobile only)
  useEffect(() => {
    if (isMobile) setIsOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const isActivePath = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile overlay */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-[#1e293b] text-white z-50 transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar header with close button */}
        <div className="border-b border-white/10 px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">PayrollPro</h1>
            <p className="mt-1 text-sm text-slate-300">Management System</p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-md p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                isActivePath(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {/* Settings section divider */}
          <div className="mt-4 border-t border-white/10 pt-4">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              SETTINGS
            </p>
            {settingsNavItems.map((item) => {
              const isLucideIcon = typeof item.icon !== 'string'
              const Icon = isLucideIcon ? item.icon : null

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                    isActivePath(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {isLucideIcon ? (
                    <Icon className="h-4 w-4" strokeWidth={2.25} />
                  ) : (
                    <span className="text-base">{item.icon}</span>
                  )}
                  {item.label}
                </NavLink>
              )
            })}
          </div>
        </nav>

        {/* User info */}
        <div className="border-t border-slate-700 p-3">
          <p className="text-xs text-slate-400 truncate">{session?.user?.email}</p>
          <p className="text-xs text-blue-400 font-medium">{roleName ?? userRole}</p>
        </div>

        {/* Logout button */}
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

      {/* Main content — margin shifts based on sidebar state */}
      <div
        className={`min-h-screen bg-white transition-[margin-left] duration-300 ease-in-out ${
          isOpen && !isMobile ? 'ml-64' : 'ml-0'
        }`}
      >
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
          <div className="flex items-center gap-3">
            {/* Hamburger toggle — always visible when sidebar is closed */}
            {!isOpen && (
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          </div>
          <div className="text-sm text-slate-600">
            Signed in as{' '}
            <span className="font-medium text-slate-900">{userLabel}</span>
          </div>
        </header>

        <main className="p-8">{children || <Outlet />}</main>
      </div>
    </div>
  )
}

export default DashboardLayout
