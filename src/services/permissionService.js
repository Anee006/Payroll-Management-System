import { supabase } from './supabaseClient'

// Get all roles
export async function getAllRoles() {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .order('id')
  if (error) throw error
  return data
}

// Get all permissions
export async function getAllPermissions() {
  const { data, error } = await supabase
    .from('permissions')
    .select('*')
    .order('module', { ascending: true })
  if (error) throw error
  return data
}

// Get permissions for a specific role
export async function getRolePermissions(roleId) {
  const { data, error } = await supabase
    .from('role_permissions')
    .select('permission_id, permissions(id, name, module, action, description)')
    .eq('role_id', roleId)
  if (error) throw error
  return data.map((rp) => rp.permissions)
}

// Get permissions for the currently logged-in user (by their role_id)
export async function getMyPermissions(userId) {
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role_id')
    .eq('id', userId)
    .single()
  if (userError) throw userError

  return await getRolePermissions(userData.role_id)
}

// Assign a permission to a role
export async function assignPermission(roleId, permissionId) {
  const { data, error } = await supabase
    .from('role_permissions')
    .insert([{ role_id: roleId, permission_id: permissionId }])
    .select()
  if (error) throw error
  return data[0]
}

// Remove a permission from a role
export async function removePermission(roleId, permissionId) {
  const { error } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role_id', roleId)
    .eq('permission_id', permissionId)
  if (error) throw error
}

// Create a new role
export async function createRole(name, description = '') {
  const { data, error } = await supabase
    .from('roles')
    .insert([{ name, description }])
    .select()
  if (error) throw error
  return data[0]
}

// Update a role
export async function updateRole(id, updates) {
  const { data, error } = await supabase
    .from('roles')
    .update(updates)
    .eq('id', id)
    .select()
  if (error) throw error
  return data[0]
}

// Delete a role (only if no users are assigned to it)
export async function deleteRole(id) {
  const { count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role_id', id)
  if (count > 0)
    throw new Error('Cannot delete role: users are still assigned to it')

  const { error } = await supabase.from('roles').delete().eq('id', id)
  if (error) throw error
}
