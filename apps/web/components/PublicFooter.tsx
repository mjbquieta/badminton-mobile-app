import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="relative z-10 text-center py-10 text-light-300 text-xs flex flex-col items-center gap-2">
      <Link
        href="/feedback"
        className="text-light-200 hover:text-light-100 transition-colors"
      >
        Feedback &amp; Bug Reports
      </Link>
      <span>RallyUp &copy; {new Date().getFullYear()}</span>
    </footer>
  );
}
