import { Navigate } from 'react-router-dom'
import { isSupabaseConfigured } from '../services/supabaseClient'
import useAuth from '../hooks/useAuth'

function ProtectedRoute({ children, allowedRoles }) {
  const { session, userRole, loading } = useAuth()

  // If Supabase isn't configured yet, bypass checks entirely (for localized testing)
  if (!isSupabaseConfigured) {
    return children
  }

  // Wait for your Auth Context to finish resolving session + roles
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  // If no user session exists, redirect them to the login screen
  if (!session) {
    return <Navigate to="/" replace />
  }

  // If a route specifies allowedRoles and the user's role isn't included, redirect
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace /> // or redirect to an '/unauthorized' page
  }

  // All checks passed - render the component smoothly
  return children
}

export default ProtectedRoute
