'use client';

import { useState, useEffect, useRef } from 'react';
import { FileText, Download, Trash2, Music, Calendar, FileCheck } from 'lucide-react';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

interface PDFPreviewCardProps {
  pdf: {
    id: string;
    filename: string;
    original_filename: string;
    file_path: string;
    file_size: number;
    uploaded_at: string;
    notes: string | null;
    is_annotated: boolean;
    piece?: {
      title: string;
      composer_name: string;
    };
  };
  pdfUrl: string;
  onDownload: () => void;
  onDelete: () => void;
}

export default function PDFPreviewCard({ pdf, pdfUrl, onDownload, onDelete }: PDFPreviewCardProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadPdfThumbnail = async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        if (typeof window !== 'undefined') {
          // Use the worker copied to /public
          pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        }

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdfDoc: PDFDocumentProxy = await loadingTask.promise;
        const page: PDFPageProxy = await pdfDoc.getPage(1);
        
        const canvas = canvasRef.current;
        if (!canvas) {
          setError('Canvas not available');
          setLoading(false);
          return;
        }
        
        const viewport = page.getViewport({ scale: 1.5 });
        const context = canvas.getContext('2d');
        
        if (!context) {
          setError('Canvas context not available');
          setLoading(false);
          return;
        }
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const imgUrl = canvas.toDataURL();
        setThumbnailUrl(imgUrl);
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF thumbnail:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    loadPdfThumbnail();
  }, [pdfUrl, pdf.original_filename]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center overflow-hidden relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <FileText className="w-16 h-16 text-gray-300 mb-2 animate-pulse" />
            <div className="text-gray-400 text-sm">Loading preview...</div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <FileText className="w-16 h-16 text-red-300 mb-2" />
            <div className="text-red-400 text-xs text-center">{error}</div>
          </div>
        ) : thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={pdf.original_filename}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <FileText className="w-16 h-16 text-gray-300 mb-2" />
            <div className="text-gray-400 text-sm">No preview</div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {pdf.is_annotated && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 z-10">
            <FileCheck className="w-3 h-3" />
            Annotated
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-1 truncate" title={pdf.original_filename}>
          {pdf.original_filename.replace('.pdf', '')}
        </h3>

        {pdf.piece && (
          <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
            <Music className="w-4 h-4" />
            <span className="truncate">
              {pdf.piece.title} - {pdf.piece.composer_name}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(pdf.uploaded_at)}</span>
          </span>
          <span>{formatFileSize(pdf.file_size)}</span>
        </div>

        {pdf.notes && (
          <div className="bg-gray-50 rounded p-2 text-xs text-gray-700 mb-3">
            <p className="line-clamp-2">{pdf.notes}</p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onDownload}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
