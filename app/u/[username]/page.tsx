'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  piano_years: number | null
  learning_method: string | null
  instrument: string | null
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
  const router = useRouter()
  const username = params.username as string
  const [profile, setProfile] = useState<Profile | null>(null)
  const [pieces, setPieces] = useState<Piece[]>([])
  const [loading, setLoading] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editedBio, setEditedBio] = useState('')
  const [editedFullName, setEditedFullName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadProfile()
  }, [username])

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user || null)
    
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (profileData) {
      setProfile(profileData)
      setEditedBio(profileData.bio || '')
      setEditedFullName(profileData.full_name || '')
      
      if (session && session.user.id === profileData.id) {
        setIsOwnProfile(true)
      }
      
      const { data: piecesData } = await supabase
        .from('pieces')
        .select('*')
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false })
      
      setPieces(piecesData || [])
    }

    setLoading(false)
  }

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !isOwnProfile) return
    
    try {
      setUploading(true)
      
      if (!e.target.files || e.target.files.length === 0) return

      const file = e.target.files[0]
      
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/avatar.${fileExt}`

      if (profile?.avatar_url) {
        await supabase.storage.from('avatars').remove([profile.avatar_url])
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('id', user.id)

      if (updateError) throw updateError

      await loadProfile()
    } catch (error: any) {
      alert('Error uploading avatar: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const saveProfile = async () => {
    if (!user || !isOwnProfile) return
    
    setSaving(true)
    
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editedFullName,
        bio: editedBio,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (error) {
      alert('Error saving: ' + error.message)
    } else {
      setEditing(false)
      await loadProfile()
    }
    
    setSaving(false)
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
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="relative group">
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
              
              {isOwnProfile && (
                <>
                  {uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="text-white text-xs">Uploading...</div>
                    </div>
                  )}
                  <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full cursor-pointer transition">
                    <span className="text-white opacity-0 group-hover:opacity-100 text-sm">Change</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={uploadAvatar}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </>
              )}
            </div>
            
            <div className="flex-1">
              {editing ? (
                <input
                  type="text"
                  value={editedFullName}
                  onChange={(e) => setEditedFullName(e.target.value)}
                  placeholder="Your name"
                  className="text-3xl font-bold text-gray-900 mb-1 w-full border-b-2 border-blue-500 focus:outline-none"
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {profile.full_name || profile.username}
                </h1>
              )}
              <p className="text-gray-600 mb-2">@{profile.username}</p>
              
              <div className="flex gap-4 mb-4 text-sm flex-wrap">
                {profile.piano_years !== null && (
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                    <span className="font-semibold text-blue-900">🎹 {profile.piano_years} years</span>
                  </div>
                )}
                {profile.learning_method && (
                  <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full">
                    <span className="text-purple-900">
                      {profile.learning_method === 'self-taught' ? '📚 Self-taught' : '🎓 Classes'}
                    </span>
                  </div>
                )}
                {profile.instrument && (
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                    <span className="text-gray-700 capitalize">{profile.instrument}</span>
                  </div>
                )}
              </div>
              
              {editing ? (
                <textarea
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  maxLength={500}
                  className="w-full text-gray-700 mb-4 border-2 border-blue-500 rounded-lg p-2 focus:outline-none"
                />
              ) : (
                profile.bio && <p className="text-gray-700 mb-4">{profile.bio}</p>
              )}
              
              <div className="flex gap-6 mb-4">
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

              {isOwnProfile && (
                <div className="flex gap-2">
                  {editing ? (
                    <>
                      <button
                        onClick={saveProfile}
                        disabled={saving}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false)
                          setEditedBio(profile.bio || '')
                          setEditedFullName(profile.full_name || '')
                        }}
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditing(true)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                      >
                        Edit Profile
                      </button>
                      <Link
                        href="/settings/profile"
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
                      >
                        Settings
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

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