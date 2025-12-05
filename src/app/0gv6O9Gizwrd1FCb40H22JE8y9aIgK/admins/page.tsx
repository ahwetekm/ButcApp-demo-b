'use client'

import { AdminLayout } from '../components/AdminLayout'
import { AdminManager } from '../components/AdminManager'
import { AuthGuard } from '@/components/AuthGuard'

export default function AdminsPage() {
  return (
    <AuthGuard>
      <AdminLayout>
        <div className="p-6">
          <AdminManager />
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}