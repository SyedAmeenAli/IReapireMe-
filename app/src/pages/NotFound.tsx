import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center pt-24">
      <div className="text-center">
        <p className="text-8xl font-bold text-neutral-200 mb-4">404</p>
        <h1 className="text-h-xl text-neutral-950 mb-2">Page Not Found</h1>
        <p className="text-b-sm text-neutral-500 mb-6">The page you are looking for does not exist.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-950 text-white rounded-lg text-b-sm font-medium hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
