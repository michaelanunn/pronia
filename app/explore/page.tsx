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

export default function Explore() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (profilesData) {
      // Get piece counts for each profile
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
              <Link href="/profile" className="text-gray-600 hover:text-gray-900">
                Profile
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Pianists</h2>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search by username, name, or bio..."
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
        ) : filteredProfiles.length === 0 ? (
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
        )}
      </main>
    </div>
  )
}