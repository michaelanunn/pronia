'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { AlertCircle } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// CRITICAL: Use HTTPS explicitly
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PieceCardProps {
  id: string;
  title: string;
  composer: string;
  pdfUrl: string;
}

export default function PieceCard({ id, title, composer, pdfUrl }: PieceCardProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    console.log('✅ PDF loaded:', title, 'Pages:', numPages);
  }

  function onDocumentLoadError(error: Error) {
    console.error('❌ PDF error:', error.message, 'URL:', pdfUrl);
    setLoading(false);
    setError(error.message);
  }

  return (
    <Link href={`/piece/${id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        {/* PDF First Page Preview */}
        <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <div className="text-sm text-gray-500">Loading...</div>
              </div>
            </div>
          )}

          {error ? (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mb-2" />
              <div className="text-sm text-red-600 mb-1">Failed to load PDF</div>
              <div className="text-xs text-gray-500">{error}</div>
            </div>
          ) : (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={null}
              error={null}
              options={{
                cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
                cMapPacked: true,
                standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/',
              }}
            >
              <Page
                pageNumber={1}
                width={300}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={null}
                error={null}
              />
            </Document>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 truncate">
            {title}
          </h3>
          <p className="text-sm text-gray-600 truncate">{composer}</p>
          {numPages && (
            <p className="text-xs text-gray-400 mt-1">{numPages} pages</p>
          )}
        </div>
      </div>
    </Link>
  );
}