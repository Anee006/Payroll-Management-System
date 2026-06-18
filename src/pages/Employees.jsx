import Card from '../components/Card'
import DashboardLayout from '../layouts/DashboardLayout'

function Employees() {
  return (
    <DashboardLayout title="Employee Management">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Employee Management</h1>
        <Card title="Employees">
          <p className="text-sm text-slate-600">
            Employee records, filters, and management actions will be added here.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default Employees
