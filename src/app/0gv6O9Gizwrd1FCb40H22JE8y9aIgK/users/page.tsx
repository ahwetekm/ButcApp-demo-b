'use client'

import { AdminLayout } from '../components/AdminLayout'
import { UserManager } from '../components/UserManager'
import { AuthGuard } from '@/components/AuthGuard'

export default function UsersPage() {
  return (
    <AuthGuard>
      <AdminLayout>
        <div className="p-6">
          <UserManager />
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}