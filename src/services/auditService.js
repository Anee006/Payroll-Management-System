import { supabase } from './supabaseClient'

// Log an action manually from the frontend
export async function logAction(action, module, recordId = null, details = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return

  const { error } = await supabase.from('audit_logs').insert([
    {
      user_id: session.user.id,
      user_email: session.user.email,
      action,
      module,
      record_id: recordId?.toString() ?? null,
      details,
    },
  ])
  if (error) console.error('Audit log error:', error.message)
}

// Get all audit logs (admin only)
export async function getAllAuditLogs(limit = 50) {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

// Get audit logs by module
export async function getAuditLogsByModule(module) {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('module', module)
    .order('created_at', { ascending: false })
    .limit(30)
  if (error) throw error
  return data
}
