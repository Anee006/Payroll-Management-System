import { useEffect, useState } from 'react'

const typeStyles = {
  success:
    'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25',
  error:
    'bg-red-600 text-white shadow-lg shadow-red-500/25',
  info:
    'bg-blue-600 text-white shadow-lg shadow-blue-500/25',
}

const typeIcons = {
  success: (
    <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

/**
 * Toast notification component.
 *
 * Props:
 *  - message  (string)           — Text to display
 *  - type     ('success'|'error'|'info') — Visual style
 *  - onClose  (function)         — Called when the toast should be dismissed
 *  - duration (number, optional) — Auto-dismiss delay in ms (default 3000)
 */
function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    // Trigger enter animation on next frame
    const enterTimer = requestAnimationFrame(() => setVisible(true))

    const dismissTimer = setTimeout(() => {
      setExiting(true)
      setTimeout(() => onClose?.(), 300) // wait for exit animation
    }, duration)

    return () => {
      cancelAnimationFrame(enterTimer)
      clearTimeout(dismissTimer)
    }
  }, [duration, onClose])

  const handleClose = () => {
    setExiting(true)
    setTimeout(() => onClose?.(), 300)
  }

  return (
    <div
      role="alert"
      className={`fixed right-6 top-6 z-[9999] flex max-w-sm items-center gap-3 rounded-xl px-5 py-3.5 text-sm font-medium transition-all duration-300 ${
        typeStyles[type] || typeStyles.info
      } ${visible && !exiting ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
    >
      {typeIcons[type] || typeIcons.info}
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={handleClose}
        className="ml-2 rounded-md p-1 opacity-80 transition hover:opacity-100"
        aria-label="Dismiss notification"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export default Toast
