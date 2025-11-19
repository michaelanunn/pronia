'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
}

interface Piece {
  id: string
  title: string
  composer: string
  difficulty: number
  status: string
}

export default function PublicProfile() {
  const params = useParams()
  const username = params.username as string
  const [profile, setProfile] = useState<Profile | null>(null)
  const [pieces, setPieces] = useState<Piece[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [username])

  const loadProfile = async () => {
    // Load profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (profileData) {
      setProfile(profileData)
      
      // Load their pieces
      const { data: piecesData } = await supabase
        .from('pieces')
        .select('*')
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false })
      
      setPieces(piecesData || [])
    }

    setLoading(false)
  }

  const getAvatarUrl = (path: string | null) => {
    if (!path) return null
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return data.publicUrl
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
          <Link href="/explore" className="text-blue-600 hover:text-blue-800">
            Explore other profiles →
          </Link>
        </div>
      </div>
    )
  }

  const difficultyLabels = [
    'Beginner', 'Elementary', 'Intermediate', 'Upper Intermediate',
    'Advanced', 'Very Advanced', 'Expert', 'Master', 'Virtuoso'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold text-gray-900 cursor-pointer">Pronia</h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/explore" className="text-gray-600 hover:text-gray-900">
                Explore
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="flex items-start gap-6">
            {profile.avatar_url ? (
              <img
                src={getAvatarUrl(profile.avatar_url) || ''}
                alt={profile.username}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {profile.full_name || profile.username}
              </h1>
              <p className="text-gray-600 mb-4">@{profile.username}</p>
              
              {profile.bio && (
                <p className="text-gray-700">{profile.bio}</p>
              )}
              
              <div className="flex gap-6 mt-4">
                <div>
                  <span className="font-bold text-2xl">{pieces.length}</span>
                  <span className="text-gray-600 ml-2">pieces</span>
                </div>
                <div>
                  <span className="font-bold text-2xl">
                    {pieces.filter(p => p.status === 'mastered').length}
                  </span>
                  <span className="text-gray-600 ml-2">mastered</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Repertoire */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Repertoire</h2>
          
          {pieces.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">No pieces yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pieces.map((piece) => (
                <div key={piece.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    {piece.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{piece.composer}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Difficulty:</span>
                      <span className="font-medium">
                        Level {piece.difficulty}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        piece.status === 'mastered' ? 'bg-green-100 text-green-800' :
                        piece.status === 'learning' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {piece.status.charAt(0).toUpperCase() + piece.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}