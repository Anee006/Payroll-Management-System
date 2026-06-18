import Card from '../components/Card'
import DashboardLayout from '../layouts/DashboardLayout'

function Departments() {
  return (
    <DashboardLayout title="Departments">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Departments</h1>
        <Card title="Department Directory">
          <p className="text-sm text-slate-600">
            Department lists, assignments, and reporting structure will appear here.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default Departments
