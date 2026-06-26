import { useEffect, useMemo, useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import Modal from '../components/Modal'
import Table from '../components/Table'
import useAuth from '../hooks/useAuth'
import DashboardLayout from '../layouts/DashboardLayout'
import {
  addDepartment,
  getAllDepartmentsWithStats,
  updateDepartment,
} from '../services/departmentService'
import { formatCurrency } from '../utils/dateHelpers'

const inputClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'

const initialFormState = {
  department_name: '',
  department_head: '',
}

function DepartmentForm({
  formData,
  formError,
  loading,
  onChange,
  onSubmit,
  submitLabel,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="department_name"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Department Name
        </label>
        <input
          id="department_name"
          name="department_name"
          type="text"
          value={formData.department_name}
          onChange={onChange}
          className={inputClass}
          required
        />
      </div>

      <div>
        <label
          htmlFor="department_head"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Department Head
        </label>
        <input
          id="department_head"
          name="department_head"
          type="text"
          value={formData.department_head}
          onChange={onChange}
          className={inputClass}
          placeholder="Optional"
        />
      </div>

      {formError && (
        <p className="text-sm font-medium text-red-600">{formError}</p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" label={submitLabel} loading={loading} />
      </div>
    </form>
  )
}

function Departments() {
  const { userRole } = useAuth()

  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editDepartment, setEditDepartment] = useState(null)
  const [formData, setFormData] = useState(initialFormState)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const isAdmin = (userRole || '').toLowerCase() === 'admin'

  const loadDepartments = async () => {
    try {
      const data = await getAllDepartmentsWithStats()
      setDepartments(data || [])
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    async function loadInitialDepartments() {
      try {
        const data = await getAllDepartmentsWithStats()

        if (isMounted) {
          setDepartments(data || [])
          setError('')
        }
      } catch (err) {
        if (isMounted) setError(err.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadInitialDepartments()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredDepartments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return departments

    return departments.filter((department) => {
      const name = (department.department_name || '').toLowerCase()
      const head = (department.department_head || '').toLowerCase()
      return name.includes(query) || head.includes(query)
    })
  }, [departments, searchQuery])

  const totals = useMemo(
    () =>
      departments.reduce(
        (summary, department) => ({
          count: summary.count + 1,
          employees: summary.employees + Number(department.employee_count || 0),
          salary: summary.salary + Number(department.total_salary || 0),
        }),
        { count: 0, employees: 0, salary: 0 },
      ),
    [departments],
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  const resetForm = () => {
    setFormData(initialFormState)
    setFormError('')
  }

  const openAddModal = () => {
    resetForm()
    setShowAddModal(true)
  }

  const openEditModal = (department) => {
    setFormData({
      department_name: department.department_name || '',
      department_head: department.department_head || '',
    })
    setFormError('')
    setEditDepartment(department)
  }

  const handleAddDepartment = async (event) => {
    event.preventDefault()
    setFormLoading(true)
    setFormError('')

    try {
      await addDepartment(
        formData.department_name.trim(),
        formData.department_head.trim() || null,
      )
      await loadDepartments()
      setShowAddModal(false)
      resetForm()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateDepartment = async (event) => {
    event.preventDefault()
    if (!editDepartment) return

    setFormLoading(true)
    setFormError('')

    try {
      await updateDepartment(editDepartment.id, {
        department_name: formData.department_name.trim(),
        department_head: formData.department_head.trim() || null,
      })
      await loadDepartments()
      setEditDepartment(null)
      resetForm()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const columns = [
    { key: 'department', label: 'Department' },
    { key: 'head', label: 'Head' },
    { key: 'employees', label: 'Employees' },
    { key: 'totalSalary', label: 'Total Salary' },
    { key: 'avgSalary', label: 'Avg Salary' },
    ...(isAdmin ? [{ key: 'actions', label: 'Actions' }] : []),
  ]

  const tableData = filteredDepartments.map((department) => ({
    id: department.id,
    department: department.department_name,
    head: department.department_head || '-',
    employees: department.employee_count,
    totalSalary: formatCurrency(department.total_salary),
    avgSalary: formatCurrency(department.avg_salary),
    ...(isAdmin
      ? {
          actions: (
            <Button
              label="Edit"
              variant="secondary"
              onClick={() => openEditModal(department)}
              className="px-3 py-1.5"
            />
          ),
        }
      : {}),
  }))

  return (
    <DashboardLayout title="Departments">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Departments</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage departments and review employee salary distribution.
            </p>
          </div>

          {isAdmin && <Button label="Add Department" onClick={openAddModal} />}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-sm font-medium text-slate-500">Departments</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {totals.count}
            </p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-500">Employees</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {totals.employees}
            </p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-500">Monthly Salary</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {formatCurrency(totals.salary)}
            </p>
          </Card>
        </div>

        <Card title="Department Directory">
          <div className="mb-5">
            <label htmlFor="department-search" className="sr-only">
              Search departments
            </label>
            <input
              id="department-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by department or head"
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
              Loading departments...
            </div>
          ) : (
            <Table columns={columns} data={tableData} />
          )}
        </Card>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          resetForm()
        }}
        title="Add Department"
      >
        <DepartmentForm
          formData={formData}
          formError={formError}
          loading={formLoading}
          onChange={handleChange}
          onSubmit={handleAddDepartment}
          submitLabel={formLoading ? 'Saving...' : 'Add Department'}
        />
      </Modal>

      <Modal
        isOpen={Boolean(editDepartment)}
        onClose={() => {
          setEditDepartment(null)
          resetForm()
        }}
        title="Edit Department"
      >
        <DepartmentForm
          formData={formData}
          formError={formError}
          loading={formLoading}
          onChange={handleChange}
          onSubmit={handleUpdateDepartment}
          submitLabel={formLoading ? 'Saving...' : 'Update Department'}
        />
      </Modal>
    </DashboardLayout>
  )
}

export default Departments
