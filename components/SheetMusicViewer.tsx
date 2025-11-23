'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// CRITICAL: Use HTTPS explicitly
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface SheetMusicViewerProps {
  pdfUrl: string;
  title: string;
}

export default function SheetMusicViewer({ pdfUrl, title }: SheetMusicViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    console.log('✅ Sheet music loaded:', title, 'Pages:', numPages);
  }

  function onDocumentLoadError(error: Error) {
    console.error('❌ Sheet music error:', error.message);
  }

  return (
    <div className="flex flex-col items-center">
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        className="border rounded-lg shadow-lg"
        options={{
          cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/',
        }}
      >
        <Page 
          pageNumber={pageNumber} 
          width={800}
          renderTextLayer={true}
          renderAnnotationLayer={true}
        />
      </Document>
      
      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
          disabled={pageNumber <= 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        
        <p className="text-sm">
          Page {pageNumber} of {numPages}
        </p>
        
        <button
          onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
          disabled={pageNumber >= numPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
}