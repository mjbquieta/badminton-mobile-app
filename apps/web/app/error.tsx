'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="bg-secondary border border-danger/30 rounded-2xl p-8 max-w-md text-center">
        <h2 className="text-xl font-bold text-danger mb-2">Something went wrong</h2>
        <p className="text-light-300 text-sm mb-6">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl bg-accent text-primary font-semibold hover:bg-accent/80"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
