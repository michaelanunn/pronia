'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setChecking(false)
  }

  const handleStartTracking = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      // Already logged in, go to dashboard
      router.push('/dashboard')
    } else {
      // Not logged in, go to login
      router.push('/login')
    }
  }

  const loadProfile = async () => {
  // Check if viewing own profile
  const { data: { session } } = await supabase.auth.getSession()
  
  // First, try to load the profile directly
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (profileData) {
    setProfile(profileData)
    
    // Check if this is the current user's profile
    if (session && session.user.id === profileData.id) {
      setIsOwnProfile(true)
    }
    
    // Load their pieces
    const { data: piecesData } = await supabase
      .from('pieces')
      .select('*')
      .eq('user_id', profileData.id)
      .order('created_at', { ascending: false })
    
    setPieces(piecesData || [])
    setLoading(false)
  } else {
    // Profile not found, check username history for redirect
    const { data: historyData } = await supabase
      .from('username_history')
      .select('new_username')
      .eq('old_username', username)
      .single()

    if (historyData) {
      setRedirecting(true)
      router.push(`/u/${historyData.new_username}`)
    } else {
      setLoading(false)
    }
  }
}
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <div className="text-center text-white px-4">
        <h1 className="text-7xl font-bold mb-4 tracking-tight">
          Pronia
        </h1>
        <p className="text-2xl mb-8 text-gray-100">
          Track every piece. Master your craft.
        </p>
        <p className="text-lg mb-12 text-gray-200 max-w-md mx-auto">
          The practice journal built by pianists, for pianists.
        </p>
        <button
          onClick={handleStartTracking}
          disabled={checking}
          className="inline-block bg-white text-blue-700 px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition shadow-2xl disabled:opacity-50"
        >
          {checking ? 'Loading...' : 'Start Tracking →'}
        </button>
      </div>
    </div>
  )
}