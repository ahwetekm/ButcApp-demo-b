import { AdminLayout } from '../components/AdminLayout'
import { SiteSettings } from '../components/SiteSettings'

export default function SettingsPage() {
  return (
    <AdminLayout>
      <div className="p-6">
        <SiteSettings />
      </div>
    </AdminLayout>
  )
}