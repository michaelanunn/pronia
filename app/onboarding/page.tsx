'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [user, setUser] = useState<any>(null)
  const [username, setUsername] = useState('')
  const [pianoYears, setPianoYears] = useState('')
  const [learningMethod, setLearningMethod] = useState<'self-taught' | 'classes'>('classes')
  const [instrument, setInstrument] = useState('piano')
  const [uploading, setUploading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
      }
    })
  }, [router])

  const instruments = [
    { name: 'Piano', icon: '🎹' },
    { name: 'Guitar', icon: '🎸' },
    { name: 'Violin', icon: '🎻' },
    { name: 'Drums', icon: '🥁' },
    { name: 'Flute', icon: '🎺' },
    { name: 'Cello', icon: '🎻' },
  ]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const checkUsername = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single()
    
    return !data
  }

  const uploadAvatar = async () => {
    if (!avatarFile || !user) return null

    const fileExt = avatarFile.name.split('.').pop()
    const filePath = `${user.id}/avatar.${fileExt}`

    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile, { upsert: true })

    if (error) throw error
    return filePath
  }

  const completeOnboarding = async () => {
    setLoading(true)

    try {
      // Check username
      const available = await checkUsername()
      if (!available) {
        alert('Username taken!')
        setLoading(false)
        return
      }

      // Upload avatar if provided
      let avatarUrl = null
      if (avatarFile) {
        avatarUrl = await uploadAvatar()
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          piano_years: parseInt(pianoYears) || 0,
          learning_method: learningMethod,
          instrument: instrument.toLowerCase(),
          avatar_url: avatarUrl,
          onboarding_completed: true
        })
        .eq('id', user.id)

      if (error) throw error

      router.push('/dashboard')
    } catch (error: any) {
      alert('Error: ' + error.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex items-center justify-center mb-8">
          <Image src="/logo.png" alt="Pronia" width={48} height={48} />
          <h1 className="text-3xl font-bold ml-3">Welcome to Pronia!</h1>
        </div>

        {/* Step 1: Username */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Choose your username</h2>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
              minLength={3}
              maxLength={30}
            />
            <button
              onClick={() => username.length >= 3 && setStep(2)}
              disabled={username.length < 3}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2: Profile Picture */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Add a profile picture (optional)</h2>
            <div className="flex flex-col items-center mb-6">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-32 h-32 rounded-full object-cover mb-4" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <span className="text-4xl">📷</span>
                </div>
              )}
              <label className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Choose Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 bg-gray-200 py-3 rounded-lg">Back</button>
              <button onClick={() => setStep(3)} className="flex-1 bg-blue-600 text-white py-3 rounded-lg">Next</button>
            </div>
          </div>
        )}

        {/* Step 3: Instrument */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">What instrument do you play?</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {instruments.map((inst) => (
                <button
                  key={inst.name}
                  onClick={() => setInstrument(inst.name)}
                  className={`p-6 border-2 rounded-lg text-center transition ${
                    instrument === inst.name ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                  }`}
                >
                  <div className="text-4xl mb-2">{inst.icon}</div>
                  <div className="font-medium">{inst.name}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="flex-1 bg-gray-200 py-3 rounded-lg">Back</button>
              <button onClick={() => setStep(4)} className="flex-1 bg-blue-600 text-white py-3 rounded-lg">Next</button>
            </div>
          </div>
        )}

        {/* Step 4: Experience */}
        {step === 4 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">How long have you been playing?</h2>
            <input
              type="number"
              value={pianoYears}
              onChange={(e) => setPianoYears(e.target.value)}
              placeholder="Years"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-6"
              min="0"
              max="100"
            />
            
            <h3 className="font-medium mb-3">How did you learn?</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setLearningMethod('self-taught')}
                className={`p-4 border-2 rounded-lg ${
                  learningMethod === 'self-taught' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                }`}
              >
                Self-Taught
              </button>
              <button
                onClick={() => setLearningMethod('classes')}
                className={`p-4 border-2 rounded-lg ${
                  learningMethod === 'classes' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                }`}
              >
                Classes/Lessons
              </button>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(3)} className="flex-1 bg-gray-200 py-3 rounded-lg">Back</button>
              <button
                onClick={completeOnboarding}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Completing...' : 'Complete Setup'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}