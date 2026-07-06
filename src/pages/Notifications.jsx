import { useEffect, useState } from 'react'
import {
  Bell,
  Leaf,
  Wallet,
  ClipboardCheck,
  ShieldCheck,
  Megaphone,
} from 'lucide-react'
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/notificationService'

const typeConfig = {
  leave: { icon: Leaf, color: 'bg-green-100 text-green-600' },
  payroll: { icon: Wallet, color: 'bg-purple-100 text-purple-600' },
  attendance: { icon: ClipboardCheck, color: 'bg-yellow-100 text-yellow-600' },
  roles: { icon: ShieldCheck, color: 'bg-blue-100 text-blue-600' },
}

const defaultConfig = { icon: Megaphone, color: 'bg-gray-100 text-gray-600' }

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all') // 'all' | 'unread' | 'read'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyNotifications().then(data => {
      setNotifications(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = notifications.filter(n =>
    filter === 'all' ? true : n.status === filter
  )

  const unreadCount = notifications.filter(n => n.status === 'unread').length

  async function markAllRead() {
    await markAllNotificationsRead()
    setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })))
  }

  async function markRead(id) {
    await markNotificationRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n))
  }

  if (loading) {
    return (
      <div className="p-6 animate-pulse space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm text-blue-600 hover:text-blue-800">
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {['all', 'unread', 'read'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize font-medium transition
              ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Bell className="w-10 h-10 mx-auto mb-2 stroke-gray-300" />
            <p>No notifications</p>
          </div>
        ) : (
          filtered.map(notif => {
            const config = typeConfig[notif.type] ?? defaultConfig
            const Icon = config.icon
            return (
              <div
                key={notif.id}
                onClick={() => markRead(notif.id)}
                className={`flex gap-4 p-4 rounded-xl border cursor-pointer transition
                  ${notif.status === 'unread'
                    ? 'bg-blue-50 border-blue-100 hover:bg-blue-100'
                    : 'bg-white border-gray-100 hover:bg-gray-50'
                  }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${config.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <p className={`text-sm font-medium ${notif.status === 'unread' ? 'text-gray-800' : 'text-gray-600'}`}>
                      {notif.title}
                    </p>
                    {notif.status === 'unread' && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
