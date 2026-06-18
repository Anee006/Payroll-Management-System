import Card from '../components/Card'
import DashboardLayout from '../layouts/DashboardLayout'

function Attendance() {
  return (
    <DashboardLayout title="Attendance">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
        <Card title="Attendance Records">
          <p className="text-sm text-slate-600">
            Daily attendance tracking and status updates will appear here.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default Attendance
