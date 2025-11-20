'use client'
import Link from 'next/link'
import Image from 'next/image'

export default function Metronome() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Pronia" width={32} height={32} />
              <h1 className="text-2xl font-bold text-gray-900">Pronia</h1>
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Metronome</h1>
          <p className="text-gray-600">Coming soon! You'll code this later.</p>
        </div>
      </main>
    </div>
  )
}