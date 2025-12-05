'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, FileText, Tag, Users, Shield, Settings, BarChart3, LogOut, Database, Activity, Home, Server } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'

interface AdminSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    href: '/0gv6O9Gizwrd1FCb40H22JE8y9aIgK'
  },
  {
    id: 'server-status',
    label: 'Server Status',
    icon: Server,
    href: '/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/dashboard/server-status'
  },
  {
    id: 'posts',
    label: 'Blog Yazıları',
    icon: FileText,
    href: '/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/posts'
  },
  {
    id: 'categories',
    label: 'Kategoriler',
    icon: Tag,
    href: '/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/categories'
  },
  {
    id: 'users',
    label: 'Kullanıcılar',
    icon: Users,
    href: '/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/users'
  },
  {
    id: 'admins',
    label: 'Adminler',
    icon: Shield,
    href: '/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/admins'
  },
  {
    id: 'system-logs',
    label: 'Sistem Logları',
    icon: Activity,
    href: '/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/system-logs'
  },
  {
    id: 'backup',
    label: 'Yedekleme',
    icon: Database,
    href: '/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/backup'
  },
  {
    id: 'settings',
    label: 'Ayarlar',
    icon: Settings,
    href: '/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/settings'
  }
]

export function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleNavigation = (href: string) => {
    router.push(href)
    onToggle() // Menüyü kapat
  }

  const handleLogout = () => {
    // Token ve user bilgilerini temizle
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    router.push('/')
  }

  const handleGoToApp = () => {
    // Admin panelinden uygulamaya geri dön
    router.push('/app')
  }

  return (
    <>
      {/* Overlay - Always show when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[40]"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar - Always sliding, never fixed position */}
      <div className={cn(
        "fixed left-0 top-0 h-full bg-background border-r border-border z-[50] transition-all duration-300 ease-in-out",
        "w-64 transform",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-foreground rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-background" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-foreground">Admin Panel</h1>
                <p className="text-xs text-muted-foreground">ButcApp Yönetim</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.id !== 'dashboard' && pathname.startsWith(item.href))
                
                return (
                  <li key={item.id}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        isActive && "bg-secondary text-secondary-foreground"
                      )}
                      onClick={() => handleNavigation(item.href)}
                    >
                      <item.icon className="h-4 w-4 mr-3" />
                      {item.label}
                    </Button>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-2">
            {/* Go to App Button - Prominent */}
            <Button
              variant="default"
              className="w-full justify-start bg-green-600 hover:bg-green-700 text-white"
              onClick={handleGoToApp}
            >
              <Home className="h-4 w-4 mr-2" />
              Uygulamaya Git
            </Button>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tema</span>
              <ThemeToggle />
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}