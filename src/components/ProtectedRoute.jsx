import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../services/supabaseClient'

function ProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured)
  const [session, setSession] = useState(null)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return
    }

    const getCurrentSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setIsLoading(false)
    }

    getCurrentSession()
  }, [])

  if (!isSupabaseConfigured) {
    return children
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!session) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
