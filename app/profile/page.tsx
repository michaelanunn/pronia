'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText } from 'lucide-react'

interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  can_change_username: boolean
  username_changed_at: string | null
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingUsername, setEditingUsername] = useState(false)
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        loadProfile(session.user.id)
      }
    })
  }, [router])

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (data) {
      setProfile(data)
      setUsername(data.username)
      setFullName(data.full_name || '')
      setBio(data.bio || '')
    }
    setLoading(false)
  }

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      
      if (!e.target.files || e.target.files.length === 0) {
        return
      }

      const file = e.target.files[0]
      console.log('File selected:', file.name, file.size) // ADD THIS
 
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/avatar.${fileExt}`

      // Delete old avatar if exists
      if (profile?.avatar_url) {
        await supabase.storage.from('avatars').remove([profile.avatar_url])
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('id', user.id)

      if (updateError) throw updateError

      loadProfile(user.id)
      alert('Avatar updated!')
    } catch (error: any) {
      alert('Error uploading avatar: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const checkUsernameAvailable = async (newUsername: string) => {
    if (newUsername === profile?.username) return true
    
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', newUsername)
      .single()
    
    return !data
  }

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // If username changed, check if available
      if (username !== profile?.username) {
        const available = await checkUsernameAvailable(username)
        if (!available) {
          alert('Username already taken')
          setSaving(false)
          return
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username: username,
          full_name: fullName,
          bio: bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        if (error.message.includes('can only be changed once')) {
          alert('Username can only be changed once and you have already changed it.')
        } else {
          alert('Error updating profile: ' + error.message)
        }
      } else {
        alert('Profile updated!')
        setEditingUsername(false)
        loadProfile(user.id)
      }
    } catch (error: any) {
      alert('Error: ' + error.message)
    }

    setSaving(false)
  }

  const getAvatarUrl = (path: string | null) => {
  if (!path) return null
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  // Add timestamp to prevent caching
  return data.publicUrl + '?t=' + new Date().getTime()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

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
              <Link href="/my-pdfs" className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                My PDFs
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Edit Profile</h2>

          <div className="space-y-8">
            {/* Avatar Upload */}
            <div className="flex items-center gap-6">
              <div className="relative">
                {profile?.avatar_url ? (
                  <img
                    src={getAvatarUrl(profile.avatar_url) || ''}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                    {profile?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="text-white text-sm">Uploading...</div>
                  </div>
                )}
              </div>
              <div>
                <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block">
                  {profile?.avatar_url ? 'Change Avatar' : 'Upload Avatar'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={uploadAvatar}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF. Max 5MB.</p>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={updateProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    disabled={!editingUsername}
                    className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      !editingUsername ? 'bg-gray-100' : ''
                    }`}
                    minLength={3}
                    maxLength={30}
                    pattern="[a-z0-9_]+"
                  />
                  {profile?.can_change_username && !editingUsername && (
                    <button
                      type="button"
                      onClick={() => setEditingUsername(true)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Edit
                    </button>
                  )}
                  {editingUsername && (
                    <button
                      type="button"
                      onClick={() => {
                        setUsername(profile?.username || '')
                        setEditingUsername(false)
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                {profile?.can_change_username ? (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ Username can only be changed once!
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Username was changed on {new Date(profile?.username_changed_at || '').toLocaleDateString()}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself and your piano journey..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">{bio.length}/500 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>

            {/* View Public Profile */}
            <div className="pt-6 border-t border-gray-200">
              <Link
                href={`/u/${profile?.username}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View your public profile →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
