import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  CreditCard,
  LayoutDashboard,
  Receipt,
  Users,
  Wallet,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Card from '../components/Card'
import SkeletonCard from '../components/SkeletonCard'
import Table from '../components/Table'
import useAuth from '../hooks/useAuth'
import DashboardLayout from '../layouts/DashboardLayout'
import {
  getAttendanceTrend,
  getDashboardStats,
  getDepartmentSalaryData,
  getEmployeeDashboardStats,
  getPayrollTrend,
  getRecentPendingLeaves,
  getTodayAttendance,
} from '../services/dashboardService'
import {
  getAllEmployees,
  getEmployeeByEmail,
  getEmployeeById,
} from '../services/employeeService'
import { getPayrollByEmployeeIdentifiers } from '../services/payrollService'
import { formatCurrency, formatDate } from '../utils/dateHelpers'

const normalizeValue = (value) => String(value || '').trim().toLowerCase()

const formatMonth = (month) => {
  if (!month) return '-'
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${month}-01T00:00:00`))
}

const shortCurrency = (amount) => {
  const value = Number(amount || 0)
  if (value >= 10000000) return `${formatCurrency(value / 10000000)} Cr`
  if (value >= 100000) return `${formatCurrency(value / 100000)} L`
  return formatCurrency(value)
}

const getLeaveDaysTaken = (leaveStats) =>
  leaveStats?.total_leave_days_taken ??
  leaveStats?.leave_days_taken ??
  leaveStats?.approved_leave_days ??
  leaveStats?.total_leave_days ??
  leaveStats?.days_taken ??
  leaveStats?.approved_days ??
  0

const ICON_MAP = {
  users: Users,
  check: CheckCircle2,
  clipboard: ClipboardList,
  wallet: Wallet,
  calendar: CalendarDays,
  calendarCheck: CalendarCheck,
  receipt: Receipt,
  credit: CreditCard,
  clock: Clock,
  dashboard: LayoutDashboard,
}

function StatIcon({ type }) {
  const IconComponent = ICON_MAP[type] || Clock
  return <IconComponent className="h-5 w-5" strokeWidth={1.75} />
}

function StatCard({ title, value, subtitle, icon, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    green: 'bg-green-50 text-green-700 ring-green-600/20',
    yellow: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
    slate: 'bg-slate-50 text-slate-700 ring-slate-300',
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className={`mb-4 inline-flex rounded-md p-2 ring-1 ring-inset ${tones[tone]}`}>
        <StatIcon type={icon} />
      </div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  )
}

function ChartEmptyState({ message }) {
  return (
    <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-500">
      {message}
    </div>
  )
}

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [departmentSalary, setDepartmentSalary] = useState([])
  const [payrollTrend, setPayrollTrend] = useState([])
  const [recentLeaves, setRecentLeaves] = useState([])
  const [todayAttendance, setTodayAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      try {
        const [
          statsData,
          departmentData,
          payrollTrendData,
          recentLeavesData,
          attendanceData,
        ] = await Promise.all([
          getDashboardStats(),
          getDepartmentSalaryData(),
          getPayrollTrend(),
          getRecentPendingLeaves(),
          getTodayAttendance(),
        ])

        if (isMounted) {
          setStats(statsData)
          setDepartmentSalary(departmentData || [])
          setPayrollTrend(payrollTrendData || [])
          setRecentLeaves(recentLeavesData || [])
          setTodayAttendance(attendanceData || [])
          setError('')
        }
      } catch (err) {
        if (isMounted) setError(err.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  const departmentChartData = useMemo(
    () =>
      departmentSalary.map((row) => ({
        department_name:
          row.department_name || row.department || row.name || 'Unassigned',
        total_monthly_cost: Number(
          row.total_monthly_cost || row.total_salary || row.salary || 0,
        ),
      })),
    [departmentSalary],
  )

  const payrollChartData = useMemo(
    () =>
      payrollTrend.map((row) => ({
        month: formatMonth(row.month),
        total_net_salary: Number(row.total_net_salary || 0),
        employee_count: Number(row.employee_count || 0),
      })),
    [payrollTrend],
  )

  const leaveColumns = [
    { key: 'employee', label: 'Employee' },
    { key: 'dates', label: 'Dates' },
    { key: 'reason', label: 'Reason' },
  ]

  const leaveTableData = recentLeaves.map((leave) => ({
    id: leave.id,
    employee: leave.employees?.name || leave.employee_id || '-',
    dates: `${formatDate(leave.start_date)} - ${formatDate(leave.end_date)}`,
    reason: (
      <span className="line-clamp-2 max-w-xs" title={leave.reason}>
        {leave.reason}
      </span>
    ),
  }))

  const attendanceColumns = [
    { key: 'employee', label: 'Employee' },
    { key: 'employeeId', label: 'Employee ID' },
    { key: 'status', label: 'Status' },
    { key: 'hours', label: 'Working Hours' },
  ]

  const statusColors = {
    Present: 'bg-green-50 text-green-700 ring-green-600/20',
    Absent: 'bg-red-50 text-red-700 ring-red-600/20',
    'Half Day': 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
    Holiday: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  }

  const attendanceTableData = todayAttendance.map((record) => ({
    id: record.id,
    employee: record.employees?.name || record.employee_id || '-',
    employeeId: record.employees?.employee_id || '-',
    status: (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
          statusColors[record.status] || 'bg-slate-50 text-slate-600 ring-slate-300'
        }`}
      >
        {record.status}
      </span>
    ),
    hours: record.working_hours ?? '-',
  }))

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard
              title="Total Employees"
              value={stats?.totalEmployees ?? 0}
              icon="users"
              tone="blue"
            />
            <StatCard
              title="Present Today"
              value={stats?.todayPresent ?? 0}
              icon="check"
              tone="green"
            />
            <StatCard
              title="Pending Leaves"
              value={stats?.pendingLeaves ?? 0}
              icon="clipboard"
              tone="yellow"
            />
            <StatCard
              title="Monthly Payroll"
              value={formatCurrency(stats?.latestMonthPayroll)}
              subtitle={formatMonth(stats?.latestMonth)}
              icon="wallet"
              tone="slate"
            />
          </>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Department Salary Distribution">
          {departmentChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department_name" />
                <YAxis tickFormatter={shortCurrency} width={80} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar
                  dataKey="total_monthly_cost"
                  name="Monthly Cost"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState message="No salary distribution data yet." />
          )}
        </Card>

        <Card title="Payroll Trend">
          {payrollChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={payrollChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={shortCurrency} width={80} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total_net_salary"
                  name="Net Salary"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState message="No payroll trend data yet." />
          )}
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Recent Leave Requests">
          <Table columns={leaveColumns} data={leaveTableData} />
        </Card>
        <Card title="Today's Attendance">
          <Table columns={attendanceColumns} data={attendanceTableData} />
        </Card>
      </div>
    </div>
  )
}

function EmployeeDashboard({ employee, payrollIdentifiers }) {
  const [dashboardStats, setDashboardStats] = useState(null)
  const [attendanceTrend, setAttendanceTrend] = useState([])
  const [payslips, setPayslips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadEmployeeDashboard() {
      try {
        const [statsData, attendanceData, payslipData] = await Promise.all([
          getEmployeeDashboardStats(employee.id),
          getAttendanceTrend(employee.id),
          getPayrollByEmployeeIdentifiers(payrollIdentifiers),
        ])

        if (isMounted) {
          setDashboardStats(statsData)
          setAttendanceTrend(attendanceData || [])
          setPayslips((payslipData || []).slice(0, 3))
          setError('')
        }
      } catch (err) {
        if (isMounted) setError(err.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadEmployeeDashboard()

    return () => {
      isMounted = false
    }
  }, [employee.id, payrollIdentifiers])

  const attendancePercentage =
    dashboardStats?.attendanceSummary?.attendance_percentage ?? 0
  const leaveDaysTaken = getLeaveDaysTaken(dashboardStats?.leaveStats)
  const latestPayslipMonth = payslips[0]?.month

  const attendanceChartData = useMemo(() => {
    const counts = { Present: 0, Absent: 0, 'Half Day': 0 }

    attendanceTrend.forEach((record) => {
      if (counts[record.status] !== undefined) counts[record.status] += 1
    })

    return Object.entries(counts).map(([status, count]) => ({ status, count }))
  }, [attendanceTrend])

  const payslipColumns = [
    { key: 'month', label: 'Month' },
    { key: 'basic', label: 'Basic' },
    { key: 'bonus', label: 'Bonus' },
    { key: 'deductions', label: 'Deductions' },
    { key: 'net', label: 'Net Salary' },
  ]

  const payslipTableData = payslips.map((record) => ({
    id: record.id,
    month: formatMonth(record.month),
    basic: formatCurrency(record.basic_salary),
    bonus: formatCurrency(record.bonus),
    deductions: formatCurrency(record.deductions),
    net: formatCurrency(
      record.net_salary ??
        Number(record.basic_salary || 0) +
          Number(record.bonus || 0) -
          Number(record.deductions || 0),
    ),
  }))

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard
              title="Attendance %"
              value={`${Number(attendancePercentage || 0).toFixed(1)}%`}
              icon="check"
              tone="green"
            />
            <StatCard
              title="Leave Days Taken"
              value={leaveDaysTaken}
              icon="clipboard"
              tone="yellow"
            />
            <StatCard
              title="Current Salary"
              value={formatCurrency(employee.salary)}
              icon="wallet"
              tone="blue"
            />
            <StatCard
              title="Latest Payslip"
              value={formatMonth(latestPayslipMonth)}
              subtitle="Most recent payroll month"
              icon="wallet"
              tone="slate"
            />
          </>
        )}
      </div>

      <Card title="Personal Attendance Last 30 Days">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={attendanceChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" name="Days" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="My Recent Payslips">
        <Table columns={payslipColumns} data={payslipTableData} />
      </Card>
    </div>
  )
}

function Dashboard() {
  const { session, userRole, userEmployeeId } = useAuth()

  const [employee, setEmployee] = useState(null)
  const [resolvedRole, setResolvedRole] = useState(null)
  const [loadingEmployee, setLoadingEmployee] = useState(true)
  const [employeeError, setEmployeeError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function resolveEmployee() {
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
          const allEmployees = await getAllEmployees()
          const normalEmail = normalizeValue(email)
          const normalAuthId = normalizeValue(authUserId)
          const normalEmployeeId = normalizeValue(userEmployeeId)

          foundEmployee =
            allEmployees?.find((emp) => {
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

        if (foundEmployee) {
          if (isMounted) {
            setEmployee(foundEmployee)
            setResolvedRole((foundEmployee.role || userRole || '').toLowerCase())
            setEmployeeError('')
          }
          return
        }

        if (isMounted) {
          setResolvedRole((userRole || '').toLowerCase())
        }

        throw new Error(
          'No employee record found linked to your account. Please contact your administrator.',
        )
      } catch (err) {
        if (isMounted) {
          setEmployeeError(err.message)
          setResolvedRole((userRole || '').toLowerCase())
        }
      } finally {
        if (isMounted) setLoadingEmployee(false)
      }
    }

    resolveEmployee()

    return () => {
      isMounted = false
    }
  }, [session, userEmployeeId, userRole])

  const effectiveRole = resolvedRole || (userRole || '').toLowerCase()
  const isAdmin = effectiveRole === 'admin'

  const payrollIdentifiers = useMemo(
    () =>
      [
        employee?.id,
        employee?.employee_id,
        userEmployeeId,
        session?.user?.id,
      ].filter(Boolean),
    [employee, session, userEmployeeId],
  )

  const renderContent = () => {
    if (loadingEmployee) {
      return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )
    }

    if (employeeError && !isAdmin) {
      return (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {employeeError}
        </div>
      )
    }

    if (isAdmin) return <AdminDashboard />

    return (
      <EmployeeDashboard
        employee={employee}
        payrollIdentifiers={payrollIdentifiers}
      />
    )
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAdmin
              ? 'Monitor attendance, leaves, payroll, and department salary trends.'
              : 'Track your attendance, leave usage, salary, and recent payslips.'}
          </p>
        </div>

        {renderContent()}
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
