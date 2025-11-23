"use client";

import { useState, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Upload, File, X, Check } from "lucide-react";

interface PDFUploadProps {
  pieceId?: string;
  pieceName?: string;
  onUploadComplete?: (pdfId: string) => void;
}

export default function PDFUpload({
  pieceId,
  pieceName,
  onUploadComplete,
}: PDFUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnnotated, setIsAnnotated] = useState(false);
  const [notes, setNotes] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    // Validate file type
    if (selectedFile.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      setError("File size must be less than 10MB");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setUploadComplete(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadProgress(0);
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to upload files");
      }

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filename = `${timestamp}_${sanitizedFilename}`;
      const filePath = `${user.id}/${filename}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("user-pdfs")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      setUploadProgress(50);

      // Create database record
      const { data: pdfRecord, error: dbError } = await supabase
        .from("user_pdfs")
        .insert({
          user_id: user.id,
          piece_id: pieceId || null,
          filename: filename,
          original_filename: file.name,
          file_path: filePath,
          file_size: file.size,
          notes: notes || null,
          is_annotated: isAnnotated,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setUploadProgress(100);
      setUploadComplete(true);

      // Call callback if provided
      if (onUploadComplete && pdfRecord) {
        onUploadComplete(pdfRecord.id);
      }

      // Reset after 2 seconds
      setTimeout(() => {
        setFile(null);
        setNotes("");
        setIsAnnotated(false);
        setUploadComplete(false);
        setUploadProgress(0);
      }, 2000);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    setUploadComplete(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6">
        {/* Header */}
        {pieceName && (
          <div className="mb-4 pb-4 border-b">
            <p className="text-sm text-gray-600">Uploading for:</p>
            <p className="font-semibold text-gray-900">{pieceName}</p>
          </div>
        )}

        {/* File Input Area */}
        <div className="mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="pdf-upload"
          />

          {!file ? (
            <label
              htmlFor="pdf-upload"
              className="flex flex-col items-center justify-center cursor-pointer py-8"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Click to upload PDF
              </p>
              <p className="text-xs text-gray-500">Max file size: 10MB</p>
            </label>
          ) : (
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <File className="w-8 h-8 text-red-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              {!uploading && (
                <button
                  onClick={clearFile}
                  className="ml-2 p-1 hover:bg-gray-200 rounded-full flex-shrink-0"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1 text-center">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}

        {/* Success Message */}
        {uploadComplete && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800">PDF uploaded successfully!</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Optional Fields */}
        {file && !uploading && !uploadComplete && (
          <div className="space-y-3 mb-4">
            {/* Annotated Checkbox */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnnotated}
                onChange={(e) => setIsAnnotated(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">
                This PDF has my annotations/markings
              </span>
            </label>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this PDF (fingerings, tempo markings, etc.)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Upload Button */}
        {file && !uploadComplete && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? "Uploading..." : "Upload PDF"}
          </button>
        )}
      </div>

      {/* Mobile Instructions */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          📱 On mobile? Tap "Upload PDF" to choose from your device or use your
          camera to scan sheet music
        </p>
      </div>
    </div>
  );
}
