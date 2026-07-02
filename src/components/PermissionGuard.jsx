// This component will hide children if user doesn't have the required permission.
// Shell version — always renders children for now, Akshit hooks it up on Day 3.

export default function PermissionGuard({ permission, children, fallback = null }) {
  void permission
  void fallback

  // TODO (Akshit Day 3): replace with real permission check
  // const { can } = usePermissionContext()
  // if (!can(permission)) return fallback

  return children
}
