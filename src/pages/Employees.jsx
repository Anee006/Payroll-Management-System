import { useEffect, useMemo, useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import Modal from '../components/Modal'
import Table from '../components/Table'
import useAuth from '../hooks/useAuth'
import DashboardLayout from '../layouts/DashboardLayout'
import {
  addEmployee,
  deleteEmployee,
  getAllDepartments,
  getAllEmployees,
  updateEmployee,
} from '../services/employeeService'

const initialFormState = {
  employee_id: '',
  name: '',
  email: '',
  department_id: '',
  role: 'Employee',
  salary: '',
  joining_date: '',
}

const inputClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'

const formatSalary = (salary) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(salary || 0))

const formatDate = (date) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function EmployeeForm({
  departments,
  formData,
  formError,
  loading,
  onChange,
  onSubmit,
  submitLabel,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="employee_id" className="mb-1 block text-sm font-medium text-slate-700">
            Employee ID
          </label>
          <input
            id="employee_id"
            name="employee_id"
            type="text"
            value={formData.employee_id}
            onChange={onChange}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={onChange}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={onChange}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="department_id" className="mb-1 block text-sm font-medium text-slate-700">
            Department
          </label>
          <select
            id="department_id"
            name="department_id"
            value={formData.department_id}
            onChange={onChange}
            required
            className={inputClass}
          >
            <option value="">Select department</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.department_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="role" className="mb-1 block text-sm font-medium text-slate-700">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={onChange}
            required
            className={inputClass}
          >
            <option value="Employee">Employee</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <div>
          <label htmlFor="salary" className="mb-1 block text-sm font-medium text-slate-700">
            Salary
          </label>
          <input
            id="salary"
            name="salary"
            type="number"
            min="0"
            value={formData.salary}
            onChange={onChange}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="joining_date" className="mb-1 block text-sm font-medium text-slate-700">
            Joining Date
          </label>
          <input
            id="joining_date"
            name="joining_date"
            type="date"
            value={formData.joining_date}
            onChange={onChange}
            required
            className={inputClass}
          />
        </div>
      </div>

      {formError && <p className="text-sm font-medium text-red-600">{formError}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" label={loading ? 'Saving...' : submitLabel} loading={loading} />
      </div>
    </form>
  )
}

function Employees() {
  const { userRole } = useAuth()
  const isAdmin = userRole?.toLowerCase() === 'admin'

  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editEmployee, setEditEmployee] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState(initialFormState)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadEmployeesPageData = async () => {
    try {
      const [employeesData, departmentsData] = await Promise.all([
        getAllEmployees(),
        getAllDepartments(),
      ])

      setEmployees(employeesData || [])
      setDepartments(departmentsData || [])
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    async function loadInitialEmployeesPageData() {
      try {
        const [employeesData, departmentsData] = await Promise.all([
          getAllEmployees(),
          getAllDepartments(),
        ])

        if (!isMounted) return

        setEmployees(employeesData || [])
        setDepartments(departmentsData || [])
        setError('')
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

    loadInitialEmployeesPageData()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredEmployees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) {
      return employees
    }

    return employees.filter((employee) => {
      const name = employee.name?.toLowerCase() || ''
      const employeeId = employee.employee_id?.toLowerCase() || ''
      return name.includes(query) || employeeId.includes(query)
    })
  }, [employees, searchQuery])

  const selectedEmployeeForDelete = employees.find((employee) => employee.id === deleteConfirmId)

  const openAddModal = () => {
    setFormData(initialFormState)
    setFormError('')
    setShowAddModal(true)
  }

  const closeAddModal = () => {
    setShowAddModal(false)
    setFormError('')
    setFormData(initialFormState)
  }

  const openEditModal = (employee) => {
    setFormData({
      employee_id: employee.employee_id || '',
      name: employee.name || '',
      email: employee.email || '',
      department_id: employee.department_id || '',
      role: employee.role || 'Employee',
      salary: employee.salary || '',
      joining_date: employee.joining_date?.split('T')[0] || '',
    })
    setFormError('')
    setEditEmployee(employee)
  }

  const closeEditModal = () => {
    setEditEmployee(null)
    setFormError('')
    setFormData(initialFormState)
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  const buildEmployeePayload = () => ({
    ...formData,
    salary: Number(formData.salary),
  })

  const handleAddEmployee = async (event) => {
    event.preventDefault()
    setFormLoading(true)
    setFormError('')

    try {
      await addEmployee(buildEmployeePayload())
      await loadEmployeesPageData()
      closeAddModal()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateEmployee = async (event) => {
    event.preventDefault()

    if (!editEmployee) {
      return
    }

    setFormLoading(true)
    setFormError('')

    try {
      await updateEmployee(editEmployee.id, buildEmployeePayload())
      await loadEmployeesPageData()
      closeEditModal()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteEmployee = async () => {
    if (!deleteConfirmId) {
      return
    }

    setDeleteLoading(true)
    setError('')

    try {
      await deleteEmployee(deleteConfirmId)
      await loadEmployeesPageData()
      setDeleteConfirmId(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  const columns = [
    { key: 'employee_id', label: 'Employee ID' },
    { key: 'name', label: 'Name' },
    { key: 'department', label: 'Department' },
    { key: 'role', label: 'Role' },
    { key: 'salary', label: 'Salary' },
    { key: 'joining_date', label: 'Joining Date' },
    ...(isAdmin ? [{ key: 'actions', label: 'Actions' }] : []),
  ]

  const tableData = filteredEmployees.map((employee) => ({
    id: employee.id,
    employee_id: employee.employee_id,
    name: employee.name,
    department: employee.departments?.department_name || '-',
    role: employee.role,
    salary: formatSalary(employee.salary),
    joining_date: formatDate(employee.joining_date),
    ...(isAdmin
      ? {
          actions: (
            <div className="flex items-center gap-2">
              <Button
                label="Edit"
                variant="secondary"
                onClick={() => openEditModal(employee)}
                className="px-3 py-1.5"
              />
              <Button
                label="Delete"
                variant="danger"
                onClick={() => setDeleteConfirmId(employee.id)}
                className="px-3 py-1.5"
              />
            </div>
          ),
        }
      : {}),
  }))

  return (
    <DashboardLayout title="Employee Management">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Employee Management</h1>
            <p className="mt-1 text-sm text-slate-500">
              View and manage employee records, departments, roles, and salaries.
            </p>
          </div>

          {isAdmin && <Button label="Add Employee" onClick={openAddModal} />}
        </div>

        <Card>
          <div className="mb-5">
            <label htmlFor="employee-search" className="sr-only">
              Search employees
            </label>
            <input
              id="employee-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by employee name or ID"
              className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 md:max-w-md"
            />
          </div>

          {error && (
            <div className="mb-5 rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
              Loading employees...
            </div>
          ) : (
            <Table columns={columns} data={tableData} />
          )}
        </Card>
      </div>

      <Modal isOpen={showAddModal} onClose={closeAddModal} title="Add Employee">
        <EmployeeForm
          departments={departments}
          formData={formData}
          formError={formError}
          loading={formLoading}
          onChange={handleFormChange}
          onSubmit={handleAddEmployee}
          submitLabel="Add Employee"
        />
      </Modal>

      <Modal isOpen={Boolean(editEmployee)} onClose={closeEditModal} title="Edit Employee">
        <EmployeeForm
          departments={departments}
          formData={formData}
          formError={formError}
          loading={formLoading}
          onChange={handleFormChange}
          onSubmit={handleUpdateEmployee}
          submitLabel="Update Employee"
        />
      </Modal>

      <Modal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Employee"
      >
        <div className="space-y-5">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-slate-900">
              {selectedEmployeeForDelete?.name || 'this employee'}
            </span>
            ?
          </p>

          <div className="flex justify-end gap-3">
            <Button
              label="Cancel"
              variant="secondary"
              onClick={() => setDeleteConfirmId(null)}
              disabled={deleteLoading}
            />
            <Button
              label={deleteLoading ? 'Deleting...' : 'Delete'}
              variant="danger"
              loading={deleteLoading}
              onClick={handleDeleteEmployee}
            />
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

export default Employees
