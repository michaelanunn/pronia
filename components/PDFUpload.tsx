'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Upload, X, Search } from 'lucide-react'

interface Composer {
  id: string
  name: string
}

interface PDFUploadProps {
  onUploadComplete: () => void
  pieceId?: string
  pieceName?: string
}

export default function PDFUpload({ onUploadComplete, pieceId, pieceName }: PDFUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [notes, setNotes] = useState('')
  const [isAnnotated, setIsAnnotated] = useState(false)
  const [composers, setComposers] = useState<Composer[]>([])
  const [selectedComposer, setSelectedComposer] = useState<string | null>(null)
  const [composerSearch, setComposerSearch] = useState('')
  const [showComposerDropdown, setShowComposerDropdown] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchComposers()
  }, [])

  const fetchComposers = async () => {
    const { data, error } = await supabase
      .from('composers')
      .select('id, name')
      .order('name')

    if (data && !error) {
      setComposers(data)
    }
  }

  const filteredComposers = composers.filter(composer =>
    composer.name.toLowerCase().includes(composerSearch.toLowerCase())
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
    } else {
      alert('Please select a PDF file')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file')
      return
    }

    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const timestamp = Date.now()
      const fileName = `${user.id}/${timestamp}-${file.name}`
      
      const { error: uploadError } = await supabase.storage
        .from('scores')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { error: dbError } = await supabase
        .from('user_pdfs')
        .insert({
          user_id: user.id,
          filename: `${timestamp}-${file.name}`,
          original_filename: pieceName || file.name,
          file_path: fileName,
          file_size: file.size,
          notes: notes || null,
          is_annotated: isAnnotated,
          composer_id: selectedComposer || null,
          piece_id: pieceId || null
        })

      if (dbError) throw dbError

      setFile(null)
      setNotes('')
      setIsAnnotated(false)
      setSelectedComposer(null)
      setComposerSearch('')
      
      alert('PDF uploaded successfully!')
      onUploadComplete()
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload PDF')
    } finally {
      setUploading(false)
    }
  }

  const selectedComposerData = composers.find(c => c.id === selectedComposer)

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="font-semibold text-lg mb-4">Upload PDF</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select PDF File
        </label>
        <div className="relative">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            id="pdf-upload"
          />
          <label
            htmlFor="pdf-upload"
            className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition"
          >
            {file ? (
              <div className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-700">{file.name}</span>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    setFile(null)
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">Click to upload PDF</span>
              </div>
            )}
          </label>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Link to Composer (Optional)
        </label>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search for a composer..."
              value={composerSearch}
              onChange={(e) => {
                setComposerSearch(e.target.value)
                setShowComposerDropdown(true)
              }}
              onFocus={() => setShowComposerDropdown(true)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {selectedComposerData && (
            <div className="mt-2 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <span className="text-sm text-blue-900 font-medium">
                Selected: {selectedComposerData.name}
              </span>
              <button
                onClick={() => {
                  setSelectedComposer(null)
                  setComposerSearch('')
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {showComposerDropdown && composerSearch && !selectedComposer && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredComposers.length > 0 ? (
                filteredComposers.map((composer) => (
                  <button
                    key={composer.id}
                    onClick={() => {
                      setSelectedComposer(composer.id)
                      setComposerSearch(composer.name)
                      setShowComposerDropdown(false)
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm transition"
                  >
                    {composer.name}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">
                  No composers found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about this PDF..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="mb-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnnotated}
            onChange={(e) => setIsAnnotated(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">This PDF is annotated</span>
        </label>
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
      >
        {uploading ? 'Uploading...' : 'Upload PDF'}
      </button>

      {showComposerDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowComposerDropdown(false)}
        />
      )}
    </div>
  )
}