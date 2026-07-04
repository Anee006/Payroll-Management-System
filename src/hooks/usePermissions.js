import { useCallback, useEffect, useRef, useState } from 'react'
import { getMyPermissions } from '../services/permissionService'
import useAuth from './useAuth'

export function usePermissions() {
  const { session } = useAuth()
  const [permissions, setPermissions] = useState([])
  const [permissionsLoading, setPermissionsLoading] = useState(true)
  const prevUserIdRef = useRef(null)

  const loadPermissions = useCallback(async () => {
    const userId = session?.user?.id
    if (!userId) {
      setPermissions([])
      setPermissionsLoading(false)
      return
    }
    try {
      const result = await getMyPermissions(userId)
      setPermissions(result.map((p) => p.name))
    } catch {
      setPermissions([])
    } finally {
      setPermissionsLoading(false)
    }
  }, [session])

  // Load permissions on login / session change
  useEffect(() => {
    let cancelled = false

    // Use microtask to avoid synchronous setState in effect body
    Promise.resolve().then(() => {
      if (!cancelled) {
        loadPermissions()
      }
    })

    prevUserIdRef.current = session?.user?.id

    return () => {
      cancelled = true
    }
  }, [loadPermissions, session])

  // Expose a refresh function so the Permissions page (or any admin action)
  // can force a re-fetch of the current user's permissions from the DB.
  const refreshPermissions = useCallback(() => {
    return loadPermissions()
  }, [loadPermissions])

  // Helper: check if user has a specific permission
  const can = useCallback(
    (permissionName) => permissions.includes(permissionName),
    [permissions],
  )

  // Helper: check if user has ANY of the listed permissions
  const canAny = useCallback(
    (permissionNames) => permissionNames.some((p) => permissions.includes(p)),
    [permissions],
  )

  return { permissions, permissionsLoading, can, canAny, refreshPermissions }
}
