const colors = {
  green: 'bg-green-100 text-green-700 ring-green-600/20',
  red: 'bg-red-100 text-red-700 ring-red-600/20',
  yellow: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
  blue: 'bg-blue-100 text-blue-700 ring-blue-600/20',
}

function Badge({ label, color = 'blue' }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${colors[color]}`}>
      {label}
    </span>
  )
}

export default Badge
