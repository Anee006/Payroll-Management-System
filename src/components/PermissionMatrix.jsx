import { useMemo } from 'react'

export default function PermissionMatrix({
  selectedRole,
  permissions = [],
  assignedPermissionIds = [],
  onToggle,
  loading = false
}) {
  // Group permissions by module
  const grouped = useMemo(() => {
    return permissions.reduce((acc, perm) => {
      if (!acc[perm.module]) acc[perm.module] = []
      acc[perm.module].push(perm)
      return acc
    }, {})
  }, [permissions])

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="h-10 bg-gray-100 rounded" />
        ))}
      </div>
    )
  }

  if (!selectedRole) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-2">🔑</p>
        <p>Select a role to manage permissions</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="px-5 py-4 border-b bg-gray-50">
        <h3 className="font-semibold text-gray-700">
          Permissions for: <span className="text-blue-600">{selectedRole.name}</span>
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left px-5 py-3 text-gray-600 font-medium w-40">Module</th>
              <th className="px-3 py-3 text-gray-500 font-normal text-center">View</th>
              <th className="px-3 py-3 text-gray-500 font-normal text-center">Create</th>
              <th className="px-3 py-3 text-gray-500 font-normal text-center">Edit</th>
              <th className="px-3 py-3 text-gray-500 font-normal text-center">Delete</th>
              <th className="px-3 py-3 text-gray-500 font-normal text-center">Manage</th>
              <th className="px-3 py-3 text-gray-500 font-normal text-center">Approve</th>
              <th className="px-3 py-3 text-gray-500 font-normal text-center">Generate</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(grouped).map(([module, perms], idx) => {
              const actionMap = perms.reduce((acc, p) => { acc[p.action] = p; return acc }, {})
              const actions = ['view','create','edit','delete','manage','approve','generate']
              return (
                <tr key={module} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-5 py-3 font-medium text-gray-700 capitalize">{module}</td>
                  {actions.map(action => {
                    const perm = actionMap[action]
                    const isAssigned = perm ? assignedPermissionIds.includes(perm.id) : false
                    return (
                      <td key={action} className="px-3 py-3 text-center">
                        {perm ? (
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={e => onToggle && onToggle(selectedRole.id, perm.id, e.target.checked)}
                            className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                          />
                        ) : (
                          <span className="text-gray-200">—</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
