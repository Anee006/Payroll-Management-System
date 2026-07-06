import { supabase } from './supabaseClient'
import { sendNotification } from './notificationService'

// Get leave requests for an employee
export async function getLeavesByEmployee(employeeId) {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// Get ALL leave requests (Admin/Manager view)
// Joins requester name + role via employee_id FK
export async function getAllLeaves() {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*, employees!employee_id(name, employee_id, email, role)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// Apply for leave
export async function applyLeave(employeeId, startDate, endDate, reason) {
  const { data, error } = await supabase
    .from('leave_requests')
    .insert([
      {
        employee_id: employeeId,
        start_date: startDate,
        end_date: endDate,
        reason,
      },
    ])
    .select()
  if (error) throw error
  return data[0]
}

// Update leave status (Approve/Reject)
// Throws if RLS silently blocks the update (returns 0 rows).
export async function updateLeaveStatus(leaveId, status, approvedBy) {
  const { data, error } = await supabase
    .from('leave_requests')
    .update({ status, approved_by: approvedBy })
    .eq('id', leaveId)
    .select()
  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error(
      'Update was blocked — you may not have permission to approve/reject this leave. Please contact your administrator.',
    )
  }

  // Send notification to the employee who applied for leave
  try {
    const { data: leaveData } = await supabase
      .from('leave_requests')
      .select('employee_id, employees(email)')
      .eq('id', leaveId)
      .single()

    if (leaveData?.employees?.email) {
      const { data: receiverUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', leaveData.employees.email)
        .single()

      if (receiverUser) {
        await sendNotification(
          receiverUser.id,
          status === 'Approved' ? 'Leave Approved' : 'Leave Rejected',
          `Your leave request has been ${status.toLowerCase()}.`,
          'leave',
          leaveId,
        )
      }
    }
  } catch {
    // Don't fail the leave update if notification fails
  }

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
