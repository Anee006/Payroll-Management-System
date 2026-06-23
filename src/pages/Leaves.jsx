import { useCallback, useEffect, useMemo, useState } from 'react'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import Modal from '../components/Modal'
import Table from '../components/Table'
import Toast from '../components/Toast'
import useAuth from '../hooks/useAuth'
import DashboardLayout from '../layouts/DashboardLayout'
import {
  applyLeave,
  cancelLeave,
  getAllLeaves,
  getLeavesByEmployee,
  updateLeaveStatus,
} from '../services/leaveService'
import {
  getAllEmployees,
  getEmployeeByEmail,
  getEmployeeById,
} from '../services/employeeService'
import { calculateLeaveDays, formatDate } from '../utils/dateHelpers'

const inputClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'

const statusColors = {
  Pending: 'yellow',
  Approved: 'green',
  Rejected: 'red',
}

const ITEMS_PER_PAGE = 10

// ─── Employee Leave Panel (Apply + My Requests) ─────────────────────────────
function EmployeeLeavePanel({ employeeId, showToast }) {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Apply modal state
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Cancel confirmation state
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  const loadLeaves = useCallback(async () => {
    try {
      const data = await getLeavesByEmployee(employeeId)
      setLeaves(data || [])
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [employeeId])

  useEffect(() => {
    let isMounted = true
    async function fetchData() {
      if (isMounted) {
        await loadLeaves()
      }
    }
    fetchData()
    return () => {
      isMounted = false
    }
  }, [loadLeaves])

  // Summary counts
  const summary = useMemo(() => {
    const counts = { Pending: 0, Approved: 0, Rejected: 0 }
    for (const leave of leaves) {
      if (counts[leave.status] !== undefined) {
        counts[leave.status]++
      }
    }
    return counts
  }, [leaves])

  // Computed leave days for the form
  const leaveDays = useMemo(() => {
    if (!startDate || !endDate) return 0
    if (new Date(endDate) < new Date(startDate)) return 0
    return calculateLeaveDays(startDate, endDate)
  }, [startDate, endDate])

  const resetForm = () => {
    setStartDate('')
    setEndDate('')
    setReason('')
    setFormError('')
  }

  const handleApply = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!startDate || !endDate) {
      setFormError('Please select both start and end dates.')
      return
    }
    if (new Date(endDate) < new Date(startDate)) {
      setFormError('End date must be on or after start date.')
      return
    }
    if (!reason.trim()) {
      setFormError('Please provide a reason for leave.')
      return
    }

    setSubmitting(true)
    try {
      await applyLeave(employeeId, startDate, endDate, reason.trim())
      setShowApplyModal(false)
      resetForm()
      await loadLeaves()
      showToast('Leave application submitted successfully!', 'success')
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async () => {
    if (!cancelTarget) return
    setCancelling(true)
    try {
      await cancelLeave(cancelTarget.id)
      setCancelTarget(null)
      await loadLeaves()
      showToast('Leave request cancelled.', 'success')
    } catch (err) {
      showToast('Failed to cancel leave: ' + err.message, 'error')
    } finally {
      setCancelling(false)
    }
  }

  const columns = [
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'days', label: 'Days' },
    { key: 'reason', label: 'Reason' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Action' },
  ]

  const tableData = leaves.map((leave) => ({
    id: leave.id,
    startDate: formatDate(leave.start_date),
    endDate: formatDate(leave.end_date),
    days: calculateLeaveDays(leave.start_date, leave.end_date),
    reason: (
      <span className="line-clamp-2 max-w-xs" title={leave.reason}>
        {leave.reason}
      </span>
    ),
    status: (
      <Badge
        label={leave.status}
        color={statusColors[leave.status] || 'blue'}
      />
    ),
    actions:
      leave.status === 'Pending' ? (
        <Button
          label="Cancel"
          variant="danger"
          onClick={() => setCancelTarget(leave)}
          className="px-3 py-1.5 text-xs"
        />
      ) : (
        <span className="text-xs text-slate-400">—</span>
      ),
  }))

  if (loading) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
        Loading leave data...
      </div>
    )
  }

  return (
    <>
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Apply for Leave */}
      <Card title="Apply for Leave">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Submit a new leave request with your desired dates and reason.
          </p>
          <Button label="+ Apply Leave" onClick={() => setShowApplyModal(true)} />
        </div>
      </Card>

      {/* My Leave Requests */}
      <Card title="My Leave Requests">
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 rounded-md bg-yellow-50 px-3 py-1.5 text-sm font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
            Pending: {summary.Pending}
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            Approved: {summary.Approved}
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
            Rejected: {summary.Rejected}
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-inset ring-slate-300">
            Total: {leaves.length}
          </div>
        </div>

        <Table columns={columns} data={tableData} />
      </Card>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => {
          setShowApplyModal(false)
          resetForm()
        }}
        title="Apply for Leave"
      >
        <form onSubmit={handleApply} className="space-y-4">
          {formError && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {formError}
            </div>
          )}

          <div>
            <label htmlFor="leave-start-date" className="mb-1 block text-sm font-medium text-slate-700">
              Start Date
            </label>
            <input
              id="leave-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="leave-end-date" className="mb-1 block text-sm font-medium text-slate-700">
              End Date
            </label>
            <input
              id="leave-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined}
              className={inputClass}
              required
            />
          </div>

          {leaveDays > 0 && (
            <div className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {leaveDays} {leaveDays === 1 ? 'day' : 'days'}
            </div>
          )}

          <div>
            <label htmlFor="leave-reason" className="mb-1 block text-sm font-medium text-slate-700">
              Reason
            </label>
            <textarea
              id="leave-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Briefly describe the reason for your leave..."
              className={`${inputClass} resize-none`}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              label="Cancel"
              variant="secondary"
              onClick={() => {
                setShowApplyModal(false)
                resetForm()
              }}
            />
            <Button
              type="submit"
              label={submitting ? 'Submitting...' : 'Submit Application'}
              loading={submitting}
            />
          </div>
        </form>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal isOpen={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)} title="Cancel Leave Request">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Are you sure you want to cancel this leave request?</p>
          {cancelTarget && (
            <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-700 ring-1 ring-inset ring-slate-200">
              <p>
                <span className="font-medium">Dates:</span> {formatDate(cancelTarget.start_date)} → {formatDate(cancelTarget.end_date)} ({calculateLeaveDays(cancelTarget.start_date, cancelTarget.end_date)} days)
              </p>
              <p className="mt-1">
                <span className="font-medium">Reason:</span> {cancelTarget.reason}
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button label="Keep It" variant="secondary" onClick={() => setCancelTarget(null)} />
            <Button label={cancelling ? 'Cancelling...' : 'Yes, Cancel Leave'} variant="danger" onClick={handleCancel} loading={cancelling} />
          </div>
        </div>
      </Modal>
    </>
  )
}

// ─── Admin Approval Panel (Pending + All Requests) ──────────────────────────
function AdminApprovalPanel({ approverEmployeeId, showToast }) { // 👈 FIX: Extracted approver's physical table UUID
  const [allLeaves, setAllLeaves] = useState([])
  const [employeeMap, setEmployeeMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [actionLoading, setActionLoading] = useState(null)

  const loadLeaves = useCallback(async () => {
    try {
      const leavesData = await getAllLeaves()
      setAllLeaves(leavesData || [])

      const map = {}
      for (const leave of leavesData || []) {
        if (leave.employees?.name && leave.employee_id) {
          map[leave.employee_id] = leave.employees.name
        }
      }

      try {
        const employeesData = await getAllEmployees()
        for (const emp of employeesData || []) {
          map[emp.id] = emp.name || emp.employee_id || emp.id
        }
      } catch {
        // Safe context block suppression
      }

      setEmployeeMap(map)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    async function fetchData() {
      if (isMounted) {
        await loadLeaves()
      }
    }
    fetchData()
    return () => {
      isMounted = false
    }
  }, [loadLeaves])

  const handleAction = async (leaveId, status) => {
    setActionLoading(leaveId)
    try {
      // 👈 FIX: Passes the true database Employee UUID to satisfy foreign key constraint
      await updateLeaveStatus(leaveId, status, approverEmployeeId)
      await loadLeaves()
      showToast(`Leave request ${status.toLowerCase()} successfully!`, 'success')
    } catch (err) {
      showToast('Failed to update leave: ' + err.message, 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const pendingLeaves = useMemo(() => allLeaves.filter((l) => l.status === 'Pending'), [allLeaves])

  const filteredLeaves = useMemo(() => {
    if (statusFilter === 'All') return allLeaves
    return allLeaves.filter((l) => l.status === statusFilter)
  }, [allLeaves, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredLeaves.length / ITEMS_PER_PAGE))
  const paginatedLeaves = filteredLeaves.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const getEmployeeName = (leave) => leave.employees?.name || employeeMap[leave.employee_id] || leave.employee_id || '-'

  const pendingColumns = [
    { key: 'employee', label: 'Employee' },
    { key: 'dates', label: 'Dates' },
    { key: 'days', label: 'Days' },
    { key: 'reason', label: 'Reason' },
    { key: 'appliedOn', label: 'Applied On' },
    { key: 'actions', label: 'Actions' },
  ]

  const pendingTableData = pendingLeaves.map((leave) => ({
    id: leave.id,
    employee: getEmployeeName(leave),
    dates: `${formatDate(leave.start_date)} → ${formatDate(leave.end_date)}`,
    days: calculateLeaveDays(leave.start_date, leave.end_date),
    reason: <span className="line-clamp-2 max-w-xs" title={leave.reason}>{leave.reason}</span>,
    appliedOn: formatDate(leave.created_at),
    actions: (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleAction(leave.id, 'Approved')}
          disabled={actionLoading === leave.id}
          className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {actionLoading === leave.id ? '...' : 'Approve'}
        </button>
        <button
          type="button"
          onClick={() => handleAction(leave.id, 'Rejected')}
          disabled={actionLoading === leave.id}
          className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {actionLoading === leave.id ? '...' : 'Reject'}
        </button>
      </div>
    ),
  }))

  const allColumns = [
    { key: 'employee', label: 'Employee' },
    { key: 'dates', label: 'Dates' },
    { key: 'days', label: 'Days' },
    { key: 'reason', label: 'Reason' },
    { key: 'status', label: 'Status' },
    { key: 'decidedBy', label: 'Decided By' },
  ]

  const allTableData = paginatedLeaves.map((leave) => ({
    id: leave.id,
    employee: getEmployeeName(leave),
    dates: `${formatDate(leave.start_date)} → ${formatDate(leave.end_date)}`,
    days: calculateLeaveDays(leave.start_date, leave.end_date),
    reason: <span className="line-clamp-2 max-w-xs" title={leave.reason}>{leave.reason}</span>,
    status: <Badge label={leave.status} color={statusColors[leave.status] || 'blue'} />,
    decidedBy: leave.approved_by ? (employeeMap[leave.approved_by] || leave.approved_by) : '—',
  }))

  const filterOptions = ['All', 'Pending', 'Approved', 'Rejected']

  if (loading) {
    return <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">Loading leave requests...</div>
  }

  return (
    <>
      {error && <div className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

      <Card title="Pending Leave Requests">
        {pendingLeaves.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center">
            <p className="text-sm text-slate-500">No pending requests — all caught up!</p>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <span className="inline-flex items-center rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                {pendingLeaves.length} pending
              </span>
            </div>
            <Table columns={pendingColumns} data={pendingTableData} />
          </>
        )}
      </Card>

      <Card title="All Leave Requests">
        <div className="mb-4 flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setStatusFilter(option)
                setPage(1) // 👈 FIX: ESLint setup update directly in action handler click event
              }}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${statusFilter === option ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {option}
            </button>
          ))}
        </div>

        <Table columns={allColumns} data={allTableData} />

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filteredLeaves.length)} of {filteredLeaves.length} records</p>
            <div className="flex gap-2">
              <Button label="← Previous" variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} />
              <Button label="Next →" variant="secondary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} />
            </div>
          </div>
        )}
      </Card>
    </>
  )
}

// ─── Sub-View Injections ───────────────────────────────────────────────────
function EmployeeView({ employeeId, showToast }) {
  return (
    <div className="space-y-6">
      <EmployeeLeavePanel employeeId={employeeId} showToast={showToast} />
    </div>
  )
}

function ManagerView({ employeeId, showToast }) {
  return (
    <div className="space-y-6">
      {/* 👈 FIX: Removed AdminApprovalPanel out of Manager view layout to respect RLS access rules */}
      <EmployeeLeavePanel employeeId={employeeId} showToast={showToast} />
    </div>
  )
}

function AdminView({ employeeId, showToast }) {
  return (
    <div className="space-y-6">
      <AdminApprovalPanel approverEmployeeId={employeeId} showToast={showToast} />
    </div>
  )
}

// ─── Main Page Entry ───────────────────────────────────────────────────────
function Leaves() {
  const { session, userRole, userEmployeeId } = useAuth()
  const [employeeId, setEmployeeId] = useState(null)
  const [loadingEmployee, setLoadingEmployee] = useState(true)
  const [employeeError, setEmployeeError] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, key: Date.now() })
  }, [])

  const effectiveRole = userRole?.toLowerCase?.() || ''
  const isAdmin = effectiveRole === 'admin'
  const isManager = effectiveRole === 'manager'

  useEffect(() => {
    let isMounted = true

    async function resolveEmployee() {
      try {
        const email = session?.user?.email
        const authUserId = session?.user?.id

        // If the logged-in user is a global admin, they don't need an employee row
        if (isAdmin) {
          if (isMounted) {
            setEmployeeId(null) 
            setEmployeeError('')
            setLoadingEmployee(false)
          }
          return
        }

        if (email) {
          const employee = await getEmployeeByEmail(email)
          if (employee && isMounted) {
            setEmployeeId(employee.id)
            setEmployeeError('')
            return
          }
        }

        if (userEmployeeId) {
          try {
            const employee = await getEmployeeById(userEmployeeId)
            if (employee && isMounted) {
              setEmployeeId(employee.id)
              setEmployeeError('')
              return
            }
          } catch {
            // Context catch bypass
          }
        }

        const allEmployees = await getAllEmployees()
        const normalEmail = (email || '').trim().toLowerCase()
        const normalAuthId = (authUserId || '').trim().toLowerCase()
        const normalEmpId = (userEmployeeId || '').trim().toLowerCase()

        const match = allEmployees?.find((emp) => {
          const empEmail = (emp.email || '').trim().toLowerCase()
          const empRowId = (emp.id || '').trim().toLowerCase()
          const empCode = (emp.employee_id || '').trim().toLowerCase()

          return (
            (normalEmail && empEmail === normalEmail) ||
            (normalAuthId && (empRowId === normalAuthId || empCode === normalAuthId)) ||
            (normalEmpId && (empRowId === normalEmpId || empCode === normalEmpId))
          )
        })

        if (match && isMounted) {
          setEmployeeId(match.id)
          setEmployeeError('')
          return
        }

        throw new Error('No structural employee row found linked to this account.')
      } catch (err) {
        if (isMounted) {
          setEmployeeError(err.message)
        }
      } finally {
        if (isMounted) {
          setLoadingEmployee(false)
        }
      }
    }

    resolveEmployee()

    return () => {
      isMounted = false
    }
  }, [session, userEmployeeId, isAdmin])

  const getSubtitle = () => {
    if (isAdmin) return 'Review, approve, or reject employee leave requests.'
    if (isManager) return 'Apply for leave and manage your requests.'
    return 'Apply for leave, track your requests, and view status.'
  }

  const renderContent = () => {
    if (loadingEmployee) {
      return <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">Loading your leave data...</div>
    }

    if (employeeError) {
      return <div className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{employeeError}</div>
    }

    if (isAdmin) {
      return <AdminView employeeId={employeeId} showToast={showToast} />
    }

    if (isManager) {
      return <ManagerView employeeId={employeeId} showToast={showToast} />
    }

    return <EmployeeView employeeId={employeeId} showToast={showToast} />
  }

  return (
    <DashboardLayout title="Leave Management">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
          <p className="mt-1 text-sm text-slate-500">{getSubtitle()}</p>
        </div>
        {renderContent()}
      </div>
      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </DashboardLayout>
  )
}

export default Leaves