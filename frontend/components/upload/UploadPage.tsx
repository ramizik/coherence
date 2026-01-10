'use client';

import { useState } from 'react';
import { AnimatedBackground } from './AnimatedBackground';
import { HeroContent } from './HeroContent';
import { UploadZone } from './UploadZone';
import { ProcessingView } from './ProcessingView';
import { ProblemStatement } from '../landing/ProblemStatement';
import logoImage from '@/assets/0dc2a6ec5bf44ec754a0c89fbc29c9704b8064e2.png';

/**
 * UploadPage - Landing page for Coherence AI presentation coaching platform
 * 
 * First page in the 3-page flow (Upload → Processing → Results).
 * Features a two-column layout with hero content and drag-and-drop upload zone.
 */
export function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleAnalyze = () => {
    // BACKEND_HOOK: Upload video file
    // API: POST /api/videos/upload
    // Request: multipart/form-data with 'video' field
    // Response: { videoId: string, status: 'processing', estimatedTime: number }
    // Success: Redirect to /processing/{videoId}
    // Error: Show toast with error.message, allow retry
    
    if (!selectedFile) return;
    
    // Mock implementation - switch to processing view
    const mockVideoId = crypto.randomUUID();
    console.log('Uploading file:', selectedFile?.name, '→ videoId:', mockVideoId);
    setIsProcessing(true);
    // In real implementation: router.push(`/processing/${mockVideoId}`);
  };

  const handleProcessingComplete = () => {
    // BACKEND_HOOK: Redirect to results page
    // router.push(`/results/${videoId}`);
    console.log('Processing complete! Redirecting to results...');
    // For now, just reset the state
    // In production, this would navigate to the results page
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
        {isProcessing && selectedFile ? (
          <ProcessingView 
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
            />
          </div>
        )}
      </div>

      {/* Problem Statement Section - Only show when not processing */}
      {!isProcessing && <ProblemStatement />}
    </div>
  );
}