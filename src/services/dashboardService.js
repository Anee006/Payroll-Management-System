import { supabase } from './supabaseClient'

const todayISO = () => new Date().toISOString().split('T')[0]

const assertResponse = (response) => {
  if (response.error) throw response.error
  return response
}

export async function getDashboardStats() {
  const [
    employeesResponse,
    attendanceResponse,
    leavesResponse,
    payrollResponse,
  ] = await Promise.all([
    supabase.from('employees').select('*', { count: 'exact', head: true }),
    supabase
      .from('attendance')
      .select('*', { count: 'exact' })
      .eq('attendance_date', todayISO())
      .in('status', ['Present', 'Half Day']),
    supabase
      .from('leave_requests')
      .select('*', { count: 'exact' })
      .eq('status', 'Pending'),
    supabase
      .from('payroll_summary')
      .select('*')
      .order('month', { ascending: false })
      .limit(1),
  ])

  assertResponse(employeesResponse)
  assertResponse(attendanceResponse)
  assertResponse(leavesResponse)
  assertResponse(payrollResponse)

  return {
    totalEmployees: employeesResponse.count ?? 0,
    todayPresent:
      attendanceResponse.count ?? attendanceResponse.data?.length ?? 0,
    pendingLeaves: leavesResponse.count ?? leavesResponse.data?.length ?? 0,
    latestMonthPayroll:
      payrollResponse.data?.[0]?.total_net_salary ??
      payrollResponse.data?.[0]?.net_salary ??
      0,
    latestMonth: payrollResponse.data?.[0]?.month ?? '-',
  }
}

export async function getDepartmentSalaryData() {
  const { data, error } = await supabase.rpc(
    'get_department_salary_analysis',
  )
  if (error) throw error
  return data
}

export async function getPayrollTrend() {
  const { data, error } = await supabase
    .from('payroll_summary')
    .select('month, total_net_salary, employee_count')
    .order('month', { ascending: true })
    .limit(6)

  if (error) throw error
  return data
}

export async function getAttendanceTrend(employeeId = null) {
  let query = supabase
    .from('attendance')
    .select('attendance_date, status')
    .order('attendance_date', { ascending: false })
    .limit(30)

  if (employeeId) query = query.eq('employee_id', employeeId)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getRecentPendingLeaves() {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*, employees!employee_id(name, employee_id)')
    .eq('status', 'Pending')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) throw error
  return data
}

export async function getTodayAttendance() {
  const { data, error } = await supabase
    .from('attendance')
    .select('*, employees(name, employee_id)')
    .eq('attendance_date', todayISO())
    .order('status', { ascending: true })

  if (error) throw error
  return data
}

export async function getEmployeeDashboardStats(employeeId) {
  const [
    attendanceSummaryResponse,
    leaveStatsResponse,
  ] = await Promise.all([
    supabase
      .from('attendance_summary')
      .select('*')
      .eq('employee_id', employeeId)
      .maybeSingle(),
    supabase
      .from('employee_leave_stats')
      .select('*')
      .eq('employee_id', employeeId)
      .maybeSingle(),
  ])

  assertResponse(attendanceSummaryResponse)
  assertResponse(leaveStatsResponse)

  return {
    attendanceSummary: attendanceSummaryResponse.data,
    leaveStats: leaveStatsResponse.data,
  }
}
