import { useEffect, useMemo, useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import Modal from '../components/Modal'
import Payslip from '../components/Payslip'
import Table from '../components/Table'
import useAuth from '../hooks/useAuth'
import DashboardLayout from '../layouts/DashboardLayout'
import {
  getAllEmployees,
  getEmployeeByEmail,
  getEmployeeById,
} from '../services/employeeService'
import {
  deletePayroll,
  generatePayroll,
  getAllPayroll,
  getPayrollByEmployeeIdentifiers,
} from '../services/payrollService'
import { formatCurrency } from '../utils/dateHelpers'

const inputClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'

const currentMonth = () => new Date().toISOString().slice(0, 7)

const normalizeValue = (value) => String(value || '').trim().toLowerCase()

const getNetSalary = (record) =>
  record?.net_salary ??
  Number(record?.basic_salary || 0) +
    Number(record?.bonus || 0) -
    Number(record?.deductions || 0)

const formatMonth = (month) => {
  if (!month) return '-'
  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${month}-01T00:00:00`))
}

const getDepartmentName = (employee) =>
  employee?.departments?.department_name || employee?.department_name || '-'

const buildEmployeeMap = (employees) =>
  (employees || []).reduce((map, employee) => {
    map[employee.id] = employee
    return map
  }, {})

function AdminView() {
  const [employees, setEmployees] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [monthFilter, setMonthFilter] = useState('')

  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [payrollMonth, setPayrollMonth] = useState(currentMonth())
  const [basicSalary, setBasicSalary] = useState('')
  const [bonus, setBonus] = useState(0)
  const [deductions, setDeductions] = useState(0)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [payslipTarget, setPayslipTarget] = useState(null)

  const employeeMap = useMemo(() => buildEmployeeMap(employees), [employees])

  const loadData = async () => {
    try {
      const [employeesData, payrollData] = await Promise.all([
        getAllEmployees(),
        getAllPayroll(),
      ])
      setEmployees(employeesData || [])
      setRecords(payrollData || [])
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    async function loadInitialData() {
      try {
        const [employeesData, payrollData] = await Promise.all([
          getAllEmployees(),
          getAllPayroll(),
        ])

        if (isMounted) {
          setEmployees(employeesData || [])
          setRecords(payrollData || [])
          setError('')
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadInitialData()

    return () => {
      isMounted = false
    }
  }, [])

  const resetGenerateForm = () => {
    setSelectedEmployeeId('')
    setPayrollMonth(currentMonth())
    setBasicSalary('')
    setBonus(0)
    setDeductions(0)
    setFormError('')
  }

  const openGenerateModal = () => {
    resetGenerateForm()
    setShowGenerateModal(true)
  }

  const handleEmployeeChange = (event) => {
    const employeeId = event.target.value
    const employee = employeeMap[employeeId]

    setSelectedEmployeeId(employeeId)
    setBasicSalary(employee?.salary ?? '')
  }

  const netSalaryPreview =
    Number(basicSalary || 0) + Number(bonus || 0) - Number(deductions || 0)

  const handleGenerate = async (event) => {
    event.preventDefault()
    setFormError('')

    if (!selectedEmployeeId) {
      setFormError('Please select an employee.')
      return
    }

    if (!payrollMonth) {
      setFormError('Please select a payroll month.')
      return
    }

    setSubmitting(true)

    try {
      await generatePayroll(
        selectedEmployeeId,
        payrollMonth,
        Number(basicSalary || 0),
        Number(bonus || 0),
        Number(deductions || 0),
      )
      setShowGenerateModal(false)
      resetGenerateForm()
      await loadData()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setDeleteLoading(true)
    setError('')

    try {
      await deletePayroll(deleteTarget.id)
      setDeleteTarget(null)
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  const filteredRecords = useMemo(() => {
    if (!monthFilter) return records
    return records.filter((record) => record.month === monthFilter)
  }, [monthFilter, records])

  const columns = [
    { key: 'employee', label: 'Employee' },
    { key: 'department', label: 'Dept' },
    { key: 'month', label: 'Month' },
    { key: 'basic', label: 'Basic' },
    { key: 'bonus', label: 'Bonus' },
    { key: 'deductions', label: 'Deductions' },
    { key: 'net', label: 'Net Salary' },
    { key: 'actions', label: 'Actions' },
  ]

  const tableData = filteredRecords.map((record) => {
    const employee = employeeMap[record.employee_id] || record.employees || {}

    return {
      id: record.id,
      employee: employee.name || record.employees?.name || '-',
      department: getDepartmentName(employee),
      month: formatMonth(record.month),
      basic: formatCurrency(record.basic_salary),
      bonus: formatCurrency(record.bonus),
      deductions: formatCurrency(record.deductions),
      net: (
        <span className="font-semibold text-slate-900">
          {formatCurrency(getNetSalary(record))}
        </span>
      ),
      actions: (
        <div className="flex flex-wrap gap-2">
          <Button
            label="View Payslip"
            variant="secondary"
            onClick={() => setPayslipTarget({ record, employee })}
            className="px-3 py-1.5"
          />
          <Button
            label="Delete"
            variant="danger"
            onClick={() => setDeleteTarget(record)}
            className="px-3 py-1.5"
          />
        </div>
      ),
    }
  })

  if (loading) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
        Loading payroll data...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <Card title="Generate Payroll">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Generate or update payroll for an employee and month.
          </p>
          <Button label="Generate Payroll" onClick={openGenerateModal} />
        </div>
      </Card>

      <Card title="Payroll Records">
        <div className="mb-4">
          <label
            htmlFor="payroll-month-filter"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Filter by month
          </label>
          <input
            id="payroll-month-filter"
            type="month"
            value={monthFilter}
            onChange={(event) => setMonthFilter(event.target.value)}
            className={`${inputClass} max-w-xs`}
          />
        </div>

        <Table columns={columns} data={tableData} />
      </Card>

      <Modal
        isOpen={showGenerateModal}
        onClose={() => {
          setShowGenerateModal(false)
          resetGenerateForm()
        }}
        title="Generate Payroll"
      >
        <form onSubmit={handleGenerate} className="space-y-4">
          {formError && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {formError}
            </div>
          )}

          <div>
            <label
              htmlFor="payroll-employee"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Employee
            </label>
            <select
              id="payroll-employee"
              value={selectedEmployeeId}
              onChange={handleEmployeeChange}
              className={inputClass}
              required
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} ({employee.employee_id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="payroll-month"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Month
            </label>
            <input
              id="payroll-month"
              type="month"
              value={payrollMonth}
              onChange={(event) => setPayrollMonth(event.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="basic-salary"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Basic Salary
              </label>
              <input
                id="basic-salary"
                type="number"
                min="0"
                value={basicSalary}
                onChange={(event) => setBasicSalary(event.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label
                htmlFor="payroll-bonus"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Bonus
              </label>
              <input
                id="payroll-bonus"
                type="number"
                min="0"
                value={bonus}
                onChange={(event) => setBonus(event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="payroll-deductions"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Deductions
              </label>
              <input
                id="payroll-deductions"
                type="number"
                min="0"
                value={deductions}
                onChange={(event) => setDeductions(event.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="rounded-md bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20">
            Net Salary Preview: {formatCurrency(netSalaryPreview)}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              label="Cancel"
              variant="secondary"
              onClick={() => {
                setShowGenerateModal(false)
                resetGenerateForm()
              }}
              disabled={submitting}
            />
            <Button
              type="submit"
              label={submitting ? 'Generating...' : 'Generate'}
              loading={submitting}
            />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Payroll Record"
      >
        <div className="space-y-5">
          <p className="text-sm text-slate-600">
            Delete payroll for{' '}
            <span className="font-semibold text-slate-900">
              {deleteTarget
                ? formatMonth(deleteTarget.month)
                : 'this month'}
            </span>
            ? This cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              label="Cancel"
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteLoading}
            />
            <Button
              label={deleteLoading ? 'Deleting...' : 'Delete'}
              variant="danger"
              loading={deleteLoading}
              onClick={handleDelete}
            />
          </div>
        </div>
      </Modal>

      <Payslip
        payrollRecord={payslipTarget?.record}
        employeeRecord={payslipTarget?.employee}
        onClose={() => setPayslipTarget(null)}
      />
    </div>
  )
}

function EmployeeView({ employee, payrollIdentifiers }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [payslipTarget, setPayslipTarget] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadPayroll() {
      try {
        const data = await getPayrollByEmployeeIdentifiers(payrollIdentifiers)
        if (isMounted) {
          setRecords(data || [])
          setError('')
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadPayroll()

    return () => {
      isMounted = false
    }
  }, [payrollIdentifiers])

  const columns = [
    { key: 'month', label: 'Month' },
    { key: 'basic', label: 'Basic' },
    { key: 'bonus', label: 'Bonus' },
    { key: 'deductions', label: 'Deductions' },
    { key: 'net', label: 'Net Salary' },
    { key: 'actions', label: 'Actions' },
  ]

  const tableData = records.map((record) => ({
    id: record.id,
    month: formatMonth(record.month),
    basic: formatCurrency(record.basic_salary),
    bonus: formatCurrency(record.bonus),
    deductions: formatCurrency(record.deductions),
    net: (
      <span className="font-semibold text-slate-900">
        {formatCurrency(getNetSalary(record))}
      </span>
    ),
    actions: (
      <Button
        label="View Payslip"
        variant="secondary"
        onClick={() => setPayslipTarget(record)}
        className="px-3 py-1.5"
      />
    ),
  }))

  if (loading) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
        Loading your payroll records...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <Card title="My Payroll Records">
        <Table columns={columns} data={tableData} />
      </Card>

      <Payslip
        payrollRecord={payslipTarget}
        employeeRecord={payslipTarget?.employees || employee}
        onClose={() => setPayslipTarget(null)}
      />
    </div>
  )
}

function Payroll() {
  const { session, userRole, userEmployeeId } = useAuth()

  const [employee, setEmployee] = useState(null)
  const [resolvedRole, setResolvedRole] = useState(null)
  const [loadingEmployee, setLoadingEmployee] = useState(true)
  const [employeeError, setEmployeeError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function resolveEmployee() {
      try {
        const email = session?.user?.email
        const authUserId = session?.user?.id
        let foundEmployee = null

        if (email) {
          foundEmployee = await getEmployeeByEmail(email)
        }

        if (!foundEmployee && userEmployeeId) {
          try {
            foundEmployee = await getEmployeeById(userEmployeeId)
          } catch {
            // Continue to the broader lookup below.
          }
        }

        if (!foundEmployee) {
          const allEmployeesData = await getAllEmployees()
          const normalEmail = normalizeValue(email)
          const normalAuthId = normalizeValue(authUserId)
          const normalEmpId = normalizeValue(userEmployeeId)

          foundEmployee =
            allEmployeesData?.find((emp) => {
              const empEmail = normalizeValue(emp.email)
              const empRowId = normalizeValue(emp.id)
              const empCode = normalizeValue(emp.employee_id)

              return (
                (normalEmail && empEmail === normalEmail) ||
                (normalAuthId &&
                  (empRowId === normalAuthId || empCode === normalAuthId)) ||
                (normalEmpId &&
                  (empRowId === normalEmpId || empCode === normalEmpId))
              )
            }) || null
        }

        if (foundEmployee) {
          if (isMounted) {
            setEmployee(foundEmployee)
            setResolvedRole((foundEmployee.role || userRole || '').toLowerCase())
            setEmployeeError('')
          }
          return
        }

        if (isMounted) {
          setResolvedRole((userRole || '').toLowerCase())
        }

        throw new Error(
          'No employee record found linked to your account. Please contact your administrator.',
        )
      } catch (err) {
        if (isMounted) {
          setEmployeeError(err.message)
          setResolvedRole((userRole || '').toLowerCase())
        }
      } finally {
        if (isMounted) {
          setLoadingEmployee(false)
        }
      }
    }

    resolveEmployee()

    return () => {
      isMounted = false
    }
  }, [session, userEmployeeId, userRole])

  const effectiveRole = resolvedRole || (userRole || '').toLowerCase()
  const isAdmin = effectiveRole === 'admin'

  const payrollIdentifiers = useMemo(
    () =>
      [
        employee?.id,
        employee?.employee_id,
        userEmployeeId,
        session?.user?.id,
      ].filter(Boolean),
    [employee, session, userEmployeeId],
  )

  const renderContent = () => {
    if (loadingEmployee) {
      return (
        <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
          Loading payroll access...
        </div>
      )
    }

    if (employeeError && !isAdmin) {
      return (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {employeeError}
        </div>
      )
    }

    if (isAdmin) {
      return <AdminView />
    }

    return (
      <EmployeeView
        employee={employee}
        payrollIdentifiers={payrollIdentifiers}
      />
    )
  }

  return (
    <DashboardLayout title="Payroll">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payroll</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAdmin
              ? 'Generate payroll, review salary records, and open payslips.'
              : 'View your salary records and download payslips.'}
          </p>
        </div>

        {renderContent()}
      </div>
    </DashboardLayout>
  )
}

export default Payroll
