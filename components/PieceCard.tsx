'use client';

import Link from 'next/link';
import { FileText } from 'lucide-react';

interface PieceCardProps {
  id: string;
  title: string;
  composer: string;
  pdfUrl: string;
}

export default function PieceCard({ id, title, composer, pdfUrl }: PieceCardProps) {
  return (
    <Link href={`/piece/${id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        {/* Simple PDF Preview - Clickable */}
        <div className="aspect-[3/4] bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center p-6 hover:from-blue-100 hover:to-purple-100 transition-colors">
          <FileText className="w-20 h-20 text-blue-600 mb-3" />
          <p className="text-xs text-blue-600 font-medium">Click to view</p>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 truncate" title={title}>
            {title}
          </h3>
          <p className="text-sm text-gray-600 truncate">{composer}</p>
        </div>
      </div>
    </Link>
  );
}