'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, FileVideo, X } from 'lucide-react';
import { SampleVideos } from './SampleVideos';

interface UploadZoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onAnalyze: () => void;
  isUploading?: boolean;
  error?: string | null;
}

/**
 * UploadZone - Interactive drag-and-drop upload area with file validation
 * 
 * States:
 * - Default: Empty upload zone with dashed border
 * - Hover: Brightened border
 * - Drag Active: Solid cyan border with "Drop to analyze" text
 * - File Selected: Shows file info with analyze button
 * 
 * Validation: MP4/MOV, max 500MB, max 3 minutes
 */
export function UploadZone({ selectedFile, onFileSelect, onAnalyze, isUploading = false, error: externalError }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Combine local and external errors
  const error = externalError || localError;

  const validateFile = (file: File): string | null => {
    // Check file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/mov'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|mov)$/i)) {
      return 'Please upload an MP4 or MOV file';
    }

    // Check file size (500MB = 524288000 bytes)
    const maxSize = 524288000;
    if (file.size > maxSize) {
      return 'File size must be less than 500MB';
    }

    return null;
  };

  const handleFile = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setLocalError(null);
    onFileSelect(file);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    onFileSelect(null as any);
    setLocalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col justify-center gap-12">
      {/* Upload Card */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!selectedFile ? handleBrowseClick : undefined}
        className={`
          relative w-full max-w-[600px] h-[480px] mx-auto
          bg-white/5 backdrop-blur-md rounded-2xl p-16
          border-2 transition-all duration-300
          ${isDragging 
            ? 'border-[#06B6D4] bg-white/10 border-solid' 
            : selectedFile
              ? 'border-[#8B5CF6]/50 border-solid'
              : 'border-[#8B5CF6]/50 border-dashed hover:border-[#8B5CF6] hover:bg-white/8 hover:-translate-y-1'
          }
          ${!selectedFile ? 'cursor-pointer' : ''}
          shadow-2xl shadow-purple-500/10
        `}
      >
        {selectedFile ? (
          // File Selected State
          <FileSelectedView 
            file={selectedFile}
            onRemove={handleRemoveFile}
            onAnalyze={onAnalyze}
            isUploading={isUploading}
          />
        ) : (
          // Default/Dragging State
          <div className="flex flex-col items-center justify-center h-full text-center">
            {/* Upload Icon with pulse animation */}
            <div className="mb-4 animate-pulse">
              <Upload className="w-16 h-16 text-[#8B5CF6]" strokeWidth={1.5} />
            </div>

            {/* Primary Text */}
            <p className="text-[20px] font-semibold text-white mb-2" style={{ fontWeight: 600 }}>
              {isDragging ? 'Drop to analyze' : 'Drop your presentation video here'}
            </p>

            {/* Secondary Text */}
            <p className="text-[16px] text-[#9CA3AF] mb-6">
              or click to browse files
            </p>

            {/* File Requirements */}
            <p className="text-[14px] text-[#6B7280]">
              MP4 or MOV • Max 500MB • Max 3 minutes
            </p>

            {/* CTA Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleBrowseClick();
              }}
              className="
                mt-8 px-8 py-3 rounded-xl font-semibold text-white
                bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4]
                hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105 hover:-translate-y-0.5
                transition-all duration-300
              "
              style={{ fontWeight: 600 }}
            >
              Browse Files
            </button>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,.mp4,.mov"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-center text-[#EF4444] text-[14px] -mt-4">
          {error}
        </div>
      )}

      {/* Sample Videos Section */}
      {!selectedFile && <SampleVideos />}
    </div>
  );
}

/**
 * FileSelectedView - Display selected file info with analyze button
 */
function FileSelectedView({ 
  file, 
  onRemove, 
  onAnalyze,
  isUploading = false,
}: { 
  file: File; 
  onRemove: () => void;
  onAnalyze: () => void;
  isUploading?: boolean;
}) {
  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {/* File Icon */}
      <div className="mb-4">
        <FileVideo className="w-16 h-16 text-[#8B5CF6]" strokeWidth={1.5} />
      </div>

      {/* File Name */}
      <p className="text-[18px] font-semibold text-white mb-2 text-center px-4 break-words" style={{ fontWeight: 600 }}>
        {file.name}
      </p>

      {/* File Size */}
      <p className="text-[14px] text-[#9CA3AF] mb-6">
        {fileSizeMB} MB
      </p>

      {/* Video Preview Placeholder */}
      <div className="w-48 h-32 bg-white/5 rounded-lg border border-white/10 mb-6 flex items-center justify-center">
        <FileVideo className="w-12 h-12 text-white/30" />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onRemove}
          disabled={isUploading}
          className="
            px-6 py-2.5 rounded-lg font-semibold text-white
            bg-white/5 border border-white/10
            hover:bg-white/10 hover:border-white/20
            transition-all duration-300
            flex items-center gap-2
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          style={{ fontWeight: 600 }}
        >
          <X className="w-4 h-4" />
          Remove
        </button>
        <button
          onClick={onAnalyze}
          disabled={isUploading}
          className="
            px-8 py-2.5 rounded-lg font-semibold text-white
            bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4]
            hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105
            transition-all duration-300
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          "
          style={{ fontWeight: 600 }}
        >
          {isUploading ? 'Uploading...' : 'Analyze Video'}
        </button>
      </div>
    </div>
  );
}