import { useContext } from 'react'
import PermissionContext from '../contexts/PermissionContextDef'

export function usePermissionContext() {
  return useContext(PermissionContext)
}
