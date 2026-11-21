import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="container-x flex min-h-[70vh] flex-col items-start justify-center py-24">
      <span className="eyebrow">404</span>
      <h1 className="mt-5 font-display text-5xl tracking-tight">This track does not exist.</h1>
      <p className="mt-3 text-sm text-silver">
        The page you were looking for has moved or never made it to the queue.
      </p>
      <Link href="/" className="btn-primary mt-8">
        <ArrowLeft className="h-4 w-4" />
        Back to Comfort
      </Link>
    </main>
  );
}
