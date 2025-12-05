'use client'

import { AdminLayout } from '../components/AdminLayout'
import { BlogPostsManager } from '../components/BlogPostsManager'
import { AuthGuard } from '@/components/AuthGuard'

export default function PostsPage() {
  return (
    <AuthGuard>
      <AdminLayout>
        <div className="p-6">
          <BlogPostsManager />
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}