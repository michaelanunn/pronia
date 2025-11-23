'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FileText } from 'lucide-react'

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
}

interface LibraryPiece {
  id: string
  title: string
  composer_name: string
  difficulty: number
  form: string | null
  key: string | null
  musescore_url: string | null
  review_count: number
}

export default function ComposerProfile() {
  const params = useParams()
  const router = useRouter()
  const composerId = params.id as string
  const [composer, setComposer] = useState<Composer | null>(null)
  const [pieces, setPieces] = useState<LibraryPiece[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user || null)
  }

  const loadComposer = async () => {
    const { data } = await supabase
      .from('composers')
      .select('*')
      .eq('id', composerId)
      .single()

    setComposer(data || null)
  }

  const loadPieces = async () => {
    const { data } = await supabase
      .from('piece_library')
      .select('*')
      .eq('composer_id', composerId)
      .order('difficulty', { ascending: true })

    setPieces(data || [])
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([checkAuth(), loadComposer(), loadPieces()])
      setLoading(false)
    }

    loadData()
  }, [composerId])

  const addToRepertoire = async (piece: LibraryPiece) => {
    if (!user) {
      router.push('/login')
      return
    }

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!composer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Composer not found</h2>
          <Link href="/explore" className="text-blue-600 hover:text-blue-800">
            Back to Explore →
          </Link>
        </div>
      </div>
    )
  }

  const difficultyLabels = [
    'Beginner', 'Elementary', 'Intermediate', 'Upper Intermediate',
    'Advanced', 'Very Advanced', 'Expert', 'Master', 'Virtuoso'
  ]

  const yearsLabel = composer.birth_year && composer.death_year
    ? `${composer.birth_year}–${composer.death_year}`
    : composer.birth_year
      ? `b. ${composer.birth_year}`
      : 'Dates unknown'

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
              <Link href="/explore" className="text-gray-600 hover:text-gray-900">
                Explore
              </Link>
              <Link href="/metronome" className="text-gray-600 hover:text-gray-900">
                Metronome
              </Link>
              <Link href="/my-pdfs" className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                My PDFs
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link
            href="/explore"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            ← Back to Explore
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3 bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center p-10">
              {composer.image_url ? (
                <img
                  src={composer.image_url}
                  alt={composer.name}
                  className="w-48 h-48 rounded-2xl object-cover shadow-lg border-4 border-white"
                />
              ) : (
                <div className="w-40 h-40 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-5xl font-bold text-white">
                  {composer.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-1 p-8 md:p-10">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">
                    {composer.era || 'Composer'}
                  </p>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{composer.name}</h1>
                  {composer.full_name && (
                    <p className="text-lg text-gray-600 mb-3">{composer.full_name}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <span>{yearsLabel}</span>
                    {composer.nationality && (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        {composer.nationality}
                      </span>
                    )}
                    {composer.era && (
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                        {composer.era}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs uppercase text-gray-500">Pieces in library</p>
                  <p className="text-4xl font-bold text-blue-600">{pieces.length}</p>
                </div>
              </div>

              {composer.bio && (
                <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-700 leading-relaxed whitespace-pre-line">
                  {composer.bio}
                </div>
              )}

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs uppercase text-gray-500">Born</p>
                  <p className="font-semibold text-gray-900">{composer.birth_year || 'Unknown'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs uppercase text-gray-500">Died</p>
                  <p className="font-semibold text-gray-900">{composer.death_year || 'Unknown'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs uppercase text-gray-500">Nationality</p>
                  <p className="font-semibold text-gray-900">{composer.nationality || 'Unknown'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs uppercase text-gray-500">Era</p>
                  <p className="font-semibold text-gray-900">{composer.era || 'Not listed'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Pieces by {composer.name}</h2>
              <p className="text-sm text-gray-600">
                {pieces.length > 0
                  ? `${pieces.length} piece${pieces.length === 1 ? '' : 's'} sorted by difficulty`
                  : 'No pieces in the library yet for this composer.'}
              </p>
            </div>
            <Link href="/library" className="text-sm text-blue-600 hover:text-blue-800">
              Go to my library →
            </Link>
          </div>

          {pieces.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500">
              Check back soon—pieces for this composer will appear here.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pieces.map((piece) => (
                <div key={piece.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase text-gray-500 mb-1">
                        Level {piece.difficulty} · {difficultyLabels[piece.difficulty - 1] || 'Difficulty'}
                      </p>
                      <h3 className="text-xl font-semibold text-gray-900">{piece.title}</h3>
                      <p className="text-sm text-gray-600">{piece.composer_name}</p>
                    </div>
                    {piece.review_count > 0 && (
                      <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                        {piece.review_count} review{piece.review_count === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    {piece.form && (
                      <span className="px-3 py-1 rounded-full bg-gray-100">{piece.form}</span>
                    )}
                    {piece.key && (
                      <span className="px-3 py-1 rounded-full bg-gray-100">{piece.key}</span>
                    )}
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                      Level {piece.difficulty}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {piece.musescore_url && (
                      <a
                        href={piece.musescore_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                      >
                        View on MuseScore
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h6m0 0v6m0-6L10 16" />
                        </svg>
                      </a>
                    )}
                    <button
                      onClick={() => addToRepertoire(piece)}
                      className="ml-auto inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                    >
                      Add to repertoire
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
