'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  piece_count?: number
}

interface Piece {
  id: string
  title: string
  composer: string
  difficulty: number
  status: string
  user_id: string
  profiles?: {
    username: string
    full_name: string | null
  }
}

export default function Explore() {
  const [activeTab, setActiveTab] = useState<'users' | 'pieces'>('users')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [pieces, setPieces] = useState<Piece[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfiles()
    loadPieces()
  }, [])

  const loadProfiles = async () => {
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (profilesData) {
      const profilesWithCounts = await Promise.all(
        profilesData.map(async (profile) => {
          const { count } = await supabase
            .from('pieces')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id)
          
          return { ...profile, piece_count: count || 0 }
        })
      )
      
      setProfiles(profilesWithCounts)
    }
    
    setLoading(false)
  }

  const loadPieces = async () => {
    const { data: piecesData } = await supabase
      .from('pieces')
      .select(`
        *,
        profiles:user_id (
          username,
          full_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (piecesData) {
      setPieces(piecesData)
    }
  }

  const getAvatarUrl = (path: string | null) => {
    if (!path) return null
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return data.publicUrl
  }

  const filteredProfiles = profiles.filter(profile =>
    profile.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPieces = pieces.filter(piece =>
    piece.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    piece.composer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const difficultyLabels = [
    'Beginner', 'Elementary', 'Intermediate', 'Upper Intermediate',
    'Advanced', 'Very Advanced', 'Expert', 'Master', 'Virtuoso'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <h1 className="text-2xl font-bold text-gray-900 cursor-pointer">Pronia</h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-gray-900">
                Profile 
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Explore</h2>
          
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-3 px-1 font-medium transition ${
                activeTab === 'users'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('pieces')}
              className={`pb-3 px-1 font-medium transition ${
                activeTab === 'pieces'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pieces
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder={activeTab === 'users' ? 'Search users by name or username...' : 'Search pieces by title or composer...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg">Loading...</div>
          </div>
        ) : activeTab === 'users' ? (
          // Users Tab
          filteredProfiles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((profile) => (
                <Link
                  key={profile.id}
                  href={`/u/${profile.username}`}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-start gap-4">
                    {profile.avatar_url ? (
                      <img
                        src={getAvatarUrl(profile.avatar_url) || ''}
                        alt={profile.username}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                        {profile.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 truncate">
                        {profile.full_name || profile.username}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">@{profile.username}</p>
                      
                      {profile.bio && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {profile.bio}
                        </p>
                      )}
                      
                      <div className="text-sm text-gray-500">
                        {profile.piece_count} pieces
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : (
          // Pieces Tab
          filteredPieces.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No pieces found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPieces.map((piece) => (
                <div key={piece.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
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

                    {piece.profiles && (
                      <div className="pt-3 border-t border-gray-200 mt-3">
                        <Link 
                          href={`/u/${piece.profiles.username}`}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          by @{piece.profiles.username}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  )
}