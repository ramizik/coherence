import { useState } from 'react';
import { UploadPage } from './components/upload/UploadPage';
import { ResultsPage } from './components/results/ResultsPage';
import { AuthProvider, useAuth } from './lib/auth';
import { AuthDialog } from './components/auth/AuthDialog';
import { IS_FIGMA_MAKE_MODE } from './lib/config';

type Page = 'upload' | 'results';

/**
 * App - Root component with simple client-side routing
 * 
 * Routes:
 * - / (upload page)
 * - /results/:id (results dashboard)
 * 
 * Dual-Mode Operation:
 * - Figma Make Mode: Auth bypassed, all screens accessible
 * - Production Mode: Real auth integration (when configured)
 * 
 * In production, this would use React Router or similar.
 * For now, using simple state-based navigation.
 */
export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('upload');
  const [videoId, setVideoId] = useState<string>('');

  const handleNavigateToResults = (id: string) => {
    setVideoId(id);
    setCurrentPage('results');
  };

  const handleNavigateToUpload = () => {
    setCurrentPage('upload');
    setVideoId('');
  };

  // Wrap app with AuthProvider for future auth integration
  // In Figma Make mode, auth is automatically bypassed
  return (
    <AuthProvider>
      <AppContent
        currentPage={currentPage}
        videoId={videoId}
        onNavigateToResults={handleNavigateToResults}
        onNavigateToUpload={handleNavigateToUpload}
      />
    </AuthProvider>
  );
}

/**
 * App content component
 */
function AppContent({
  currentPage,
  videoId,
  onNavigateToResults,
  onNavigateToUpload,
}: {
  currentPage: Page;
  videoId: string;
  onNavigateToResults: (id: string) => void;
  onNavigateToUpload: () => void;
}) {
  const { user, loading } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Show loading screen while checking auth (production mode only)
  // But don't block - show a minimal loading state
  if (loading && !IS_FIGMA_MAKE_MODE) {
    // Continue rendering the app, just show a subtle loading indicator
  }

  // Authentication is optional - users can use the site without being authenticated
  // Auth UI is available but doesn't block functionality
  const isAuthenticated = IS_FIGMA_MAKE_MODE || user;

  // Render current page (always accessible, regardless of auth status)
  return (
    <>
      {/* Optional Auth Dialog - shown on demand, doesn't block */}
      {showAuthDialog && !isAuthenticated && (
        <AuthDialog onClose={() => setShowAuthDialog(false)} />
      )}

      {/* Main app content - always accessible */}
      {currentPage === 'results' ? (
        <ResultsPage videoId={videoId} onBackToUpload={onNavigateToUpload} />
      ) : (
        <UploadPage onNavigateToResults={onNavigateToResults} />
      )}

      {/* Optional: Show subtle auth prompt for unauthenticated users (non-blocking) */}
      {!isAuthenticated && !IS_FIGMA_MAKE_MODE && !showAuthDialog && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setShowAuthDialog(true)}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-white text-sm transition-colors backdrop-blur-sm"
          >
            Sign in to save your progress
          </button>
        </div>
      )}
    </>
  );
}
