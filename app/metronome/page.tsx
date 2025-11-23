'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FileText } from 'lucide-react'

export default function Metronome() {
  const [bpm, setBpm] = useState(120)
  const [isPlaying, setIsPlaying] = useState(false)
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [volume, setVolume] = useState(0.5)
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const nextNoteTimeRef = useRef(0)
  const currentNoteRef = useRef(0)
  const timerIdRef = useRef<number | null>(null)

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const scheduleNote = (beatNumber: number, time: number) => {
    if (!audioContextRef.current) return

    const osc = audioContextRef.current.createOscillator()
    const gainNode = audioContextRef.current.createGain()

    osc.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)

    // First beat of measure is higher pitch
    if (beatNumber % beatsPerMeasure === 0) {
      osc.frequency.value = 1000
    } else {
      osc.frequency.value = 800
    }

    gainNode.gain.value = volume
    
    osc.start(time)
    osc.stop(time + 0.05)

    setCurrentBeat(beatNumber % beatsPerMeasure)
  }

  const scheduler = () => {
    if (!audioContextRef.current) return

    const secondsPerBeat = 60.0 / bpm
    
    while (nextNoteTimeRef.current < audioContextRef.current.currentTime + 0.1) {
      scheduleNote(currentNoteRef.current, nextNoteTimeRef.current)
      nextNoteTimeRef.current += secondsPerBeat
      currentNoteRef.current++
    }
    
    timerIdRef.current = window.setTimeout(scheduler, 25)
  }

  const start = () => {
    if (!audioContextRef.current) return
    
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
    }

    setIsPlaying(true)
    currentNoteRef.current = 0
    nextNoteTimeRef.current = audioContextRef.current.currentTime
    scheduler()
  }

  const stop = () => {
    setIsPlaying(false)
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current)
      timerIdRef.current = null
    }
    setCurrentBeat(0)
  }

  const togglePlay = () => {
    if (isPlaying) {
      stop()
    } else {
      start()
    }
  }

  const presets = [
    { name: 'Largo', bpm: 45 },
    { name: 'Adagio', bpm: 66 },
    { name: 'Andante', bpm: 76 },
    { name: 'Moderato', bpm: 108 },
    { name: 'Allegro', bpm: 132 },
    { name: 'Presto', bpm: 168 },
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
            <Link href="/my-pdfs" className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              My PDFs
            </Link>
          </div>
        </div>
      </div>
    </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-center mb-8">Metronome</h1>

          {/* BPM Display */}
          <div className="text-center mb-8">
            <div className="text-7xl font-bold text-blue-600 mb-4">{bpm}</div>
            <div className="text-gray-600 text-lg">BPM</div>
          </div>

          {/* BPM Slider */}
          <div className="mb-8">
            <input
              type="range"
              min="40"
              max="240"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((bpm - 40) / 200) * 100}%, #e5e7eb ${((bpm - 40) / 200) * 100}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>40</span>
              <span>240</span>
            </div>
          </div>

          {/* Quick BPM Adjustments */}
          <div className="flex justify-center gap-2 mb-8">
            <button
              onClick={() => setBpm(Math.max(40, bpm - 10))}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
            >
              -10
            </button>
            <button
              onClick={() => setBpm(Math.max(40, bpm - 1))}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
            >
              -1
            </button>
            <button
              onClick={() => setBpm(Math.min(240, bpm + 1))}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
            >
              +1
            </button>
            <button
              onClick={() => setBpm(Math.min(240, bpm + 10))}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
            >
              +10
            </button>
          </div>

          {/* Play/Stop Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={togglePlay}
              className={`w-32 h-32 rounded-full text-white text-2xl font-bold shadow-lg transition transform hover:scale-105 ${
                isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isPlaying ? 'STOP' : 'START'}
            </button>
          </div>

          {/* Beat Indicator */}
          <div className="flex justify-center gap-2 mb-8">
            {Array.from({ length: beatsPerMeasure }).map((_, i) => (
              <div
                key={i}
                className={`w-12 h-12 rounded-full border-4 transition ${
                  isPlaying && currentBeat === i
                    ? i === 0
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-gray-400 border-gray-400'
                    : 'bg-white border-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Time Signature */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
              Beats per Measure
            </label>
            <div className="flex justify-center gap-2">
              {[2, 3, 4, 6].map((beats) => (
                <button
                  key={beats}
                  onClick={() => setBeatsPerMeasure(beats)}
                  className={`px-6 py-3 rounded-lg font-medium transition ${
                    beatsPerMeasure === beats
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {beats}/4
                </button>
              ))}
            </div>
          </div>

          {/* Volume Control */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
              Volume
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Tempo Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Tempo Presets
            </label>
            <div className="grid grid-cols-3 gap-3">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setBpm(preset.bpm)}
                  className="px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-center"
                >
                  <div className="font-medium">{preset.name}</div>
                  <div className="text-sm text-gray-600">{preset.bpm} BPM</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
