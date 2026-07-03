import { Navigate } from 'react-router-dom'
import { isSupabaseConfigured } from '../services/supabaseClient'
import useAuth from '../hooks/useAuth'
import { usePermissionContext } from '../hooks/usePermissionContext'

function ProtectedRoute({ children, permission = null, allowedRoles }) {
  const { session, userRole, loading } = useAuth()
  const { can, permissionsLoading } = usePermissionContext()

  // If Supabase isn't configured yet, bypass checks entirely (for localized testing)
  if (!isSupabaseConfigured) {
    return children
  }

  // Wait for Auth Context and Permissions to finish resolving
  if (loading || permissionsLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-400">
        Loading...
      </div>
    )
  }

  // If no user session exists, redirect them to the login screen
  if (!session) {
    return <Navigate to="/" replace />
  }

  // If a permission is required and user doesn't have it, show access denied
  if (permission && !can(permission)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <svg
            className="h-8 w-8 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-700">Access Denied</h2>
        <p className="text-sm text-slate-400">
          You don&apos;t have permission to view this page.
        </p>
      </div>
    )
  }

  // Legacy: If a route specifies allowedRoles and the user's role isn't included, redirect
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />
  }

  // All checks passed - render the component smoothly
  return children
}

export default ProtectedRoute
