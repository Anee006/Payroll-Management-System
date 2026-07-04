import { usePermissionContext } from '../hooks/usePermissionContext'

export default function PermissionGuard({
  permission,
  children,
  fallback = null,
}) {
  const { can, permissionsLoading } = usePermissionContext()
  if (permissionsLoading) return null
  if (!can(permission)) return fallback
  return children
}
