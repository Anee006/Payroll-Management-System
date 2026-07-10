import Button from './Button'
import WorkflowStatusBar from './WorkflowStatusBar'
import { formatCurrency, formatDate } from '../utils/dateHelpers'

const PAYROLL_STEPS = ['Draft', 'Pending Approval', 'Approved', 'Released']

const getDepartmentName = (employeeRecord) =>
  employeeRecord?.departments?.department_name ||
  employeeRecord?.department_name ||
  '-'

const getNetSalary = (payrollRecord) => {
  if (!payrollRecord) return 0
  return (
    payrollRecord.net_salary ??
    Number(payrollRecord.basic_salary || 0) +
      Number(payrollRecord.bonus || 0) -
      Number(payrollRecord.deductions || 0)
  )
}

const formatPayrollMonth = (month) => {
  if (!month) return '-'
  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${month}-01T00:00:00`))
}

function Payslip({ payrollRecord, employeeRecord, onClose }) {
  if (!payrollRecord) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 px-4 py-8">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden !important;
            }

            .payslip-print-root,
            .payslip-print-root * {
              visibility: visible !important;
            }

            .payslip-print-root {
              position: absolute !important;
              inset: 0 auto auto 0 !important;
              width: 100% !important;
              max-width: none !important;
              box-shadow: none !important;
              border: 0 !important;
            }

            .payslip-print-actions,
            aside,
            header,
            nav {
              display: none !important;
            }

            body {
              background: white !important;
            }
          }
        `}
      </style>

      <div className="payslip-print-root w-full max-w-3xl rounded-lg bg-white shadow-xl">
        <div className="payslip-print-actions flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Payslip</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-xl leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close payslip"
          >
            &times;
          </button>
        </div>

        <div className="p-6">
          {/* Workflow Status */}
          <div className="mb-6 rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
              Approval Status
            </p>
            <WorkflowStatusBar
              steps={PAYROLL_STEPS}
              currentStep={payrollRecord.approval_status ?? 'Draft'}
              type="payroll"
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-blue-700">
                  PayrollPro
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Payroll Management System
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Payslip
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {formatPayrollMonth(payrollRecord.month)}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 rounded-lg bg-slate-50 p-4 text-sm md:grid-cols-2">
              <div>
                <p className="text-slate-500">Employee Name</p>
                <p className="font-semibold text-slate-900">
                  {employeeRecord?.name || '-'}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Employee ID</p>
                <p className="font-semibold text-slate-900">
                  {employeeRecord?.employee_id || '-'}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Department</p>
                <p className="font-semibold text-slate-900">
                  {getDepartmentName(employeeRecord)}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Joining Date</p>
                <p className="font-semibold text-slate-900">
                  {formatDate(employeeRecord?.joining_date)}
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-slate-50">
                    <td
                      colSpan="2"
                      className="px-4 py-3 font-semibold text-slate-900"
                    >
                      Earnings
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-slate-600">
                      Basic Salary
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {formatCurrency(payrollRecord.basic_salary)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-slate-600">Bonus</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {formatCurrency(payrollRecord.bonus)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td
                      colSpan="2"
                      className="px-4 py-3 font-semibold text-slate-900"
                    >
                      Deductions
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-slate-600">Deductions</td>
                    <td className="px-4 py-3 text-right font-medium text-red-700">
                      {formatCurrency(payrollRecord.deductions)}
                    </td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="px-4 py-4 text-base font-bold text-slate-900">
                      Net Salary
                    </td>
                    <td className="px-4 py-4 text-right text-base font-bold text-blue-700">
                      {formatCurrency(getNetSalary(payrollRecord))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-5 text-xs text-slate-500">
              Generated on {formatDate(payrollRecord.generated_at)}
            </p>
          </div>

          <div className="payslip-print-actions mt-5 flex justify-end gap-3">
            <Button label="Close" variant="secondary" onClick={onClose} />
            <Button label="Download as PDF" onClick={() => window.print()} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payslip
