import { supabase } from './supabaseClient'
import { sendNotification } from './notificationService'

const payrollWithEmployeeSelect =
  '*, employees(id, name, employee_id, joining_date, departments(department_name))'

const normalizeValue = (value) => String(value || '').trim().toLowerCase()

const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || ''),
  )

const matchesEmployeeIdentifier = (record, identifiers) => {
  const normalizedIdentifiers = identifiers.map(normalizeValue).filter(Boolean)

  return normalizedIdentifiers.some((identifier) =>
    [
      record.employee_id,
      record.employees?.id,
      record.employees?.employee_id,
    ]
      .map(normalizeValue)
      .includes(identifier),
  )
}

// Get all payroll records (admin)
export async function getAllPayroll() {
  const { data, error } = await supabase
    .from('payroll')
    .select(payrollWithEmployeeSelect)
    .order('generated_at', { ascending: false })

  if (error) throw error
  return data
}

// Get payroll for a specific employee
export async function getPayrollByEmployee(employeeId) {
  const { data, error } = await supabase
    .from('payroll')
    .select('*')
    .eq('employee_id', employeeId)
    .order('month', { ascending: false })

  if (error) throw error
  return data
}

// Get payroll for the signed-in employee using all known app/auth identifiers.
export async function getPayrollByEmployeeIdentifiers(identifiers = []) {
  const uniqueIdentifiers = [...new Set(identifiers.filter(Boolean))]
  const uuidIdentifiers = uniqueIdentifiers.filter(isUuid)

  if (uuidIdentifiers.length > 0) {
    const { data, error } = await supabase
      .from('payroll')
      .select(payrollWithEmployeeSelect)
      .in('employee_id', uuidIdentifiers)
      .order('month', { ascending: false })

    if (error) throw error

    if (data?.length) {
      return data
    }
  }

  const { data, error } = await supabase
    .from('payroll')
    .select(payrollWithEmployeeSelect)
    .order('month', { ascending: false })

  if (error) throw error

  return (data || []).filter((record) =>
    matchesEmployeeIdentifier(record, uniqueIdentifiers),
  )
}

// Generate payroll for an employee for a month
export async function generatePayroll(
  employeeId,
  month,
  basicSalary,
  bonus,
  deductions,
) {
  const { data, error } = await supabase
    .from('payroll')
    .upsert(
      {
        employee_id: employeeId,
        month,
        basic_salary: basicSalary,
        bonus,
        deductions,
      },
      { onConflict: 'employee_id,month' },
    )
    .select()

  if (error) throw error

  // Send notification to the employee
  try {
    const { data: emp } = await supabase
      .from('employees')
      .select('email')
      .eq('id', employeeId)
      .single()
    if (emp?.email) {
      const { data: empUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', emp.email)
        .single()
      if (empUser) {
        await sendNotification(
          empUser.id,
          'Payroll Generated',
          `Your payslip for ${month} is ready.`,
          'payroll',
        )
      }
    }
  } catch {
    // Don't fail payroll if notification fails
  }

  return data[0]
}

// Delete payroll record
export async function deletePayroll(id) {
  const { error } = await supabase.from('payroll').delete().eq('id', id)

  if (error) throw error
}
