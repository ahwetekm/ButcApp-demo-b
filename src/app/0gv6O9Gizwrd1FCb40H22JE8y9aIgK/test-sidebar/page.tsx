'use client'

import { useState } from 'react'
import { AdminSidebar } from '../components/AdminSidebar'

export default function TestSidebarPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Sidebar Test Sayfası</h1>
        <p>Bu sayfa sadece sidebar'ı test etmek için oluşturulmuştur.</p>
        <p>Sol tarafta Server Status butonunu görmelisiniz.</p>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Sidebar'ı {sidebarOpen ? 'Gizle' : 'Göster'}
        </button>
      </main>
    </div>
  )
}