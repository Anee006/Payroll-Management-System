import Card from '../components/Card'
import DashboardLayout from '../layouts/DashboardLayout'

function Payroll() {
  return (
    <DashboardLayout title="Payroll">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Payroll</h1>
        <Card title="Payroll Processing">
          <p className="text-sm text-slate-600">
            Salary calculations, deductions, and payroll runs will be handled here.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default Payroll
