export default function RoleCard({ name, description, permissionCount = 0, onEdit, onDelete, isProtected = false }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5
                    hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-800">{name}</span>
            {isProtected && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                Protected
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onEdit}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Edit
          </button>
          {!isProtected && (
            <button
              onClick={onDelete}
              className="text-sm text-red-400 hover:text-red-600 font-medium"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-50">
        <span className="text-xs text-gray-400">
          {permissionCount} permission{permissionCount !== 1 ? 's' : ''} assigned
        </span>
      </div>
    </div>
  )
}