import PermissionContext from './PermissionContextDef'
import { usePermissions } from '../hooks/usePermissions'

export function PermissionProvider({ children }) {
  const { permissions, permissionsLoading, can, canAny, refreshPermissions } =
    usePermissions()

  return (
    <PermissionContext.Provider
      value={{ permissions, permissionsLoading, can, canAny, refreshPermissions }}
    >
      {children}
    </PermissionContext.Provider>
  )
}
