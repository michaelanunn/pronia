'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // User is logged in, go to dashboard
        router.push('/dashboard')
      } else {
        // User is not logged in, go to login page
        router.push('/login')
      }
      
      setChecking(false)
    }

    checkAuth()
  }, [router])

  // Show a clean loading state while checking
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">Pronia</h1>
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  return null
}