'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminSidebar } from './AdminSidebar'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hamburger Menu Button - Left of header area */}
      <div className="fixed top-4 left-4 z-[60] flex items-center">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-background shadow-md"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content - Starts from the right of the menu button */}
      <main className="flex-1 pl-16 pt-16">
        {children}
      </main>
    </div>
  )
}