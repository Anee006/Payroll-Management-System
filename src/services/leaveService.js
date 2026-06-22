import { supabase } from './supabaseClient'

// Get leave requests for an employee
export async function getLeavesByEmployee(employeeId) {
  console.log('[leaveService] getLeavesByEmployee called with:', employeeId)
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false })
  console.log('[leaveService] getLeavesByEmployee result:', { data, error })
  if (error) throw error
  return data
}

// Get ALL leave requests (Admin/Manager view)
export async function getAllLeaves() {
  // First try a simple select to check if RLS is blocking
  const debug = await supabase.from('leave_requests').select('*')
  console.log('[leaveService] DEBUG simple select:', { data: debug.data, error: debug.error, count: debug.data?.length })

  const { data, error } = await supabase
    .from('leave_requests')
    .select('*, employees!employee_id(name, employee_id)')
    .order('created_at', { ascending: false })
  console.log('[leaveService] getAllLeaves result:', { data, error, count: data?.length })
  if (error) throw error
  return data
}

// Apply for leave
export async function applyLeave(employeeId, startDate, endDate, reason) {
  const { data, error } = await supabase
    .from('leave_requests')
    .insert([{ employee_id: employeeId, start_date: startDate, end_date: endDate, reason }])
    .select()
  if (error) throw error
  return data[0]
}

// Update leave status (Approve/Reject)
export async function updateLeaveStatus(leaveId, status, approvedBy) {
  const { data, error } = await supabase
    .from('leave_requests')
    .update({ status, approved_by: approvedBy })
    .eq('id', leaveId)
    .select()
  if (error) throw error
  return data[0]
}

// Cancel leave (only if Pending)
export async function cancelLeave(leaveId) {
  const { error } = await supabase
    .from('leave_requests')
    .delete()
    .eq('id', leaveId)
    .eq('status', 'Pending')
  if (error) throw error
}
