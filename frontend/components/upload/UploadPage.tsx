'use client';

import { useState } from 'react';
import { AnimatedBackground } from './AnimatedBackground';
import { HeroContent } from './HeroContent';
import { UploadZone } from './UploadZone';
import { ProcessingView } from './ProcessingView';
import { ProblemStatement } from '../landing/ProblemStatement';
import logoImage from 'figma:asset/0dc2a6ec5bf44ec754a0c89fbc29c9704b8064e2.png';
import { uploadVideo, VideoAnalysisError } from '../../lib/api';

interface UploadPageProps {
  onNavigateToResults: (videoId: string) => void;
}

/**
 * UploadPage - Landing page for Coherence AI presentation coaching platform
 *
 * First page in the 3-page flow (Upload → Processing → Results).
 * Features a two-column layout with hero content and drag-and-drop upload zone.
 */
export function UploadPage({ onNavigateToResults }: UploadPageProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string>('');

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadError(null); // Clear any previous errors
  };

  const handleAnalyze = async () => {
    // BACKEND_HOOK: Upload video file
    // ─────────────────────────────────────────
    // Endpoint: POST /api/videos/upload
    // Request:  FormData with 'video' field (MP4/MOV, max 500MB)
    // Response: UploadResponse { videoId, status, estimatedTime }
    // Success:  Navigate to processing view
    // Error:    Show toast with error.message, allow retry if retryable
    // Status:   CONNECTED ✅
    // ─────────────────────────────────────────

    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      console.log('Uploading file:', selectedFile.name);
      const response = await uploadVideo(selectedFile);
      console.log('Upload successful:', response);

      setVideoId(response.videoId);
      setIsProcessing(true);
    } catch (error) {
      console.error('Upload failed:', error);
      if (error instanceof VideoAnalysisError) {
        setUploadError(error.message);
      } else {
        setUploadError('Failed to upload video. Please check if the backend server is running.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleProcessingComplete = () => {
    // BACKEND_HOOK: Navigate to results page after processing complete
    // ─────────────────────────────────────────
    // Success:  Navigate to /results/{videoId}
    // ─────────────────────────────────────────
    console.log('Processing complete! Redirecting to results...');
    onNavigateToResults(videoId);
  };

  const handleCancelProcessing = () => {
    // Reset to upload view
    setIsProcessing(false);
    setSelectedFile(null);
    setVideoId('');
    console.log('Processing cancelled');
  };

  return (
    <div className="relative w-full bg-[#0F172A]">{/* Hero Section */}
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Animated background with gradient mesh and floating shapes */}
        <AnimatedBackground />

        {/* Logo - Fixed at top left */}
        <div className="absolute top-8 left-8 z-20">
          <img
            src={logoImage}
            alt="Coherence Logo"
            className="h-32 w-auto"
          />
        </div>

        {/* Conditional rendering: Upload view or Processing view */}
        {isProcessing && selectedFile && videoId ? (
          <ProcessingView
            videoId={videoId}
            videoName={selectedFile.name}
            onComplete={handleProcessingComplete}
            onCancel={handleCancelProcessing}
          />
        ) : (
          /* Main content - Two column grid */
          <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 px-12 lg:px-16 xl:px-24 pt-32 pb-24">
            {/* Left Column - Hero Content */}
            <HeroContent />

            {/* Right Column - Upload Zone */}
            <UploadZone
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              onAnalyze={handleAnalyze}
              isUploading={isUploading}
              error={uploadError}
            />
          </div>
        )}
      </div>

      {/* Problem Statement Section - Only show when not processing */}
      {!isProcessing && <ProblemStatement />}
    </div>
  );
}