'use client'

import { FileText } from 'lucide-react'

export interface DashboardPiece {
  id: string
  title: string
  composer: string
  difficulty: number
  status: string
  notes?: string | null
  pdf_url?: string | null
}

interface SimplePieceCardProps {
  piece: DashboardPiece
  difficultyLabels: string[]
  onEdit: (piece: DashboardPiece) => void
  onDelete: (id: string) => void
  onPdfUpload: (pieceId: string, file: File) => void
  uploading: boolean
}

export default function SimplePieceCard({
  piece,
  difficultyLabels,
  onEdit,
  onDelete,
  onPdfUpload,
  uploading,
}: SimplePieceCardProps) {
  return (
    <div
      className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
      onClick={() => onEdit(piece)}
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
            onDelete(piece.id)
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
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              piece.status === 'mastered'
                ? 'bg-green-100 text-green-800'
                : piece.status === 'learning'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {piece.status.charAt(0).toUpperCase() + piece.status.slice(1)}
          </span>
        </div>

        {piece.notes && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600 italic">{piece.notes}</p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200">
          {piece.pdf_url ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                window.open(piece.pdf_url || '#', '_blank', 'noopener,noreferrer')
              }}
              className="w-full flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800 hover:bg-blue-100 transition"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="font-semibold">Open PDF</span>
              </div>
              <span className="text-xs text-blue-700">Tap to view</span>
            </button>
          ) : (
            <div className="relative w-full rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50 transition">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>No PDF attached yet</span>
                </div>
                <span className="text-sm font-semibold text-blue-700">
                  {uploading ? 'Uploading...' : 'Upload PDF'}
                </span>
              </div>
              <input
                id={`pdf-upload-${piece.id}`}
                type="file"
                accept="application/pdf"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onPdfUpload(piece.id, file)
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
