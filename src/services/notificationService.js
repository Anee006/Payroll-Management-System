import { supabase } from './supabaseClient'

// Get notifications for the logged-in user
export async function getMyNotifications() {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30)
  if (error) throw error
  return data
}

// Get unread count for the bell badge
export async function getUnreadCount() {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'unread')
  if (error) throw error
  return count ?? 0
}

// Mark a single notification as read
export async function markNotificationRead(id) {
  const { error } = await supabase
    .from('notifications')
    .update({ status: 'read' })
    .eq('id', id)
  if (error) throw error
}

// Mark all notifications as read
export async function markAllNotificationsRead() {
  const { error } = await supabase
    .from('notifications')
    .update({ status: 'read' })
    .eq('status', 'unread')
  if (error) throw error
}

// Send a notification to a user (by their auth user ID)
export async function sendNotification(
  receiverId,
  title,
  message,
  type = 'info',
  relatedId = null,
) {
  const { error } = await supabase.from('notifications').insert([
    {
      receiver_id: receiverId,
      title,
      message,
      type,
      related_id: relatedId,
    },
  ])
  if (error) console.error('Notification send error:', error.message)
}

// Send notification to ALL users
export async function broadcastNotification(title, message, type = 'info') {
  const { data: users } = await supabase.from('users').select('id')
  if (!users) return
  const inserts = users.map((u) => ({
    receiver_id: u.id,
    title,
    message,
    type,
  }))
  const { error } = await supabase.from('notifications').insert(inserts)
  if (error) console.error('Broadcast notification error:', error.message)
}
