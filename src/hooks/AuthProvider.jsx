import { useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { getUserRole } from '../services/authService'
import { supabase } from '../services/supabaseClient'

function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [userEmployeeId, setUserEmployeeId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)

      if (session) {
        try {
          const roleData = await getUserRole(session.user.id)
          setUserRole(roleData.role)
          setUserEmployeeId(roleData.employee_id)
        } catch (err) {
          console.error('Error fetching user role:', err)
        }
      } else {
        setUserRole(null)
        setUserEmployeeId(null)
      }

      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)

      if (session) {
        try {
          const roleData = await getUserRole(session.user.id)
          setUserRole(roleData.role)
          setUserEmployeeId(roleData.employee_id)
        } catch (err) {
          console.error('Error fetching user role:', err)
        }
      } else {
        setUserRole(null)
        setUserEmployeeId(null)
      }

      setLoading(false)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, userRole, userEmployeeId, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
