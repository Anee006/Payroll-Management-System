import Card from '../components/Card'
import DashboardLayout from '../layouts/DashboardLayout'

function Leaves() {
  return (
    <DashboardLayout title="Leave Management">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
        <Card title="Leave Requests">
          <p className="text-sm text-slate-600">
            Leave requests, approvals, and balances will be managed here.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default Leaves
