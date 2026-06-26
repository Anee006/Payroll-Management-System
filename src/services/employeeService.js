import { supabase } from './supabaseClient'

export async function getAllEmployees() {
  const { data, error } = await supabase
    .from('employees')
    .select('*, departments(department_name)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getEmployeeById(id) {
  const { data, error } = await supabase
    .from('employees')
    .select('*, departments(department_name)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function addEmployee(employeeData) {
  const { data, error } = await supabase
    .from('employees')
    .insert([employeeData])
    .select()

  if (error) throw error
  return data[0]
}

export async function updateEmployee(id, updates) {
  const { data, error } = await supabase
    .from('employees')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0]
}

export async function deleteEmployee(id) {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getAllDepartments() {
  const { data, error } = await supabase
    .from('departments')
    .select('id, department_name')

  if (error) throw error
  return data
}

export async function getEmployeeByEmail(email) {
  const { data, error } = await supabase
    .from('employees')
    .select('*, departments(department_name)')
    .eq('email', email)
    .maybeSingle()

  if (error) throw error
  return data
}
