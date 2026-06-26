import { useEffect, useMemo, useState } from 'react'
import Card from '../components/Card'
import Table from '../components/Table'
import useAuth from '../hooks/useAuth'
import DashboardLayout from '../layouts/DashboardLayout'
import { getEmployeeDashboardStats } from '../services/dashboardService'
import {
  getAllEmployees,
  getEmployeeByEmail,
  getEmployeeById,
} from '../services/employeeService'
import { formatCurrency, formatDate } from '../utils/dateHelpers'

const normalizeValue = (value) => String(value || '').trim().toLowerCase()

const getLeaveStat = (stats, keys) => {
  for (const key of keys) {
    if (stats?.[key] != null) return stats[key]
  }

  return 0
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value || '-'}</p>
    </div>
  )
}

function Profile() {
  const { session, userRole, userEmployeeId } = useAuth()

  const [employee, setEmployee] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      try {
        const email = session?.user?.email
        const authUserId = session?.user?.id
        let foundEmployee = null

        if (email) {
          foundEmployee = await getEmployeeByEmail(email)
        }

        if (!foundEmployee && userEmployeeId) {
          try {
            foundEmployee = await getEmployeeById(userEmployeeId)
          } catch {
            // Continue to fallback lookup.
          }
        }

        if (!foundEmployee) {
          const employees = await getAllEmployees()
          const normalEmail = normalizeValue(email)
          const normalAuthId = normalizeValue(authUserId)
          const normalEmployeeId = normalizeValue(userEmployeeId)

          foundEmployee =
            employees?.find((emp) => {
              const empEmail = normalizeValue(emp.email)
              const empRowId = normalizeValue(emp.id)
              const empCode = normalizeValue(emp.employee_id)

              return (
                (normalEmail && empEmail === normalEmail) ||
                (normalAuthId &&
                  (empRowId === normalAuthId || empCode === normalAuthId)) ||
                (normalEmployeeId &&
                  (empRowId === normalEmployeeId ||
                    empCode === normalEmployeeId))
              )
            }) || null
        }

        if (!foundEmployee) {
          throw new Error(
            'No employee record found linked to your account. Please contact your administrator.',
          )
        }

        const dashboardStats = await getEmployeeDashboardStats(foundEmployee.id)

        if (isMounted) {
          setEmployee(foundEmployee)
          setStats(dashboardStats)
          setError('')
        }
      } catch (err) {
        if (isMounted) setError(err.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [session, userEmployeeId])

  const attendancePercentage =
    stats?.attendanceSummary?.attendance_percentage ?? 0

  const leaveStats = useMemo(() => stats?.leaveStats || {}, [stats])

  const leaveSummary = useMemo(
    () => [
      {
        id: 'taken',
        metric: 'Leave Days Taken',
        value: getLeaveStat(leaveStats, [
          'total_leave_days_taken',
          'leave_days_taken',
          'approved_leave_days',
          'total_leave_days',
          'days_taken',
        ]),
      },
      {
        id: 'pending',
        metric: 'Pending Requests',
        value: getLeaveStat(leaveStats, [
          'pending_leaves',
          'pending_count',
          'pending',
        ]),
      },
      {
        id: 'approved',
        metric: 'Approved Requests',
        value: getLeaveStat(leaveStats, [
          'approved_leaves',
          'approved_count',
          'approved',
        ]),
      },
      {
        id: 'rejected',
        metric: 'Rejected Requests',
        value: getLeaveStat(leaveStats, [
          'rejected_leaves',
          'rejected_count',
          'rejected',
        ]),
      },
    ],
    [leaveStats],
  )

  const leaveColumns = [
    { key: 'metric', label: 'Metric' },
    { key: 'value', label: 'Value' },
  ]

  return (
    <DashboardLayout title="My Profile">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="mt-1 text-sm text-slate-500">
            View your employee record, attendance summary, and leave stats.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
            Loading profile...
          </div>
        ) : (
          <>
            <Card title="Employee Details">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <DetailItem label="Name" value={employee?.name} />
                <DetailItem label="Email" value={employee?.email} />
                <DetailItem
                  label="Department"
                  value={employee?.departments?.department_name}
                />
                <DetailItem label="Role" value={employee?.role || userRole} />
                <DetailItem
                  label="Salary"
                  value={formatCurrency(employee?.salary)}
                />
                <DetailItem
                  label="Joining Date"
                  value={formatDate(employee?.joining_date)}
                />
              </div>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <p className="text-sm font-medium text-slate-500">
                  Attendance Percentage
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {Number(attendancePercentage || 0).toFixed(1)}%
                </p>
              </Card>
              <Card>
                <p className="text-sm font-medium text-slate-500">
                  Leave Days Taken
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {leaveSummary[0].value}
                </p>
              </Card>
            </div>

            <Card title="Leave Stats">
              <Table columns={leaveColumns} data={leaveSummary} />
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Profile
