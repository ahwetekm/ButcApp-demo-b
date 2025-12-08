import { AdminLayout } from './AdminLayout'

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="p-6">
        {/* This component is now just a redirect to the dashboard page */}
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Yönlendiriliyor...
          </h1>
          <p className="text-muted-foreground">
            Dashboard sayfasına yönlendiriliyorsunuz.
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}