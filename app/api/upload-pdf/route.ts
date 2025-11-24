import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createCanvas } from 'canvas'
import * as pdfParse from 'pdf-parse'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Need service role key for server-side uploads
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    const pieceId = formData.get('pieceId') as string | null

    if (!file || !userId) {
      return NextResponse.json({ error: 'Missing file or userId' }, { status: 400 })
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Generate unique filename
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const pdfPath = `${userId}/${timestamp}-${safeName}`
    const thumbnailPath = `${userId}/${timestamp}-${safeName.replace('.pdf', '.jpg')}`

    // 1. Upload original PDF
    const { error: pdfUploadError } = await supabase.storage
      .from('scores')
      .upload(pdfPath, buffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: true
      })

    if (pdfUploadError) throw pdfUploadError

    // 2. Generate thumbnail from first page
    try {
      const pdfData = await pdfParse(buffer)
      
      // Create a simple thumbnail (we'll render a placeholder for now)
      // For actual PDF rendering, we'd need pdf.js or similar
      const canvas = createCanvas(300, 400)
      const ctx = canvas.getContext('2d')
      
      // Draw a simple gradient background
      const gradient = ctx.createLinearGradient(0, 0, 300, 400)
      gradient.addColorStop(0, '#DBEAFE')
      gradient.addColorStop(1, '#E9D5FF')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 300, 400)
      
      // Add file icon (simple representation)
      ctx.fillStyle = '#2563EB'
      ctx.font = 'bold 20px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('PDF', 150, 200)
      ctx.font = '14px Arial'
      ctx.fillText(`${pdfData.numpages} pages`, 150, 230)
      
      const thumbnailBuffer = canvas.toBuffer('image/jpeg', { quality: 0.8 })

      // 3. Upload thumbnail
      const { error: thumbnailUploadError } = await supabase.storage
        .from('thumbnails')
        .upload(thumbnailPath, thumbnailBuffer, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true
        })

      if (thumbnailUploadError) throw thumbnailUploadError

    } catch (thumbError) {
      console.error('Thumbnail generation error:', thumbError)
      // Continue anyway - thumbnail is optional
    }

    // 4. Get public URLs
    const { data: pdfUrlData } = supabase.storage.from('scores').getPublicUrl(pdfPath)
    const { data: thumbnailUrlData } = supabase.storage.from('thumbnails').getPublicUrl(thumbnailPath)

    // 5. Update database if pieceId provided
    if (pieceId) {
      const { error: updateError } = await supabase
        .from('pieces')
        .update({
          pdf_url: pdfUrlData.publicUrl,
          thumbnail_url: thumbnailUrlData.publicUrl
        })
        .eq('id', pieceId)

      if (updateError) throw updateError
    }

    return NextResponse.json({
      success: true,
      pdfUrl: pdfUrlData.publicUrl,
      thumbnailUrl: thumbnailUrlData.publicUrl
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eHlycWVteGN0b2FiZ2hydHRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzUxMDc0NCwiZXhwIjoyMDc5MDg2NzQ0fQ.VlUCGZyQkV_k_vwGoplQaGtYNeB9uEeBsIig48AAOhM