import Card from '../components/Card'
import DashboardLayout from '../layouts/DashboardLayout'

function Profile() {
  return (
    <DashboardLayout title="My Profile">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <Card title="Profile Details">
          <p className="text-sm text-slate-600">
            Personal details, account information, and profile settings will appear here.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default Profile
