'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PieceCardProps {
  id: string;
  title: string;
  composer: string;
  pdfUrl: string;
}

export default function PieceCard({ id, title, composer, pdfUrl }: PieceCardProps) {
  const [numPages, setNumPages] = useState<number | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <Link href={`/piece/${id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        {/* PDF First Page Preview */}
        <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center overflow-hidden">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400">Loading...</div>
              </div>
            }
            error={
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400">Failed to load PDF</div>
              </div>
            }
          >
            <Page
              pageNumber={1}
              width={300}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 truncate">
            {title}
          </h3>
          <p className="text-sm text-gray-600 truncate">{composer}</p>
        </div>
      </div>
    </Link>
  );
}