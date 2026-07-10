import { Check } from 'lucide-react'

export default function WorkflowStatusBar({
  steps,
  currentStep,
  type = 'payroll',
}) {
  const currentIndex = steps.indexOf(currentStep)
  const activeColor = type === 'payroll' ? 'bg-purple-600' : 'bg-green-600'
  const activeText = type === 'payroll' ? 'text-purple-600' : 'text-green-600'
  const activeBorder =
    type === 'payroll' ? 'border-purple-600' : 'border-green-600'

  return (
    <div className="flex items-center w-full">
      {steps.map((step, idx) => {
        const isDone = idx < currentIndex
        const isCurrent = idx === currentIndex

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                  isDone
                    ? `${activeColor} border-transparent text-white`
                    : isCurrent
                      ? `bg-white ${activeBorder} ${activeText}`
                      : 'bg-gray-100 border-gray-200 text-gray-400'
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={`text-[10px] mt-1 whitespace-nowrap font-medium ${
                  isCurrent
                    ? activeText
                    : isDone
                      ? 'text-gray-500'
                      : 'text-gray-300'
                }`}
              >
                {step}
              </span>
            </div>
            {/* Connector line */}
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 mb-4 transition-all ${
                  isDone ? activeColor : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
