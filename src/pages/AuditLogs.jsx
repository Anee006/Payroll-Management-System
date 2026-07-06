import { useEffect, useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import { getAllAuditLogs } from '../services/auditService'

const moduleColors = {
  employees: 'bg-blue-100 text-blue-700',
  leave: 'bg-green-100 text-green-700',
  payroll: 'bg-purple-100 text-purple-700',
  attendance: 'bg-yellow-100 text-yellow-700',
  roles: 'bg-red-100 text-red-700',
}

const modules = ['all', 'employees', 'leave', 'payroll', 'attendance', 'roles']

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [moduleFilter, setModuleFilter] = useState('all')

  useEffect(() => {
    let cancelled = false
    getAllAuditLogs(100)
      .then((data) => {
        if (!cancelled) setLogs(data || [])
      })
      .catch(() => {
        if (!cancelled) setLogs([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered =
    moduleFilter === 'all'
      ? logs
      : logs.filter((l) => l.module === moduleFilter)

  return (
    <DashboardLayout title="Audit Logs">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Audit Logs</h1>
          <p className="text-gray-500 text-sm mt-1">
            Track all actions performed in the system
          </p>
        </div>

        {/* Module filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {modules.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setModuleFilter(m)}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize font-medium transition ${
                moduleFilter === m
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading audit logs...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-2 stroke-gray-300" />
            <p>No audit logs found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-600">Action</th>
                  <th className="text-left px-5 py-3 text-gray-600">Module</th>
                  <th className="text-left px-5 py-3 text-gray-600">
                    Performed By
                  </th>
                  <th className="text-left px-5 py-3 text-gray-600">Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, idx) => (
                  <tr
                    key={log.id}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                  >
                    <td className="px-5 py-3 text-gray-700">{log.action}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          moduleColors[log.module] ??
                          'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {log.module}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {log.user_email || '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-400">
                      {new Date(log.created_at).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 text-xs text-gray-400 border-t bg-gray-50">
              Showing {filtered.length} log{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
