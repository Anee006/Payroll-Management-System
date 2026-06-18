import { supabase } from './supabaseClient'

// Login 
export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

// Logout 
export async function logoutUser() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Check current session
export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

// Get user role from public.users table
export async function getUserRole(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('role, employee_id')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

// subscription for real-time auth state updates
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
}