import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import {
  getMyNotifications,
  getUnreadCount,
  markNotificationRead,
} from '../services/notificationService'
import useAuth from '../hooks/useAuth'

export default function NotificationBell() {
  const { session } = useAuth()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  const loadNotifications = useCallback(async () => {
    if (!session) return
    try {
      const [notifs, count] = await Promise.all([
        getMyNotifications(),
        getUnreadCount()
      ])
      setNotifications(notifs.slice(0, 5)) // show latest 5 in dropdown
      setUnreadCount(count)
    } catch {
      // fail silently — bell is non-critical
    }
  }, [session])

  // Load on mount, then poll every 30 seconds for new notifications
  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [loadNotifications])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleNotifClick(notif) {
    if (notif.status === 'unread') {
      await markNotificationRead(notif.id)
      setUnreadCount(prev => Math.max(0, prev - 1))
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, status: 'read' } : n))
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white
                           text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
          <div className="flex justify-between items-center px-4 py-3 border-b">
            <p className="font-semibold text-gray-700 text-sm">Notifications</p>
            <span className="text-xs text-gray-400">{unreadCount} new</span>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
            {notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => handleNotifClick(notif)}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer
                  ${notif.status === 'unread' ? 'bg-blue-50/50' : ''}`}
              >
                <p className="text-sm font-medium text-gray-700">{notif.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{notif.message}</p>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t">
            <button
              onClick={() => { navigate('/notifications'); setOpen(false) }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium w-full text-center"
            >
              View all notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
