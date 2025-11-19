import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <div className="text-center text-white px-4">
        <h1 className="text-7xl font-bold mb-4 tracking-tight">
          Pronia
        </h1>
        <p className="text-2xl mb-8 text-gray-100">
          Track every piece. Master your craft.
        </p>
        <p className="text-lg mb-12 text-gray-200 max-w-md mx-auto">
          The practice journal built by pianists, for pianists.
        </p>
        <Link
          href="/login"
          className="inline-block bg-white text-blue-700 px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition shadow-2xl"
        >
          Start Tracking →
        </Link>
      </div>
    </div>
  )
}