'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import PDFUpload from '@/components/PDFUpload'

interface AddPieceWithPDFProps {
  pieceLibraryId: string
  pieceName: string
  composerName: string
  onComplete: () => void
}

export default function AddPieceWithPDF({ 
  pieceLibraryId, 
  pieceName, 
  composerName,
  onComplete 
}: AddPieceWithPDFProps) {
  const [step, setStep] = useState<'add-piece' | 'upload-pdf'>('add-piece')
  const [difficulty, setDifficulty] = useState<number>(5)
  const [status, setStatus] = useState<'learning' | 'practicing' | 'mastered'>('learning')
  const [notes, setNotes] = useState('')
  const [adding, setAdding] = useState(false)
  const supabase = createClientComponentClient()

  const addPieceToRepertoire = async () => {
    setAdding(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      const { error } = await supabase
        .from('pieces')
        .insert({
          user_id: user.id,
          piece_library_id: pieceLibraryId,
          difficulty,
          status,
          notes: notes || null
        })

      if (error) throw error

      // Move to upload step
      setStep('upload-pdf')
    } catch (error) {
      console.error('Error adding piece:', error)
      alert('Failed to add piece')
      setAdding(false)
    }
  }

  const skipPDFUpload = () => {
    onComplete()
  }

  if (step === 'upload-pdf') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            📄 Upload Your PDF (Optional)
          </h2>
          <p className="text-gray-600 mb-6">
            Do you have a PDF of <strong>{pieceName}</strong> with your annotations?
            Upload it to access it anywhere!
          </p>

          <PDFUpload
            pieceId={pieceLibraryId}
            pieceName={`${pieceName} - ${composerName}`}
            onUploadComplete={() => {
              setTimeout(onComplete, 1000)
            }}
          />

          <button
            onClick={skipPDFUpload}
            className="w-full mt-4 text-gray-600 py-2 hover:text-gray-900"
          >
            Skip for now
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Add to Your Repertoire
        </h2>
        <p className="text-gray-600 mb-6">
          {pieceName} - {composerName}
        </p>

        {/* Difficulty */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level: {difficulty}/9
          </label>
          <input
            type="range"
            min="1"
            max="9"
            value={difficulty}
            onChange={(e) => setDifficulty(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Beginner</span>
            <span>Virtuoso</span>
          </div>
        </div>

        {/* Status */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['learning', 'practicing', 'mastered'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`py-2 px-4 rounded-lg border-2 font-medium capitalize transition-colors ${
                  status === s
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this piece..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Add Button */}
        <button
          onClick={addPieceToRepertoire}
          disabled={adding}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {adding ? 'Adding...' : 'Add to Repertoire'}
        </button>
      </div>
    </div>
  )
}