import { useEffect, useState } from 'react'
import PermissionMatrix from '../components/PermissionMatrix'
import Toast from '../components/Toast'
import DashboardLayout from '../layouts/DashboardLayout'
import useAuth from '../hooks/useAuth'
import { usePermissionContext } from '../hooks/usePermissionContext'
import {
  assignPermission,
  getAllPermissions,
  getAllRoles,
  getRolePermissions,
  removePermission,
} from '../services/permissionService'

function Permissions() {
  const { can, refreshPermissions } = usePermissionContext()
  const { roleId } = useAuth()
  const [roles, setRoles] = useState([])
  const [allPermissions, setAllPermissions] = useState([])
  const [selectedRole, setSelectedRole] = useState(null)
  const [assignedIds, setAssignedIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      const [rolesData, permsData] = await Promise.all([
        getAllRoles(),
        getAllPermissions(),
      ])
      if (cancelled) return
      setRoles(rolesData)
      setAllPermissions(permsData)
      if (rolesData.length > 0) {
        await handleSelectRole(rolesData[0])
      }
    }

    async function handleSelectRole(role) {
      if (cancelled) return
      setSelectedRole(role)
      setLoading(true)
      const rolePerms = await getRolePermissions(role.id)
      if (!cancelled) {
        setAssignedIds(rolePerms.map((p) => p.id))
        setLoading(false)
      }
    }

    loadInitial()
    return () => {
      cancelled = true
    }
  }, [])

  async function selectRole(role) {
    setSelectedRole(role)
    setLoading(true)
    const rolePerms = await getRolePermissions(role.id)
    setAssignedIds(rolePerms.map((p) => p.id))
    setLoading(false)
  }

  async function handleToggle(toggleRoleId, permissionId, isChecked) {
    if (isChecked) {
      setAssignedIds((prev) => [...prev, permissionId])
      try {
        await assignPermission(toggleRoleId, permissionId)
        setToast({ message: 'Permission granted', type: 'success' })
        // If editing your own role, refresh so sidebar/guards update immediately
        if (toggleRoleId === roleId) {
          await refreshPermissions()
        }
      } catch {
        setAssignedIds((prev) => prev.filter((id) => id !== permissionId))
        setToast({ message: 'Failed to assign permission', type: 'error' })
      }
    } else {
      setAssignedIds((prev) => prev.filter((id) => id !== permissionId))
      try {
        await removePermission(toggleRoleId, permissionId)
        setToast({ message: 'Permission removed', type: 'success' })
        if (toggleRoleId === roleId) {
          await refreshPermissions()
        }
      } catch {
        setAssignedIds((prev) => [...prev, permissionId])
        setToast({ message: 'Failed to remove permission', type: 'error' })
      }
    }
  }

  return (
    <DashboardLayout title="Permissions">
      <div className="space-y-6">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Permission Matrix
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Changes save instantly — no submit button needed.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex gap-2 flex-wrap">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => selectRole(role)}
              className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
                selectedRole?.id === role.id
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              {role.name}
            </button>
          ))}
        </div>

        <PermissionMatrix
          selectedRole={selectedRole}
          permissions={allPermissions}
          assignedPermissionIds={assignedIds}
          onToggle={can('roles.manage') ? handleToggle : null}
          loading={loading}
        />

        {!can('roles.manage') && (
          <p className="text-xs text-slate-400 mt-3 text-center">
            View only — you don&apos;t have permission to modify roles.
          </p>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Permissions
