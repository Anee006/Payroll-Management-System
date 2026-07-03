import { useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { supabase } from '../services/supabaseClient'

function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [roleId, setRoleId] = useState(null)
  const [roleName, setRoleName] = useState(null)
  const [userEmployeeId, setUserEmployeeId] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchUserRole(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('role, role_id, employee_id, roles(name)')
      .eq('id', userId)
      .single()
    if (error) {
      console.error('Error fetching user role:', error)
      return
    }
    setUserRole(data.role)
    setRoleId(data.role_id)
    setRoleName(data.roles?.name ?? data.role)
    setUserEmployeeId(data.employee_id)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session) await fetchUserRole(session.user.id)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        if (session) {
          await fetchUserRole(session.user.id)
        } else {
          setUserRole(null)
          setRoleId(null)
          setRoleName(null)
          setUserEmployeeId(null)
        }
        setLoading(false)
      },
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider
      value={{ session, userRole, roleId, roleName, userEmployeeId, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
