'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface LibraryPiece {
  id: string
  title: string
  composer_name: string
  composer_id: string
  difficulty: number
  form: string | null
  key: string | null
  musescore_url: string | null
  review_count: number
  image_url: string | null
}

export default function Library() {
  const [pieces, setPieces] = useState<LibraryPiece[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    loadLibrary()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user || null)
  }

  const loadLibrary = async () => {
    const { data, error } = await supabase
      .from('piece_library')
      .select('*')
      .order('title', { ascending: true })

    if (data) {
      setPieces(data)
    }
    setLoading(false)
  }

  const addToRepertoire = async (piece: LibraryPiece) => {
    if (!user) {
      router.push('/login')
      return
    }

    // Check if already added
    const { data: existing } = await supabase
      .from('pieces')
      .select('id')
      .eq('user_id', user.id)
      .eq('title', piece.title)
      .eq('composer', piece.composer_name)
      .single()

    if (existing) {
      alert('You already have this piece in your repertoire!')
      return
    }

    // Add to user's pieces
    const { error } = await supabase
      .from('pieces')
      .insert([{
        user_id: user.id,
        title: piece.title,
        composer: piece.composer_name,
        difficulty: piece.difficulty,
        status: 'learning',
        notes: null
      }])

    if (error) {
      alert('Error adding piece: ' + error.message)
    } else {
      alert(`Added "${piece.title}" to your repertoire!`)
    }
  }

  const filteredPieces = pieces.filter(piece => {
    const matchesSearch = 
      piece.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      piece.composer_name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDifficulty = difficultyFilter === null || piece.difficulty === difficultyFilter
    
    return matchesSearch && matchesDifficulty
  })

  const difficultyLabels = [
    'Beginner', 'Elementary', 'Intermediate', 'Upper Intermediate',
    'Advanced', 'Very Advanced', 'Expert', 'Master', 'Virtuoso'
  ]

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
              <Link href="/explore" className="text-gray-600 hover:text-gray-900">
                Explore
              </Link>
              <Link href="/metronome" className="text-gray-600 hover:text-gray-900">
                Metronome
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Piece Library</h2>
          <p className="text-gray-600">Browse and add pieces to your repertoire</p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <input
            type="text"
            placeholder="Search pieces by title or composer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setDifficultyFilter(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                difficultyFilter === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Levels
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
              <button
                key={level}
                onClick={() => setDifficultyFilter(level)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  difficultyFilter === level
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Level {level}
              </button>
            ))}
          </div>
        </div>

        {/* Pieces Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg">Loading...</div>
          </div>
        ) : filteredPieces.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No pieces found</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">{filteredPieces.length} pieces</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredPieces.map((piece) => (
                <div
                  key={piece.id}
                  className="bg-white rounded-lg shadow hover:shadow-xl transition overflow-hidden group cursor-pointer"
                  onClick={() => addToRepertoire(piece)}
                >
                  {/* Sheet Music Thumbnail */}
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                    {piece.image_url ? (
                      <img
                        src={piece.image_url}
                        alt={piece.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-6">
                        <div className="text-6xl mb-2">🎵</div>
                        <div className="text-xs text-gray-500 font-mono">
                          {piece.key || 'C Major'}
                        </div>
                      </div>
                    )}
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition flex items-center justify-center">
                      <button className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-6 py-2 rounded-full font-semibold transform scale-90 group-hover:scale-100 transition">
                        + Add to Repertoire
                      </button>
                    </div>

                    {/* Difficulty badge */}
                    <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      Level {piece.difficulty}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                      {piece.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{piece.composer_name}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      {piece.musescore_url && piece.review_count > 0 && (
                        
                          href={piece.musescore_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 hover:text-blue-600 transition"
                        >
                          <span>⭐</span>
                          <span>{piece.review_count.toLocaleString()} reviews</span>
                        </a>
                      )}
                      {piece.form && (
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {piece.form}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}