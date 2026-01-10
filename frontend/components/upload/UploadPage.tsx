'use client';

import { useState } from 'react';
import { AnimatedBackground } from './AnimatedBackground';
import { HeroContent } from './HeroContent';
import { UploadZone } from './UploadZone';
import { ProcessingView } from './ProcessingView';
import { ProblemStatement } from '../landing/ProblemStatement';
import logoImage from '@/assets/0dc2a6ec5bf44ec754a0c89fbc29c9704b8064e2.png';
import { uploadVideo, validateVideoFile, VideoAnalysisError } from '@/lib/services/videoAnalysis';

/**
 * UploadPage - Landing page for Coherence AI presentation coaching platform
 * 
 * First page in the 3-page flow (Upload → Processing → Results).
 * Features a two-column layout with hero content and drag-and-drop upload zone.
 */
export function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (file: File) => {
    // Validate file before accepting
    const validationError = validateVideoFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }
    setUploadError(null);
    setSelectedFile(file);
  };

  const handleAnalyze = async () => {
    // BACKEND_HOOK: Upload video file
    // ─────────────────────────────────────────
    // Endpoint: POST /api/videos/upload
    // Request:  FormData with 'video' field (MP4/MOV/WebM, max 500MB)
    // Response: UploadResponse { videoId, status, estimatedTime, durationSeconds }
    // Success:  Navigate to /processing/{videoId}
    // Error:    Show toast with error.message, allow retry if retryable
    // Status:   CONNECTED ✅
    // ─────────────────────────────────────────
    
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const response = await uploadVideo(selectedFile);
      console.log('Upload successful:', response);
      setVideoId(response.videoId);
      setIsProcessing(true);
      // In real implementation with routing: router.push(`/processing/${response.videoId}`);
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
    // BACKEND_HOOK: Redirect to results page
    // router.push(`/results/${videoId}`);
    console.log('Processing complete! Redirecting to results for video:', videoId);
    // For now, just reset the state
    // In production, this would navigate to the results page
    // TODO: When routing is implemented: router.push(`/results/${videoId}`);
  };

  const handleCancelProcessing = () => {
    // Reset to upload view
    setIsProcessing(false);
    setSelectedFile(null);
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