'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { FileText, Search, X } from 'lucide-react'
import PDFUpload from '@/components/PDFUpload'
import PDFPreviewCard from '@/components/PDFPreviewCard'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedComposer, setSelectedComposer] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    console.log('PDFs state:', pdfs);
  }, [pdfs]);

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
        .from('scores')
        .download(pdf.file_path)

      if (error) throw error

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
      const { error: storageError } = await supabase.storage
        .from('scores')
        .remove([pdf.file_path])

      if (storageError) throw storageError

      const { error: dbError } = await supabase
        .from('user_pdfs')
        .delete()
        .eq('id', pdf.id)

      if (dbError) throw dbError

      fetchPDFs()
    } catch (error) {
      console.error('Error deleting PDF:', error)
      alert('Failed to delete PDF')
    }
  }

  // Get unique composers from PDFs
  const composers = Array.from(
    new Set(
      pdfs
        .filter(pdf => pdf.piece?.composer_name)
        .map(pdf => pdf.piece!.composer_name)
    )
  ).sort()

  // Filter PDFs based on search and composer
  const filteredPdfs = pdfs.filter(pdf => {
    const matchesSearch = 
      pdf.original_filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pdf.piece?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pdf.piece?.composer_name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesComposer = 
      !selectedComposer || 
      pdf.piece?.composer_name === selectedComposer

    return matchesSearch && matchesComposer
  })

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

      <div className="max-w-6xl mx-auto px-4 py-6">
        
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

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by filename, piece title, or composer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Composer Filter */}
          {composers.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Filter by Composer:</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedComposer(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    selectedComposer === null
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All Composers
                </button>
                {composers.map((composer) => (
                  <button
                    key={composer}
                    onClick={() => setSelectedComposer(composer)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      selectedComposer === composer
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {composer}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-600">Total PDFs</p>
            <p className="text-2xl font-bold text-gray-900">{pdfs.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-600">Filtered</p>
            <p className="text-2xl font-bold text-gray-900">{filteredPdfs.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-600">Composers</p>
            <p className="text-2xl font-bold text-gray-900">{composers.length}</p>
          </div>
        </div>

        {/* PDFs Grid */}
        {filteredPdfs.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {pdfs.length === 0 ? 'No PDFs uploaded yet' : 'No matching PDFs found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {pdfs.length === 0 
                ? 'Upload your annotated sheet music to access it anywhere'
                : 'Try adjusting your search or filters'
              }
            </p>
            {pdfs.length === 0 && (
              <button
                onClick={() => setShowUpload(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Upload Your First PDF
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPdfs.map((pdf) => {
              const { data } = supabase.storage
                .from('scores')
                .getPublicUrl(pdf.file_path);

              console.log('PDF URL for', pdf.original_filename, ':', data.publicUrl);

              return (
                <PDFPreviewCard
                  key={pdf.id}
                  pdf={pdf}
                  pdfUrl={data.publicUrl}
                  onDownload={() => downloadPDF(pdf)}
                  onDelete={() => deletePDF(pdf)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}