import { AdminLayout } from '../components/AdminLayout'
import { CategoryManager } from '../components/CategoryManager'
import { AuthGuard } from '@/components/AuthGuard'

export default function CategoriesPage() {
  return (
    <AuthGuard>
      <AdminLayout>
        <div className="p-6">
          <CategoryManager />
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}