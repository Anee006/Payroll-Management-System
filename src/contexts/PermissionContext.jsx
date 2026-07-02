import PermissionContext from './PermissionContextDef'
import { usePermissions } from '../hooks/usePermissions'

export function PermissionProvider({ children }) {
  const { permissions, permissionsLoading, can, canAny } = usePermissions()

  return (
    <PermissionContext.Provider
      value={{ permissions, permissionsLoading, can, canAny }}
    >
      {children}
    </PermissionContext.Provider>
  )
}
