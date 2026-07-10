import { useCallback, useEffect, useMemo, useState } from 'react'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import Modal from '../components/Modal'
import Table from '../components/Table'
import useAuth from '../hooks/useAuth'
import DashboardLayout from '../layouts/DashboardLayout'
import {
  getAllAttendance,
  getAttendanceByEmployee,
  getTodayAttendance,
  markAttendance,
} from '../services/attendanceService'
import {
  getAllEmployees,
  getEmployeeByEmail,
  getEmployeeById,
} from '../services/employeeService'

const inputClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'

const statusColors = {
  Present: 'green',
  Absent: 'red',
  'Half Day': 'yellow',
  Holiday: 'blue',
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

const getDayName = (date) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('en-IN', { weekday: 'long' }).format(
    new Date(date),
  )
}

const todayISO = () => new Date().toISOString().split('T')[0]

const ITEMS_PER_PAGE = 10

// ─── Employee / Manager View ────────────────────────────────────────────────

function EmployeeView({ employeeId }) {
  const [todayRecord, setTodayRecord] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showMarkModal, setShowMarkModal] = useState(false)
  const [markStatus, setMarkStatus] = useState('Present')
  const [workingHours, setWorkingHours] = useState(8)
  const [submitting, setSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [today, records] = await Promise.all([
        getTodayAttendance(employeeId),
        getAttendanceByEmployee(employeeId),
      ])
      setTodayRecord(today)
      setHistory(records || [])
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [employeeId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const summary = useMemo(() => {
    const counts = { Present: 0, Absent: 0, 'Half Day': 0, Holiday: 0 }
    for (const record of history) {
      if (counts[record.status] !== undefined) {
        counts[record.status]++
      }
    }
    return counts
  }, [history])

  const handleMarkAttendance = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const hours = markStatus === 'Absent' ? 0 : Number(workingHours)
      await markAttendance(employeeId, todayISO(), markStatus, hours)
      setShowMarkModal(false)
      setMarkStatus('Present')
      setWorkingHours(8)
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const historyColumns = [
    { key: 'date', label: 'Date' },
    { key: 'day', label: 'Day' },
    { key: 'status', label: 'Status' },
    { key: 'hours', label: 'Working Hours' },
  ]

  const historyData = history.map((record) => ({
    id: record.id,
    date: formatDate(record.attendance_date),
    day: getDayName(record.attendance_date),
    status: (
      <Badge
        label={record.status}
        color={statusColors[record.status] || 'blue'}
      />
    ),
    hours: record.working_hours ?? '-',
  }))

  if (loading) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
        Loading attendance data...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* ── Today's Attendance ── */}
      <Card title="Today's Attendance">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-900">
                {formatDate(todayISO())}
              </span>{' '}
              — {getDayName(todayISO())}
            </p>

            {todayRecord ? (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-slate-500">Status:</span>
                <Badge
                  label={todayRecord.status}
                  color={statusColors[todayRecord.status] || 'blue'}
                />
                {todayRecord.working_hours != null && (
                  <span className="text-sm text-slate-500">
                    · {todayRecord.working_hours}h
                  </span>
                )}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                Attendance not yet marked for today.
              </p>
            )}
          </div>

          <Button
            label={todayRecord ? 'Update Attendance' : 'Mark Attendance'}
            onClick={() => setShowMarkModal(true)}
          />
        </div>
      </Card>

      {/* ── Attendance History ── */}
      <Card title="Attendance History">
        <div className="mb-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5 rounded-md bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            Present: {summary.Present}
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
            Absent: {summary.Absent}
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-yellow-50 px-3 py-1.5 text-sm font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
            Half Day: {summary['Half Day']}
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
            Holiday: {summary.Holiday}
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-inset ring-slate-300">
            Total: {history.length} days
          </div>
        </div>

        <Table columns={historyColumns} data={historyData} />
      </Card>

      {/* ── Mark / Update Attendance Modal ── */}
      <Modal
        isOpen={showMarkModal}
        onClose={() => setShowMarkModal(false)}
        title={todayRecord ? 'Update Attendance' : 'Mark Attendance'}
      >
        <form onSubmit={handleMarkAttendance} className="space-y-4">
          <div>
            <label
              htmlFor="mark-status"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Status
            </label>
            <select
              id="mark-status"
              value={markStatus}
              onChange={(e) => setMarkStatus(e.target.value)}
              className={inputClass}
            >
              <option value="Present">Present</option>
              <option value="Half Day">Half Day</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          {markStatus !== 'Absent' && (
            <div>
              <label
                htmlFor="working-hours"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Working Hours
              </label>
              <input
                id="working-hours"
                type="number"
                min="0"
                max="12"
                step="0.5"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                className={inputClass}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              label="Cancel"
              variant="secondary"
              onClick={() => setShowMarkModal(false)}
            />
            <Button
              type="submit"
              label={submitting ? 'Saving...' : 'Submit'}
              loading={submitting}
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}

// ─── Admin View ─────────────────────────────────────────────────────────────

function AdminView() {
  const [dateFilter, setDateFilter] = useState(todayISO())
  const [dateRecords, setDateRecords] = useState([])
  const [allRecords, setAllRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)

  // Edit status modal state
  const [editRecord, setEditRecord] = useState(null)
  const [editStatus, setEditStatus] = useState('Present')
  const [editHours, setEditHours] = useState(8)
  const [editSubmitting, setEditSubmitting] = useState(false)

  const loadDateRecords = useCallback(async () => {
    try {
      const data = await getAllAttendance(dateFilter || null)
      setDateRecords(data || [])
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }, [dateFilter])

  const loadAllRecords = useCallback(async () => {
    try {
      const data = await getAllAttendance(null)
      setAllRecords(data || [])
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAllRecords()
  }, [loadAllRecords])

  useEffect(() => {
    loadDateRecords()
  }, [loadDateRecords])

  const handleEditOpen = (record) => {
    setEditRecord(record)
    setEditStatus(record.status)
    setEditHours(record.working_hours ?? 8)
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    if (!editRecord) return
    setEditSubmitting(true)
    setError('')

    try {
      const hours = editStatus === 'Absent' ? 0 : Number(editHours)
      await markAttendance(
        editRecord.employee_id,
        editRecord.attendance_date,
        editStatus,
        hours,
      )
      setEditRecord(null)
      await Promise.all([loadDateRecords(), loadAllRecords()])
    } catch (err) {
      setError(err.message)
    } finally {
      setEditSubmitting(false)
    }
  }

  // ── Date-filtered table ──
  const dateColumns = [
    { key: 'employee_id', label: 'Employee ID' },
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' },
    { key: 'hours', label: 'Working Hours' },
    { key: 'actions', label: 'Actions' },
  ]

  const dateTableData = dateRecords.map((record) => ({
    id: record.id,
    employee_id: record.employees?.employee_id || '-',
    name: record.employees?.name || '-',
    status: (
      <Badge
        label={record.status}
        color={statusColors[record.status] || 'blue'}
      />
    ),
    hours: record.working_hours ?? '-',
    actions: (
      <Button
        label="Edit Status"
        variant="secondary"
        onClick={() => handleEditOpen(record)}
        className="px-3 py-1.5"
      />
    ),
  }))

  // ── All records table with pagination ──
  const allColumns = [
    { key: 'date', label: 'Date' },
    { key: 'employee', label: 'Employee' },
    { key: 'status', label: 'Status' },
    { key: 'hours', label: 'Working Hours' },
  ]

  const totalPages = Math.max(1, Math.ceil(allRecords.length / ITEMS_PER_PAGE))
  const paginatedRecords = allRecords.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  )

  const allTableData = paginatedRecords.map((record) => ({
    id: record.id,
    date: formatDate(record.attendance_date),
    employee: record.employees?.name || record.employee_id || '-',
    status: (
      <Badge
        label={record.status}
        color={statusColors[record.status] || 'blue'}
      />
    ),
    hours: record.working_hours ?? '-',
  }))

  if (loading) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
        Loading attendance data...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* ── Attendance Overview (by date) ── */}
      <Card title="Attendance Overview">
        <div className="mb-4">
          <label
            htmlFor="date-filter"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Filter by date
          </label>
          <input
            id="date-filter"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={`${inputClass} max-w-xs`}
          />
        </div>

        <Table columns={dateColumns} data={dateTableData} />
      </Card>

      {/* ── All Attendance Records (paginated) ── */}
      <Card title="All Attendance Records">
        <Table columns={allColumns} data={allTableData} />

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(page * ITEMS_PER_PAGE, allRecords.length)} of{' '}
              {allRecords.length} records
            </p>
            <div className="flex gap-2">
              <Button
                label="← Previous"
                variant="secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              />
              <Button
                label="Next →"
                variant="secondary"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              />
            </div>
          </div>
        )}
      </Card>

      {/* ── Edit Status Modal ── */}
      <Modal
        isOpen={Boolean(editRecord)}
        onClose={() => setEditRecord(null)}
        title="Edit Attendance Status"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-slate-600">
              Employee:{' '}
              <span className="font-medium text-slate-900">
                {editRecord?.employees?.name || editRecord?.employee_id || '-'}
              </span>
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Date:{' '}
              <span className="font-medium text-slate-900">
                {formatDate(editRecord?.attendance_date)}
              </span>
            </p>
          </div>

          <div>
            <label
              htmlFor="edit-status"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Status
            </label>
            <select
              id="edit-status"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className={inputClass}
            >
              <option value="Present">Present</option>
              <option value="Half Day">Half Day</option>
              <option value="Absent">Absent</option>
              <option value="Holiday">Holiday</option>
            </select>
          </div>

          {editStatus !== 'Absent' && (
            <div>
              <label
                htmlFor="edit-hours"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Working Hours
              </label>
              <input
                id="edit-hours"
                type="number"
                min="0"
                max="12"
                step="0.5"
                value={editHours}
                onChange={(e) => setEditHours(e.target.value)}
                className={inputClass}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              label="Cancel"
              variant="secondary"
              onClick={() => setEditRecord(null)}
            />
            <Button
              type="submit"
              label={editSubmitting ? 'Saving...' : 'Update'}
              loading={editSubmitting}
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}

// ─── Main Attendance Page ───────────────────────────────────────────────────

function Attendance() {
  const { session, userRole, userEmployeeId } = useAuth()

  const [employeeId, setEmployeeId] = useState(null)
  const [resolvedRole, setResolvedRole] = useState(null)
  const [loadingEmployee, setLoadingEmployee] = useState(true)
  const [employeeError, setEmployeeError] = useState('')

  // Resolve the employee record AND effective role from the employees table
  useEffect(() => {
    let isMounted = true

    async function resolveEmployee() {
      try {
        const email = session?.user?.email
        const authUserId = session?.user?.id
        let foundEmployee = null

        // Strategy 1: Look up by email
        if (email) {
          foundEmployee = await getEmployeeByEmail(email)
        }

        // Strategy 2: Use userEmployeeId from auth context directly
        if (!foundEmployee && userEmployeeId) {
          try {
            foundEmployee = await getEmployeeById(userEmployeeId)
          } catch {
            // ID didn't match, continue to fallback
          }
        }

        // Strategy 3: Fetch all employees and fuzzy-match
        if (!foundEmployee) {
          const allEmployees = await getAllEmployees()
          const normalEmail = (email || '').trim().toLowerCase()
          const normalAuthId = (authUserId || '').trim().toLowerCase()
          const normalEmpId = (userEmployeeId || '').trim().toLowerCase()

          foundEmployee =
            allEmployees?.find((emp) => {
              const empEmail = (emp.email || '').trim().toLowerCase()
              const empRowId = (emp.id || '').trim().toLowerCase()
              const empCode = (emp.employee_id || '').trim().toLowerCase()

              return (
                (normalEmail && empEmail === normalEmail) ||
                (normalAuthId &&
                  (empRowId === normalAuthId ||
                    empCode === normalAuthId)) ||
                (normalEmpId &&
                  (empRowId === normalEmpId || empCode === normalEmpId))
              )
            }) || null
        }

        if (foundEmployee) {
          if (isMounted) {
            setEmployeeId(foundEmployee.id)
            setResolvedRole(
              (foundEmployee.role || userRole || '').toLowerCase(),
            )
            setEmployeeError('')
          }
          return
        }

        // No employee record — still set role so admin view works
        if (isMounted) {
          setResolvedRole((userRole || '').toLowerCase())
        }

        throw new Error(
          'No employee record found linked to your account. Please contact your administrator.',
        )
      } catch (err) {
        if (isMounted) {
          setEmployeeError(err.message)
          if (!resolvedRole) {
            setResolvedRole((userRole || '').toLowerCase())
          }
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
  }, [session, userEmployeeId, userRole])

  const isAdmin = resolvedRole === 'admin'
  const isManager = resolvedRole === 'manager'

  const getSubtitle = () => {
    if (isAdmin) return 'View and manage attendance records for all employees.'
    if (isManager)
      return 'Mark your daily attendance and view team attendance overview.'
    return 'Mark your daily attendance and view your history.'
  }

  const renderContent = () => {
    if (loadingEmployee) {
      return (
        <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
          Loading your attendance data...
        </div>
      )
    }

    if (employeeError && !isAdmin && !isManager) {
      return (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {employeeError}
        </div>
      )
    }

    if (isAdmin) {
      return <AdminView />
    }

    if (isManager) {
      return (
        <>
          {/* Manager's own attendance */}
          <EmployeeView employeeId={employeeId} />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-50 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Team Overview
              </span>
            </div>
          </div>

          {/* All employees overview */}
          <AdminView />
        </>
      )
    }

    return <EmployeeView employeeId={employeeId} />
  }

  return (
    <DashboardLayout title="Attendance">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
          <p className="mt-1 text-sm text-slate-500">{getSubtitle()}</p>
        </div>

        {renderContent()}
      </div>
    </DashboardLayout>
  )
}

export default Attendance
