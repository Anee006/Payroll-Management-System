import { useCallback, useEffect, useRef, useState } from 'react'
import { getMyPermissions } from '../services/permissionService'
import useAuth from './useAuth'

export function usePermissions() {
  const { session } = useAuth()
  const [permissions, setPermissions] = useState([])
  const [permissionsLoading, setPermissionsLoading] = useState(true)
  const prevUserIdRef = useRef(null)

  useEffect(() => {
    const userId = session?.user?.id
    let cancelled = false

    async function loadPermissions() {
      if (!userId) {
        return { perms: [], done: true }
      }
      try {
        const result = await getMyPermissions(userId)
        return { perms: result.map((p) => p.name), done: true }
      } catch {
        return { perms: [], done: true }
      }
    }

    loadPermissions().then(({ perms, done }) => {
      if (!cancelled && done) {
        setPermissions(perms)
        setPermissionsLoading(false)
      }
    })

    prevUserIdRef.current = userId

    return () => {
      cancelled = true
    }
  }, [session])

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

  return { permissions, permissionsLoading, can, canAny }
}
