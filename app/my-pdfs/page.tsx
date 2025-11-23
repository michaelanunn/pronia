'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { FileText, Download, Trash2, Music, Calendar, FileCheck } from 'lucide-react'
import PDFUpload from '@/components/PDFUpload'

interface UserPDF {
  id: string
  filename: string
  original_filename: string
  file_path: string
  file_size: number
  uploaded_at: string
  notes: string | null
  is_annotated: boolean
  piece_id: string | null
  piece?: {
    title: string
    composer_name: string
  }
}

export default function MyPDFsPage() {
  const [pdfs, setPdfs] = useState<UserPDF[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchPDFs()
  }, [])

  const fetchPDFs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_pdfs')
        .select(`
          *,
          piece:piece_library(title, composer_name)
        `)
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false })

      if (error) throw error

      setPdfs(data || [])
    } catch (error) {
      console.error('Error fetching PDFs:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async (pdf: UserPDF) => {
    try {
      const { data, error } = await supabase.storage
        .from('user-pdfs')
        .download(pdf.file_path)

      if (error) throw error

      // Create download link
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = pdf.original_filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF')
    }
  }

  const deletePDF = async (pdf: UserPDF) => {
    if (!confirm(`Delete "${pdf.original_filename}"?`)) return

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('user-pdfs')
        .remove([pdf.file_path])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('user_pdfs')
        .delete()
        .eq('id', pdf.id)

      if (dbError) throw dbError

      // Refresh list
      fetchPDFs()
    } catch (error) {
      console.error('Error deleting PDF:', error)
      alert('Failed to delete PDF')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading your PDFs...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">My PDFs</h1>
          <p className="text-sm text-gray-600 mt-1">
            Your uploaded sheet music - accessible anywhere
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        
        {/* Upload Button */}
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="w-full mb-6 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          {showUpload ? 'Hide Upload' : '+ Upload New PDF'}
        </button>

        {/* Upload Component */}
        {showUpload && (
          <div className="mb-6">
            <PDFUpload
              onUploadComplete={() => {
                fetchPDFs()
                setShowUpload(false)
              }}
            />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-600">Total PDFs</p>
            <p className="text-2xl font-bold text-gray-900">{pdfs.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-600">Annotated</p>
            <p className="text-2xl font-bold text-gray-900">
              {pdfs.filter(p => p.is_annotated).length}
            </p>
          </div>
        </div>

        {/* PDFs List */}
        {pdfs.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No PDFs uploaded yet
            </h3>
            <p className="text-gray-600 mb-6">
              Upload your annotated sheet music to access it anywhere
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Upload Your First PDF
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {pdfs.map((pdf) => (
              <div
                key={pdf.id}
                className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
              >
                {/* PDF Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <FileText className="w-10 h-10 text-red-500 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {pdf.original_filename}
                      </h3>
                      
                      {/* Linked Piece */}
                      {pdf.piece && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                          <Music className="w-4 h-4" />
                          <span className="truncate">
                            {pdf.piece.title} - {pdf.piece.composer_name}
                          </span>
                        </div>
                      )}
                      
                      {/* File Info */}
                      <div className="flex items-center space-x-3 text-xs text-gray-500 mt-2">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(pdf.uploaded_at)}</span>
                        </span>
                        <span>{formatFileSize(pdf.file_size)}</span>
                        {pdf.is_annotated && (
                          <span className="flex items-center space-x-1 text-blue-600">
                            <FileCheck className="w-3 h-3" />
                            <span>Annotated</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-2">
                    <button
                      onClick={() => downloadPDF(pdf)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deletePDF(pdf)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Notes */}
                {pdf.notes && (
                  <div className="bg-gray-50 rounded p-3 text-sm text-gray-700">
                    <p className="font-medium text-gray-900 mb-1">Notes:</p>
                    <p>{pdf.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}