'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

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

interface Composer {
  id: string
  name: string
  full_name: string | null
  birth_year: number | null
  death_year: number | null
  nationality: string | null
  era: string | null
  bio: string | null
  image_url: string | null
  piece_count?: number
}

export default function Explore() {
  const [activeTab, setActiveTab] = useState<'users' | 'pieces' | 'composers'>('composers')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [pieces, setPieces] = useState<Piece[]>([])
  const [composers, setComposers] = useState<Composer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [eraFilter, setEraFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [currentUsername, setCurrentUsername] = useState<string>('')

  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single()
        
        if (profileData) {
          setCurrentUsername(profileData.username)
        }
      }
    }
    
    loadCurrentUser()
    loadProfiles()
    loadPieces()
    loadComposers()
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

  const loadComposers = async () => {
    const { data: composersData } = await supabase
      .from('composers')
      .select('*')
      .order('name', { ascending: true })

    if (composersData) {
      const composersWithCounts = await Promise.all(
        composersData.map(async (composer) => {
          const { count } = await supabase
            .from('piece_library')
            .select('*', { count: 'exact', head: true })
            .eq('composer_id', composer.id)
          
          return { ...composer, piece_count: count || 0 }
        })
      )
      
      setComposers(composersWithCounts)
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

  const filteredComposers = composers.filter(composer => {
    const matchesSearch = 
      composer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      composer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      composer.nationality?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      composer.era?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesEra = eraFilter === 'all' || composer.era === eraFilter
    
    return matchesSearch && matchesEra
  })

  const eras = ['all', ...new Set(composers.map(c => c.era).filter(Boolean) as string[])]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Pronia" width={32} height={32} />
              <h1 className="text-2xl font-bold text-gray-900">Pronia</h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/library" className="text-gray-600 hover:text-gray-900">
                Library
              </Link>
              <Link href="/metronome" className="text-gray-600 hover:text-gray-900">
                Metronome
              </Link>
              {currentUsername && (
                <Link href={`/u/${currentUsername}`} className="text-gray-600 hover:text-gray-900">
                  Profile
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Explore</h2>
          
          <div className="flex gap-6 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('composers')}
              className={`pb-3 px-2 font-semibold transition text-lg ${
                activeTab === 'composers'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Composers
            </button>
            <button
              onClick={() => setActiveTab('pieces')}
              className={`pb-3 px-2 font-semibold transition text-lg ${
                activeTab === 'pieces'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pieces
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-3 px-2 font-semibold transition text-lg ${
                activeTab === 'users'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Users
            </button>
          </div>

          <div className="relative mb-4">
            <input
              type="text"
              placeholder={
                activeTab === 'composers' ? 'Search composers by name, nationality, or era...' :
                activeTab === 'pieces' ? 'Search pieces by title or composer...' :
                'Search users by name or username...'
              }
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

          {activeTab === 'composers' && (
            <div className="flex gap-2 flex-wrap">
              {eras.map((era) => (
                <button
                  key={era}
                  onClick={() => setEraFilter(era)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    eraFilter === era
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {era === 'all' ? 'All Eras' : era}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg">Loading...</div>
          </div>
        ) : activeTab === 'composers' ? (
          filteredComposers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No composers found</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">{filteredComposers.length} composers</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {filteredComposers.map((composer) => (
                  <Link
                    key={composer.id}
                    href={`/composer/${composer.id}`}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center"
                  >
                    {composer.image_url ? (
                      <img
                        src={composer.image_url}
                        alt={composer.name}
                        className="w-20 h-20 mx-auto mb-4 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {composer.name.charAt(0)}
                      </div>
                    )}
                    
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {composer.name}
                    </h3>
                    
                    {composer.full_name && (
                      <p className="text-gray-600 text-sm mb-2">{composer.full_name}</p>
                    )}
                    
                    <div className="space-y-1 text-sm text-gray-500">
                      {composer.birth_year && composer.death_year ? (
                        <p>{composer.birth_year}–{composer.death_year}</p>
                      ) : composer.birth_year ? (
                        <p>b. {composer.birth_year}</p>
                      ) : null}
                      {composer.era && (
                        <p className="text-xs bg-gray-100 rounded-full px-3 py-1 inline-block">
                          {composer.era}
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-500">
                      {composer.piece_count || 0} pieces
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        ) : activeTab === 'pieces' ? (
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
                      <span className="font-medium">Level {piece.difficulty}</span>
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
        ) : (
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
        )}
      </main>
    </div>
  )
}