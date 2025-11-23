'use client'

import { useState } from 'react'
import { FileText, Trash2, Eye, Upload } from 'lucide-react'

interface SimplePieceCardProps {
  piece: {
    id: string
    title: string
    composer: string
    difficulty: number
    status: string
    notes: string | null
    pdf_url?: string | null
  }
  onEdit: (piece: any) => void
  onDelete: (id: string) => void
  onPdfUpload: (pieceId: string, file: File) => Promise<void>
  uploading: boolean
}

const difficultyLabels = [
  'Beginner', 'Elementary', 'Intermediate', 'Upper Intermediate',
  'Advanced', 'Very Advanced', 'Expert', 'Master', 'Virtuoso'
]

export default function SimplePieceCard({ 
  piece, 
  onEdit, 
  onDelete, 
  onPdfUpload,
  uploading 
}: SimplePieceCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handlePdfUploadClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/pdf'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        await onPdfUpload(piece.id, file)
      }
    }
    input.click()
  }

  const viewPdf = () => {
    if (piece.pdf_url) {
      window.open(piece.pdf_url, '_blank')
    }
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* PDF Preview/Upload Area */}
      <div 
        className="relative aspect-[3/4] bg-gray-50 cursor-pointer group"
        onClick={piece.pdf_url ? viewPdf : handlePdfUploadClick}
      >
        {piece.pdf_url ? (
          // Has PDF - show preview
          <div className="relative w-full h-full">
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              {/* PDF Icon/Preview */}
              <div className="text-center p-6">
                <FileText className="w-16 h-16 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">PDF Attached</p>
                <p className="text-xs text-gray-500 mt-1">Click to view</p>
              </div>
            </div>
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
              <Eye className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Delete PDF button */}
            {showDeleteConfirm ? (
              <div className="absolute top-2 right-2 bg-white rounded-lg shadow-lg p-2 space-y-2">
                <p className="text-xs text-gray-700 mb-2">Delete PDF?</p>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      // You'll need to add a deletePdf function
                      setShowDeleteConfirm(false)
                    }}
                    className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                  >
                    Yes
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowDeleteConfirm(false)
                    }}
                    className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                  >
                    No
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDeleteConfirm(true)
                }}
                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          // No PDF - show upload prompt
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
                <p className="text-sm font-medium text-gray-700">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Upload PDF
                </p>
                <p className="text-xs text-gray-500">
                  Tap to add your sheet music
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Piece Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div 
            className="flex-1 cursor-pointer" 
            onClick={() => onEdit(piece)}
          >
            <h3 className="font-semibold text-gray-900 truncate">
              {piece.title}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              {piece.composer}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (confirm('Delete this piece?')) {
                onDelete(piece.id)
              }
            }}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        {/* Status & Difficulty */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Difficulty</span>
            <span className="font-medium text-gray-900">
              {piece.difficulty}/9
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Status</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              piece.status === 'mastered' ? 'bg-green-100 text-green-800' :
              piece.status === 'learning' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {piece.status.charAt(0).toUpperCase() + piece.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Notes */}
        {piece.notes && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-gray-600 italic line-clamp-2">
              {piece.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}