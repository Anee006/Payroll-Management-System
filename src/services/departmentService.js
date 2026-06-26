import { supabase } from './supabaseClient'

export async function getAllDepartmentsWithStats() {
  const { data, error } = await supabase
    .from('departments')
    .select('*, employees(id, salary)')
    .order('department_name', { ascending: true })

  if (error) throw error

  return (data || []).map((dept) => {
    const employees = dept.employees || []
    const totalSalary = employees.reduce(
      (sum, employee) => sum + Number(employee.salary || 0),
      0,
    )

    return {
      ...dept,
      employee_count: employees.length,
      total_salary: totalSalary,
      avg_salary:
        employees.length > 0 ? Math.round(totalSalary / employees.length) : 0,
    }
  })
}

export async function addDepartment(name, head) {
  const { data, error } = await supabase
    .from('departments')
    .insert([{ department_name: name, department_head: head }])
    .select()

  if (error) throw error
  return data[0]
}

export async function updateDepartment(id, updates) {
  const { data, error } = await supabase
    .from('departments')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0]
}
