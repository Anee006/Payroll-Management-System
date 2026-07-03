export default function AuditLogs() {
  const mockLogs = [
    { id: 1, action: 'Employee Created', module: 'employees', user: 'admin@payroll.com', created_at: new Date().toISOString() },
    { id: 2, action: 'Leave Approved', module: 'leave', user: 'manager@payroll.com', created_at: new Date().toISOString() },
    { id: 3, action: 'Payroll Generated', module: 'payroll', user: 'admin@payroll.com', created_at: new Date().toISOString() },
  ]

  const moduleColors = {
    employees: 'bg-blue-100 text-blue-700',
    leave: 'bg-green-100 text-green-700',
    payroll: 'bg-purple-100 text-purple-700',
    attendance: 'bg-yellow-100 text-yellow-700',
    roles: 'bg-red-100 text-red-700',
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Audit Logs</h1>
      <p className="text-gray-500 text-sm mb-6">Track all actions performed in the system</p>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-5 py-3 text-gray-600">Action</th>
              <th className="text-left px-5 py-3 text-gray-600">Module</th>
              <th className="text-left px-5 py-3 text-gray-600">Performed By</th>
              <th className="text-left px-5 py-3 text-gray-600">Time</th>
            </tr>
          </thead>
          <tbody>
            {mockLogs.map((log, idx) => (
              <tr key={log.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className="px-5 py-3 text-gray-700">{log.action}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${moduleColors[log.module] ?? 'bg-gray-100 text-gray-600'}`}>
                    {log.module}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-600">{log.user}</td>
                <td className="px-5 py-3 text-gray-400">{new Date(log.created_at).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 text-xs text-gray-400 border-t bg-gray-50">
          Real data connects on Day 4
        </div>
      </div>
    </div>
  )
}
