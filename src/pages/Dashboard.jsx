import Card from '../components/Card'
import DashboardLayout from '../layouts/DashboardLayout'

function Dashboard() {
  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <Card title="Overview">
          <p className="text-sm text-slate-600">
            Dashboard summaries, payroll insights, and attendance stats will appear here.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
