'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Piece {
  id: string
  title: string
  composer: string
  difficulty: number
  status: string
  notes: string | null
  created_at: string
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pieces, setPieces] = useState<Piece[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPiece, setEditingPiece] = useState<string | null>(null)
  const [newPiece, setNewPiece] = useState({
    title: '',
    composer: '',
    difficulty: 1,
    status: 'learning',
    notes: ''
  })
  const router = useRouter()

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        loadPieces(session.user.id)
        setLoading(false)
      }
    })

    // Listen for auth changes
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

  const handlePieceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingPiece) {
      // Update existing piece
      const { error } = await supabase
        .from('pieces')
        .update({
          title: newPiece.title,
          composer: newPiece.composer,
          difficulty: newPiece.difficulty,
          status: newPiece.status,
          notes: newPiece.notes
        })
        .eq('id', editingPiece)
      
      if (error) {
        alert('Error updating piece: ' + error.message)
      } else {
        resetForm()
        loadPieces(user.id)
      }
    } else {
      // Add new piece
      const { error } = await supabase
        .from('pieces')
        .insert([
          {
            ...newPiece,
            user_id: user.id
          }
        ])
      
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
      notes: ''
    })
    setEditingPiece(null)
    setShowAddForm(false)
  }

  const handleEditPiece = (piece: Piece) => {
    setNewPiece({
      title: piece.title,
      composer: piece.composer,
      difficulty: piece.difficulty,
      status: piece.status,
      notes: piece.notes || ''
    })
    setEditingPiece(piece.id)
    setShowAddForm(true)
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
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <h1 className="text-2xl font-bold text-gray-900 cursor-pointer">Pronia</h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/explore" className="text-gray-600 hover:text-gray-900">
                Explore
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-gray-900">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">
              {editingPiece ? 'Edit Piece' : 'Add New Piece'}
            </h3>
            <form onSubmit={handlePieceSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Piece Title *
                  </label>
                  <input
                    type="text"
                    value={newPiece.title}
                    onChange={(e) => setNewPiece({...newPiece, title: e.target.value})}
                    placeholder="e.g., Nocturne in E-flat major, Op. 9 No. 2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={newPiece.difficulty}
                    onChange={(e) => setNewPiece({...newPiece, difficulty: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                {editingPiece ? 'Update Piece' : 'Add Piece'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pieces.map((piece) => (
              <div 
                key={piece.id} 
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
                onClick={() => handleEditPiece(piece)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {piece.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{piece.composer}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deletePiece(piece.id)
                    }}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
                
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Difficulty:</span>
                    <span className="font-medium">
                      Level {piece.difficulty} - {difficultyLabels[piece.difficulty - 1]}
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
                  
                  {piece.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600 italic">{piece.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}