import { useState } from 'react';
import { UploadPage } from './components/upload/UploadPage';
import { ResultsPage } from './components/results/ResultsPage';

type Page = 'upload' | 'results';

/**
 * App - Root component with simple client-side routing
 * 
 * Routes:
 * - / (upload page)
 * - /results/:id (results dashboard)
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

  // Render current page
  if (currentPage === 'results') {
    return <ResultsPage videoId={videoId} onBackToUpload={handleNavigateToUpload} />;
  }

  return <UploadPage onNavigateToResults={handleNavigateToResults} />;
}
