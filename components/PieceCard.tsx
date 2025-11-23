'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

// Import react-pdf with SSR disabled
const Document = dynamic(
  () => import('react-pdf').then((mod) => mod.Document),
  { ssr: false }
);
const Page = dynamic(
  () => import('react-pdf').then((mod) => mod.Page),
  { ssr: false }
);

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      import('react-pdf').then((pdfjs) => {
        pdfjs.pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.pdfjs.version}/build/pdf.worker.min.mjs`;
      });
    }
  }, []);

  const pdfOptions = useMemo(() => ({
    cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/',
  }), []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    console.log('✅ PDF loaded:', title, 'Pages:', numPages);
  }

  function onDocumentLoadError(error: Error) {
    console.error('❌ PDF error:', error.message);
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
          ) : mounted ? (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={null}
              error={null}
              options={pdfOptions}
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
          ) : null}
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