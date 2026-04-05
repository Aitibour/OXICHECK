import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white font-bold text-lg">
          O
        </div>
        <h1 className="mt-4 text-2xl font-bold text-secondary">
          Oxi<span className="text-primary">Check</span>
        </h1>
        <p className="mt-2 text-muted text-sm">
          Online Pre-Check-In Portal
        </p>
        <p className="mt-6 text-sm text-muted max-w-sm">
          If you received a check-in link via email or SMS, please click on it
          to start your online check-in.
        </p>
        <Link
          href="https://oxicheck.com"
          className="mt-6 inline-block text-sm text-primary hover:text-primary-dark"
        >
          Visit our website
        </Link>
      </div>
    </div>
  );
}
