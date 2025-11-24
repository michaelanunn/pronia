'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FileText, Menu, X } from 'lucide-react'
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
  thumbnail_url?: string | null
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const [searchMode, setSearchMode] = useState<'library' | 'custom'>('library')
  const [searchQuery, setSearchQuery] = useState('')
  const [libraryResults, setLibraryResults] = useState<LibraryPiece[]>([])
  const [searching, setSearching] = useState(false)
  
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  const difficultyLabels = [
    'Beginner', 'Elementary', 'Intermediate', 'Upper Intermediate',
    'Advanced', 'Very Advanced', 'Expert', 'Master', 'Virtuoso'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="Pronia" width={36} height={36} />
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Pronia
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <Link href="/library" className="text-gray-600 hover:text-blue-600 transition font-medium text-base">
                Library
              </Link>
              <Link href="/explore" className="text-gray-600 hover:text-blue-600 transition font-medium text-base">
                Explore
              </Link>
              <Link href="/metronome" className="text-gray-600 hover:text-blue-600 transition font-medium text-base">
                Metronome
              </Link>
              <Link href="/my-pdfs" className="text-gray-600 hover:text-blue-600 transition font-medium text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                My PDFs
              </Link>
              {username ? (
                <Link href={`/u/${username}`} className="text-gray-600 hover:text-blue-600 transition font-medium text-base">
                  Profile
                </Link>
              ) : (
                <Link href="/profile" className="text-gray-600 hover:text-blue-600 transition font-medium text-base">
                  Profile
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:shadow-lg transition"
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition"
            >
              {mobileMenuOpen ? (
                <X className="w-7 h-7" />
              ) : (
                <Menu className="w-7 h-7" />
              )}
            </button>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-6 border-t border-gray-200 bg-white/95 backdrop-blur-md">
              <div className="flex flex-col space-y-2">
                <Link 
                  href="/library" 
                  className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-6 py-4 rounded-lg transition font-medium text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Library
                </Link>
                <Link 
                  href="/explore" 
                  className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-6 py-4 rounded-lg transition font-medium text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Explore
                </Link>
                <Link 
                  href="/metronome" 
                  className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-6 py-4 rounded-lg transition font-medium text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Metronome
                </Link>
                <Link 
                  href="/my-pdfs" 
                  className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-6 py-4 rounded-lg transition font-medium text-lg flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileText className="w-5 h-5" />
                  My PDFs
                </Link>
                {username ? (
                  <Link 
                    href={`/u/${username}`} 
                    className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-6 py-4 rounded-lg transition font-medium text-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                ) : (
                  <Link 
                    href="/profile" 
                    className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-6 py-4 rounded-lg transition font-medium text-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="text-left text-white bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 rounded-lg font-medium hover:shadow-lg transition text-lg"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">My Repertoire</h2>
            <p className="text-gray-600 mt-2 text-lg">{pieces.length} pieces total</p>
          </div>
          <button
            onClick={() => {
              if (showAddForm && editingPiece) {
                resetForm()
              } else {
                setShowAddForm(!showAddForm)
              }
            }}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all transform hover:scale-105 text-lg"
          >
            {showAddForm ? 'Cancel' : '+ Add Piece'}
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && !editingPiece && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-10 mb-12 border border-gray-200">
            <h3 className="text-2xl font-bold mb-6">Add New Piece</h3>
            
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setSearchMode('library')}
                className={`flex-1 py-4 rounded-xl font-medium transition text-base ${
                  searchMode === 'library'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Search Library
              </button>
              <button
                onClick={() => setSearchMode('custom')}
                className={`flex-1 py-4 rounded-xl font-medium transition text-base ${
                  searchMode === 'custom'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Add Custom
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
                  className="w-full px-5 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6"
                />

                {searching && <div className="text-center py-4 text-lg">Searching...</div>}

                {libraryResults.length > 0 && (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {libraryResults.map((piece) => (
                      <div
                        key={piece.id}
                        onClick={() => addFromLibrary(piece)}
                        className="p-5 border border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 cursor-pointer transition"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-lg">{piece.title}</h4>
                            <Link
                              href={`/composer/${piece.composer_id}`}
                              className="text-sm text-blue-600 hover:text-blue-800 mt-1 inline-block"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {piece.composer_name}
                            </Link>
                          </div>
                          <div className="text-right">
                            <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full font-medium">
                              Level {piece.difficulty}
                            </span>
                            {piece.form && (
                              <p className="text-xs text-gray-500 mt-2">{piece.form}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery.length >= 2 && !searching && libraryResults.length === 0 && (
                  <div className="text-center py-10 text-gray-500">
                    <p className="mb-3 text-lg">No pieces found in library</p>
                    <button
                      onClick={() => setSearchMode('custom')}
                      className="text-blue-600 hover:text-blue-800 font-medium text-base"
                    >
                      Add as custom piece instead →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handlePieceSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Piece Title *
                    </label>
                    <input
                      type="text"
                      value={newPiece.title}
                      onChange={(e) => setNewPiece({...newPiece, title: e.target.value})}
                      placeholder="e.g., Nocturne in E-flat major"
                      className="w-full px-5 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-5 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={newPiece.difficulty}
                      onChange={(e) => setNewPiece({...newPiece, difficulty: parseInt(e.target.value)})}
                      className="w-full px-5 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-5 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    rows={4}
                    className="w-full px-5 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-3">
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
                    className="w-full text-base text-gray-700 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer file:font-medium"
                  />
                  {uploadingPdf && (
                    <p className="text-sm text-gray-500">Uploading PDF...</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl transition-all transform hover:scale-105 text-lg"
                >
                  Add Piece
                </button>
              </form>
            )}
          </div>
        )}

        {/* Edit Form */}
        {showAddForm && editingPiece && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-10 mb-12 border border-gray-200">
            <h3 className="text-2xl font-bold mb-6">Edit Piece</h3>
            <form onSubmit={handlePieceSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Piece Title *
                  </label>
                  <input
                    type="text"
                    value={newPiece.title}
                    onChange={(e) => setNewPiece({...newPiece, title: e.target.value})}
                    className="w-full px-5 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-5 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={newPiece.difficulty}
                    onChange={(e) => setNewPiece({...newPiece, difficulty: parseInt(e.target.value)})}
                    className="w-full px-5 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-5 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  rows={4}
                  className="w-full px-5 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-3">
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
                  className="w-full text-base text-gray-700 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer file:font-medium"
                />
                {uploadingPdf && (
                  <p className="text-sm text-gray-500">Uploading PDF...</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl transition-all transform hover:scale-105 text-lg"
              >
                Update Piece
              </button>
            </form>
          </div>
        )}

        {/* Pieces Grid */}
        {pieces.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-16 text-center border border-gray-200">
            <p className="text-gray-500 text-xl mb-4">
              No pieces yet. Add your first piece to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
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