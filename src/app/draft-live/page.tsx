import LiveDraftTracker from '../components/LiveDraftTracker';
import Link from 'next/link';

export default function DraftPage() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <Link 
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            ← Back to Daily Games
          </Link>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <Link 
            href="/teams"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            View Teams
          </Link>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <Link 
            href="/weekly"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            Weekly Schedule
          </Link>
        </div>
        
        <LiveDraftTracker />
      </div>
    </div>
  );
}
