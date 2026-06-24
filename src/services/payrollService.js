import { supabase } from './supabaseClient'

// Get all payroll records (admin)
export async function getAllPayroll() {
  const { data, error } = await supabase
    .from('payroll')
    .select('*, employees(name, employee_id, departments(department_name))')
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
  return data[0]
}

// Delete payroll record
export async function deletePayroll(id) {
  const { error } = await supabase.from('payroll').delete().eq('id', id)

  if (error) throw error
}
