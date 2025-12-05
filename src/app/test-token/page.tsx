'use client'

import { useState, useEffect } from 'react'

export default function TestPage() {
  const [token, setToken] = useState('')
  const [result, setResult] = useState('')

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken')
    if (storedToken) {
      setToken(storedToken)
    }
  }, [])

  const setAdminToken = () => {
    const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLXVzZXItMTc2NDU0Njc0NDIzMCIsInVzZXJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzY0NjkwNDE0LCJleHAiOjE3NjcyODI0MTR9.KgC1qBpIRY2SuHrQd_7mTSA8Q0ZiddsUWHmHsBe9Bi4'
    localStorage.setItem('adminToken', adminToken)
    localStorage.setItem('adminUser', JSON.stringify({
      id: "admin-user-1764546744230",
      username: "admin",
      email: "admin@example.com",
      name: "Admin User",
      role: "ADMIN"
    }))
    setToken(adminToken)
    setResult('Token ayarlandı! Şimdi server status sayfasına gidebilirsiniz.')
  }

  const testAPI = async () => {
    try {
      const response = await fetch('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/system-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setResult(`✅ API çalışıyor! CPU: ${data.cpu.usage}%`)
      } else {
        setResult(`❌ API Hatası: ${response.status}`)
      }
    } catch (error) {
      setResult(`❌ Hata: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Token Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Token Durumu</h2>
          <p className="text-sm text-gray-600 mb-4">
            Token: {token ? 'Mevcut' : 'Yok'}
          </p>
          
          <button
            onClick={setAdminToken}
            className="bg-blue-600 text-white px-4 py-2 rounded mr-4"
          >
            Token Ayarla
          </button>
          
          <button
            onClick={testAPI}
            disabled={!token}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            API Test Et
          </button>
        </div>
        
        {result && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Sonuç</h2>
            <p>{result}</p>
          </div>
        )}
        
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-xl font-semibold mb-4">Linkler</h2>
          <a 
            href="/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/dashboard/server-status"
            className="text-blue-600 underline block"
          >
            Server Status Sayfası
          </a>
          <a 
            href="/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/login"
            className="text-blue-600 underline block"
          >
            Admin Login
          </a>
        </div>
      </div>
    </div>
  )
}