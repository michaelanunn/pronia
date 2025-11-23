'use client'

import { useState, useEffect, type ChangeEvent } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { FileText, Upload, Trash2, Eye } from 'lucide-react'

interface PieceCardProps {
  piece: {
    id: string
    title: string
    composer_name: string
    difficulty: number
    status: string
  }
}

interface UserPDF {
  id: string
  file_path: string
  original_filename: string
  is_annotated: boolean
  uploaded_at: string
}

export default function PieceCard({ piece }: PieceCardProps) {
  const [pdf, setPdf] = useState<UserPDF | null>(null)
  const [pdfPreview, setPdfPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showUploadPrompt, setShowUploadPrompt] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchPDF()
  }, [piece.id])

  const fetchPDF = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check if user has uploaded a PDF for this piece
      const { data, error } = await supabase
        .from('user_pdfs')
        .select('*')
        .eq('user_id', user.id)
        .eq('piece_id', piece.id)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching PDF:', error)
        return
      }

      if (data) {
        setPdf(data)
        // Generate preview thumbnail (first page)
        generatePreview(data.file_path)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const generatePreview = async (filePath: string) => {
    try {
      // Get signed URL for the PDF
      const { data } = await supabase.storage
        .from('user-pdfs')
        .createSignedUrl(filePath, 3600) // 1 hour expiry

      if (data?.signedUrl) {
        setPdfPreview(data.signedUrl)
      }
    } catch (error) {
      console.error('Error generating preview:', error)
    }
  }

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File must be less than 10MB')
      return
    }

    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      // Generate filename
      const timestamp = Date.now()
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filename = `${timestamp}_${sanitizedFilename}`
      const filePath = `${user.id}/${filename}`

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('user-pdfs')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Create database record
      const { data: pdfRecord, error: dbError } = await supabase
        .from('user_pdfs')
        .insert({
          user_id: user.id,
          piece_id: piece.id,
          filename: filename,
          original_filename: file.name,
          file_path: filePath,
          file_size: file.size,
          is_annotated: true, // Assume it's annotated if they're uploading
        })
        .select()
        .single()

      if (dbError) throw dbError

      // Update UI
      setPdf(pdfRecord)
      generatePreview(filePath)
      setShowUploadPrompt(false)
      
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload PDF')
    } finally {
      setUploading(false)
    }
  }

  const viewPDF = async () => {
    if (!pdf) return

    try {
      const { data } = await supabase.storage
        .from('user-pdfs')
        .createSignedUrl(pdf.file_path, 3600)

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank')
      }
    } catch (error) {
      console.error('Error viewing PDF:', error)
      alert('Failed to open PDF')
    }
  }

  const deletePDF = async () => {
    if (!pdf) return
    if (!confirm('Delete this PDF?')) return

    try {
      // Delete from storage
      await supabase.storage
        .from('user-pdfs')
        .remove([pdf.file_path])

      // Delete from database
      await supabase
        .from('user_pdfs')
        .delete()
        .eq('id', pdf.id)

      // Update UI
      setPdf(null)
      setPdfPreview(null)
    } catch (error) {
      console.error('Error deleting PDF:', error)
      alert('Failed to delete PDF')
    }
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* PDF Preview Area */}
      <div 
        className="relative aspect-[3/4] bg-gray-50 cursor-pointer group"
        onClick={pdf ? viewPDF : () => setShowUploadPrompt(true)}
      >
        {pdf && pdfPreview ? (
          // Show PDF preview
          <div className="relative w-full h-full">
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <iframe
                src={`${pdfPreview}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full pointer-events-none"
                title={pdf.original_filename}
              />
            </div>
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
              <Eye className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                deletePDF()
              }}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Annotated badge */}
            {pdf.is_annotated && (
              <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                ✏️ Annotated
              </div>
            )}
          </div>
        ) : (
          // Show upload prompt
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <Upload className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              {uploading ? 'Uploading...' : 'Upload PDF'}
            </p>
            <p className="text-xs text-gray-500">
              Tap to add your sheet music
            </p>
          </div>
        )}

        {/* Hidden file input */}
        {showUploadPrompt && (
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
            disabled={uploading}
          />
        )}
      </div>

      {/* Piece Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">
          {piece.title}
        </h3>
        <p className="text-sm text-gray-600 truncate">
          {piece.composer_name}
        </p>
        
        {/* Status & Difficulty */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded capitalize">
            {piece.status}
          </span>
          <span className="text-xs text-gray-500">
            Difficulty: {piece.difficulty}/9
          </span>
        </div>

        {/* PDF Info */}
        {pdf && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <FileText className="w-3 h-3" />
              <span className="truncate">{pdf.original_filename}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
