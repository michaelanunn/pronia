'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FileText } from 'lucide-react'
import SimplePieceCard from '@/components/SimplePieceCard'

export const dynamic = 'force-dynamic'


interface Piece {
  id: string
  title: string
  composer: string
  difficulty: number
  status: string
  notes: string | null
  created_at: string
  pdf_url?: string | null
}

interface LibraryPiece {
  id: string
  title: string
  composer_name: string
  composer_id: string
  difficulty: number
  form: string | null
}

export default function Dashboard() {
  const [username, setUsername] = useState<string>('')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pieces, setPieces] = useState<Piece[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPiece, setEditingPiece] = useState<string | null>(null)
  const [uploadingPieceId, setUploadingPieceId] = useState<string | null>(null)
  
  const [searchMode, setSearchMode] = useState<'library' | 'custom'>('library')
  const [searchQuery, setSearchQuery] = useState('')
  const [libraryResults, setLibraryResults] = useState<LibraryPiece[]>([])
  const [searching, setSearching] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const [newPiece, setNewPiece] = useState({
    title: '',
    composer: '',
    difficulty: 1,
    status: 'learning',
    notes: '',
    pdfUrl: ''
  })
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Restore mobile nav preference
    if (typeof window !== 'undefined') {
      const storedNav = localStorage.getItem('navExpanded')
      if (storedNav !== null) {
        setMobileMenuOpen(storedNav === 'true')
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        checkOnboarding(session.user.id)
        loadPieces(session.user.id)
        loadProfile(session.user.id)
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user)
        loadPieces(session.user.id)
      } else {
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('navExpanded', mobileMenuOpen.toString())
    }
  }, [mobileMenuOpen])

  const checkOnboarding = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', userId)
      .single()
    
    if (data && !data.onboarding_completed) {
      router.push('/onboarding')
    }
  }

  const loadPieces = async (userId: string) => {
    const { data, error } = await supabase
      .from('pieces')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error loading pieces:', error)
    } else {
      setPieces(data || [])
    }
  }

  const loadProfile = async (userId: string) => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single()
    
    if (profileData) {
      setUsername(profileData.username)
    }
  }

  const searchLibrary = async (query: string) => {
    if (!query || query.length < 2) {
      setLibraryResults([])
      return
    }

    setSearching(true)
    
    const { data } = await supabase
      .from('piece_library')
      .select('id, title, composer_name, composer_id, difficulty, form')
      .or(`title.ilike.%${query}%,composer_name.ilike.%${query}%`)
      .limit(10)

    setLibraryResults(data || [])
    setSearching(false)
  }

  const addFromLibrary = async (libraryPiece: LibraryPiece) => {
    const { data: existing } = await supabase
      .from('pieces')
      .select('id')
      .eq('user_id', user.id)
      .eq('title', libraryPiece.title)
      .eq('composer', libraryPiece.composer_name)
      .single()

    if (existing) {
      alert('You already have this piece in your repertoire!')
      return
    }

    const { error } = await supabase
      .from('pieces')
      .insert([{
        user_id: user.id,
        title: libraryPiece.title,
        composer: libraryPiece.composer_name,
        difficulty: libraryPiece.difficulty,
        status: 'learning',
        notes: null
      }])

    if (error) {
      alert('Error adding piece: ' + error.message)
    } else {
      resetForm()
      loadPieces(user.id)
    }
  }

  const handlePdfUpload = async (file: File) => {
    if (!user) {
      router.push('/login')
      return
    }

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.')
      return
    }

    if (file.size > 25 * 1024 * 1024) {
      alert('File too large. Please upload a PDF under 25MB.')
      return
    }

    try {
      setUploadingPdf(true)
      const filePath = `${user.id}/${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('scores')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'application/pdf'
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('scores').getPublicUrl(filePath)
      const publicUrl = data?.publicUrl

      setNewPiece((prev) => ({ ...prev, pdfUrl: publicUrl || '' }))
    } catch (error: any) {
      alert('Error uploading PDF: ' + error.message)
    } finally {
      setUploadingPdf(false)
    }
  }

const handlePiecePdfUpload = async (pieceId: string, file: File) => {
  if (!user) {
    router.push('/login')
    return
  }

  if (file.type !== 'application/pdf') {
    alert('Please upload a PDF file.')
    return
  }

  if (file.size > 25 * 1024 * 1024) {
    alert('File too large. Please upload a PDF under 25MB.')
    return
  }

  try {
    setUploadingPieceId(pieceId)

    // Use API route for upload with thumbnail generation
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', user.id)
    formData.append('pieceId', pieceId)

    const response = await fetch('/api/upload-pdf', {
      method: 'POST',
      body: formData
    })

    const data = await response.json()

    if (!response.ok) throw new Error(data.error)

    // Update local state
    setPieces((prev) =>
      prev.map((p) => (p.id === pieceId ? { 
        ...p, 
        pdf_url: data.pdfUrl,
        thumbnail_url: data.thumbnailUrl 
      } : p))
    )

  } catch (error: any) {
    alert('Error uploading PDF: ' + error.message)
  } finally {
    setUploadingPieceId(null)
  }

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.')
      return
    }

    if (file.size > 25 * 1024 * 1024) {
      alert('File too large. Please upload a PDF under 25MB.')
      return
    }

    try {
      setUploadingPieceId(pieceId)
      const filePath = `${user.id}/${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('scores')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'application/pdf'
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('scores').getPublicUrl(filePath)
      const publicUrl = data?.publicUrl

      const { error: updateError } = await supabase
        .from('pieces')
        .update({ pdf_url: publicUrl || null })
        .eq('id', pieceId)

      if (updateError) throw updateError

      setPieces((prev) =>
        prev.map((p) => (p.id === pieceId ? { ...p, pdf_url: publicUrl || null } : p))
      )
    } catch (error: any) {
      alert('Error uploading PDF: ' + error.message)
    } finally {
      setUploadingPieceId(null)
    }
  }

  const handlePieceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingPiece) {
      const { error } = await supabase
        .from('pieces')
        .update({
          title: newPiece.title,
          composer: newPiece.composer,
          difficulty: newPiece.difficulty,
          status: newPiece.status,
          notes: newPiece.notes,
          pdf_url: newPiece.pdfUrl || null
        })
        .eq('id', editingPiece)
      
      if (error) {
        alert('Error updating piece: ' + error.message)
      } else {
        resetForm()
        loadPieces(user.id)
      }
    } else {
      const { data: libraryMatches } = await supabase
        .from('piece_library')
        .select('id, title, composer_name, composer_id, difficulty, form')
        .ilike('title', newPiece.title)
        .ilike('composer_name', newPiece.composer)
        .limit(1)

      const libraryMatch = libraryMatches?.[0]

      if (libraryMatch) {
        await addFromLibrary(libraryMatch as LibraryPiece)
        return
      }

      const { error } = await supabase
        .from('pieces')
        .insert([{
          title: newPiece.title,
          composer: newPiece.composer,
          difficulty: newPiece.difficulty,
          status: newPiece.status,
          notes: newPiece.notes,
          pdf_url: newPiece.pdfUrl || null,
          user_id: user.id
        }])
      
      if (error) {
        alert('Error adding piece: ' + error.message)
      } else {
        resetForm()
        loadPieces(user.id)
      }
    }
  }

  const resetForm = () => {
    setNewPiece({
      title: '',
      composer: '',
      difficulty: 1,
      status: 'learning',
      notes: '',
      pdfUrl: ''
    })
    setEditingPiece(null)
    setShowAddForm(false)
    setSearchMode('library')
    setSearchQuery('')
    setLibraryResults([])
  }

  const handleEditPiece = (piece: Piece) => {
    setNewPiece({
      title: piece.title,
      composer: piece.composer,
      difficulty: piece.difficulty,
      status: piece.status,
      notes: piece.notes || '',
      pdfUrl: piece.pdf_url || ''
    })
    setEditingPiece(piece.id)
    setShowAddForm(true)
    setSearchMode('custom')
  }

  const deletePiece = async (id: string) => {
    if (!confirm('Are you sure you want to delete this piece?')) return
    
    const { error } = await supabase
      .from('pieces')
      .delete()
      .eq('id', id)
    
    if (error) {
      alert('Error deleting piece: ' + error.message)
    } else {
      loadPieces(user.id)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  const difficultyLabels = [
    'Beginner', 'Elementary', 'Intermediate', 'Upper Intermediate',
    'Advanced', 'Very Advanced', 'Expert', 'Master', 'Virtuoso'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-[64px] py-3 gap-3 flex-wrap md:flex-nowrap">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 min-w-0 flex-1">
              <Image src="/logo.png" alt="Pronia" width={28} height={28} className="flex-shrink-0" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Pronia</h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
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
              {username ? (
                <Link href={`/u/${username}`} className="text-gray-600 hover:text-gray-900">
                  Profile
                </Link>
              ) : (
                <Link href="/profile" className="text-gray-600 hover:text-gray-900">
                  Profile
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 flex-shrink-0"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-3">
              <div className="mt-2 rounded-lg border border-gray-200 bg-white/95 backdrop-blur-sm shadow-lg divide-y divide-gray-100 max-h-[60vh] overflow-auto">
                <div className="flex flex-col p-3 space-y-2">
                  <Link 
                    href="/library" 
                    className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:text-gray-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Library
                  </Link>
                  <Link 
                    href="/explore" 
                    className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:text-gray-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Explore
                  </Link>
                  <Link 
                    href="/metronome" 
                    className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:text-gray-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Metronome
                  </Link>
                  <Link 
                    href="/my-pdfs" 
                    className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:text-gray-900 gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FileText className="w-4 h-4" />
                    My PDFs
                  </Link>
                  {username ? (
                    <Link 
                      href={`/u/${username}`} 
                      className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:text-gray-900"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  ) : (
                    <Link 
                      href="/profile" 
                      className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:text-gray-900"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  )}
                </div>
                <div className="p-3">
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Repertoire</h2>
            <p className="text-gray-600 mt-1">{pieces.length} pieces total</p>
          </div>
          <button
            onClick={() => {
              if (showAddForm && editingPiece) {
                resetForm()
              } else {
                setShowAddForm(!showAddForm)
              }
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {showAddForm ? 'Cancel' : '+ Add Piece'}
          </button>
        </div>

        {showAddForm && !editingPiece && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">Add New Piece</h3>
            
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSearchMode('library')}
                className={`flex-1 py-2 rounded-lg font-medium transition ${
                  searchMode === 'library'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Search Library
              </button>
              <button
                onClick={() => setSearchMode('custom')}
                className={`flex-1 py-2 rounded-lg font-medium transition ${
                  searchMode === 'custom'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Add Custom Piece
              </button>
            </div>

            {searchMode === 'library' ? (
              <div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    searchLibrary(e.target.value)
                  }}
                  placeholder="Search for a piece (e.g., Moonlight Sonata, Chopin)..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                />

                {searching && <div className="text-center py-4">Searching...</div>}

                {libraryResults.length > 0 && (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {libraryResults.map((piece) => (
                      <div
                        key={piece.id}
                        onClick={() => addFromLibrary(piece)}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{piece.title}</h4>
                            <Link
                              href={`/composer/${piece.composer_id}`}
                              className="text-sm text-blue-600 hover:text-blue-800"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {piece.composer_name}
                            </Link>
                          </div>
                          <div className="text-right">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Level {piece.difficulty}
                            </span>
                            {piece.form && (
                              <p className="text-xs text-gray-500 mt-1">{piece.form}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery.length >= 2 && !searching && libraryResults.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-2">No pieces found in library</p>
                    <button
                      onClick={() => setSearchMode('custom')}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Add as custom piece instead →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handlePieceSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Piece Title *
                    </label>
                    <input
                      type="text"
                      value={newPiece.title}
                      onChange={(e) => setNewPiece({...newPiece, title: e.target.value})}
                      placeholder="e.g., Nocturne in E-flat major"
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Composer *
                    </label>
                    <input
                      type="text"
                      value={newPiece.composer}
                      onChange={(e) => setNewPiece({...newPiece, composer: e.target.value})}
                      placeholder="e.g., Frédéric Chopin"
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={newPiece.difficulty}
                      onChange={(e) => setNewPiece({...newPiece, difficulty: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {difficultyLabels.map((label, index) => (
                        <option key={index + 1} value={index + 1}>
                          {index + 1} - {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={newPiece.status}
                      onChange={(e) => setNewPiece({...newPiece, status: e.target.value})}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="learning">Currently Learning</option>
                      <option value="mastered">Mastered</option>
                      <option value="reviewing">Reviewing</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={newPiece.notes}
                    onChange={(e) => setNewPiece({...newPiece, notes: e.target.value})}
                    placeholder="Practice notes, techniques to focus on, etc."
                    rows={3}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Upload annotated PDF (optional)
                    </label>
                    {newPiece.pdfUrl && (
                      
                        href={newPiece.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View current PDF
                      </a>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handlePdfUpload(file)
                    }}
                    className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {uploadingPdf && (
                    <p className="text-sm text-gray-500">Uploading PDF...</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Add Piece
                </button>
              </form>
            )}
          </div>
        )}

        {showAddForm && editingPiece && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">Edit Piece</h3>
            <form onSubmit={handlePieceSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Piece Title *
                  </label>
                  <input
                    type="text"
                    value={newPiece.title}
                    onChange={(e) => setNewPiece({...newPiece, title: e.target.value})}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Composer *
                  </label>
                  <input
                    type="text"
                    value={newPiece.composer}
                    onChange={(e) => setNewPiece({...newPiece, composer: e.target.value})}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={newPiece.difficulty}
                    onChange={(e) => setNewPiece({...newPiece, difficulty: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {difficultyLabels.map((label, index) => (
                      <option key={index + 1} value={index + 1}>
                        {index + 1} - {label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newPiece.status}
                    onChange={(e) => setNewPiece({...newPiece, status: e.target.value})}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="learning">Currently Learning</option>
                    <option value="mastered">Mastered</option>
                    <option value="reviewing">Reviewing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={newPiece.notes}
                  onChange={(e) => setNewPiece({...newPiece, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Upload annotated PDF (optional)
                  </label>
                  {newPiece.pdfUrl && (
                    
                      href={newPiece.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View current PDF
                    </a>
                  )}
                </div>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handlePdfUpload(file)
                  }}
                  className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {uploadingPdf && (
                  <p className="text-sm text-gray-500">Uploading PDF...</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Update Piece
              </button>
            </form>
          </div>
        )}

        {pieces.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">
              No pieces yet. Add your first piece to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pieces.map((piece) => (
              <SimplePieceCard
                key={piece.id}
                piece={piece}
                onEdit={handleEditPiece}
                onDelete={deletePiece}
                onPdfUpload={handlePiecePdfUpload}
                uploading={uploadingPieceId === piece.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

