import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="bg-secondary border border-dark-100 rounded-2xl p-8 max-w-md text-center">
        <h2 className="text-3xl font-bold mb-2">404</h2>
        <p className="text-light-300 text-sm mb-6">Page not found</p>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-accent text-primary font-semibold hover:bg-accent/80 inline-block"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
