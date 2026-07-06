import { User, Leaf, Wallet, ClipboardCheck, ShieldCheck, Pin } from 'lucide-react'

const moduleConfig = {
  employees:  { icon: User,           color: 'bg-blue-100 text-blue-600' },
  leave:      { icon: Leaf,           color: 'bg-green-100 text-green-600' },
  payroll:    { icon: Wallet,         color: 'bg-purple-100 text-purple-600' },
  attendance: { icon: ClipboardCheck, color: 'bg-yellow-100 text-yellow-600' },
  roles:      { icon: ShieldCheck,    color: 'bg-red-100 text-red-600' },
}

const defaultConfig = { icon: Pin, color: 'bg-gray-100 text-gray-500' }

export default function ActivityTimeline({ activities = [], loading = false }) {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="h-2 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No recent activity
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />

      <div className="space-y-5">
        {activities.map((activity) => {
          const config = moduleConfig[activity.module] ?? defaultConfig
          const Icon = config.icon
          const time = new Date(activity.created_at)
          const timeStr = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
          const dateStr = time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })

          return (
            <div key={activity.id} className="flex gap-3 relative">
              {/* Icon dot */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${config.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              {/* Content */}
              <div className="flex-1 pb-1">
                <p className="text-sm font-medium text-gray-700">{activity.action}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {activity.user_email} · {timeStr}, {dateStr}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
