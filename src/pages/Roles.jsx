import { useEffect, useState } from 'react'
import RoleCard from '../components/RoleCard'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import DashboardLayout from '../layouts/DashboardLayout'
import { usePermissionContext } from '../hooks/usePermissionContext'
import {
  createRole,
  deleteRole,
  getAllRoles,
  getRolePermissions,
  updateRole,
} from '../services/permissionService'

const inputClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'

const PROTECTED_ROLE_IDS = [1] // Admin cannot be deleted

function Roles() {
  const { can } = usePermissionContext()
  const [roles, setRoles] = useState([])
  const [rolePermCounts, setRolePermCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editRole, setEditRole] = useState(null)
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function loadRoles() {
    setLoading(true)
    try {
      const data = await getAllRoles()
      setRoles(data || [])

      const counts = {}
      await Promise.all(
        (data || []).map(async (role) => {
          const perms = await getRolePermissions(role.id)
          counts[role.id] = perms.length
        }),
      )
      setRolePermCounts(counts)
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    async function init() {
      await loadRoles()
    }
    init().then(() => {
      if (cancelled) return
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleCreate() {
    if (!formName.trim()) return
    setSubmitting(true)
    try {
      await createRole(formName.trim(), formDesc.trim())
      setToast({ message: 'Role created successfully', type: 'success' })
      setShowCreateModal(false)
      setFormName('')
      setFormDesc('')
      await loadRoles()
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    }
    setSubmitting(false)
  }

  async function handleUpdate() {
    if (!formName.trim()) return
    setSubmitting(true)
    try {
      await updateRole(editRole.id, {
        name: formName.trim(),
        description: formDesc.trim(),
      })
      setToast({ message: 'Role updated', type: 'success' })
      setEditRole(null)
      setFormName('')
      setFormDesc('')
      await loadRoles()
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    }
    setSubmitting(false)
  }

  async function handleDelete(role) {
    if (!window.confirm(`Delete role "${role.name}"? This cannot be undone.`))
      return
    try {
      await deleteRole(role.id)
      setToast({ message: 'Role deleted', type: 'success' })
      await loadRoles()
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    }
  }

  return (
    <DashboardLayout title="Roles">
      <div className="space-y-6">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Role Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Define roles and control access levels across the system.
            </p>
          </div>
          {can('roles.manage') && (
            <button
              type="button"
              onClick={() => {
                setFormName('')
                setFormDesc('')
                setShowCreateModal(true)
              }}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              + Create Role
            </button>
          )}
        </div>

        {loading ? (
          <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
            Loading roles...
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {roles.map((role) => (
              <RoleCard
                key={role.id}
                name={role.name}
                description={role.description}
                permissionCount={rolePermCounts[role.id] ?? 0}
                isProtected={PROTECTED_ROLE_IDS.includes(role.id)}
                onEdit={() => {
                  setEditRole(role)
                  setFormName(role.name)
                  setFormDesc(role.description ?? '')
                }}
                onDelete={() => handleDelete(role)}
              />
            ))}
          </div>
        )}

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Role"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Role Name
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Finance, HR, Intern"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={2}
                className={inputClass}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={submitting}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Role'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={Boolean(editRole)}
          onClose={() => setEditRole(null)}
          title="Edit Role"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Role Name
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={2}
                className={inputClass}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditRole(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={submitting}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}

export default Roles
