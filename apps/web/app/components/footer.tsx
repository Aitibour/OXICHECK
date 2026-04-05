import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-navy py-4">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-1.5">
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#c9a55c"/><path d="M8 16C8 11.6 11.6 8 16 8C20.4 8 24 11.6 24 16C24 20.4 20.4 24 16 24C11.6 24 8 20.4 8 16Z" stroke="#0c1222" strokeWidth="2.5" fill="none"/><path d="M13 16L15 18L19 13" stroke="#0c1222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="text-xs font-semibold text-white/50">Oxi<span className="text-accent/70">Check</span></span>
        </Link>
        <div className="flex items-center gap-5">
          {["Features", "Pricing", "Integrations", "Contact", "Privacy", "Terms"].map(l => (
            <Link key={l} href={l === "Features" ? "/#features" : `/${l.toLowerCase()}`} className="text-[10px] text-white/20 hover:text-accent transition-colors">{l}</Link>
          ))}
        </div>
        <p className="text-[9px] text-white/10">&copy; {new Date().getFullYear()} OxiCheck</p>
      </div>
    </footer>
  );
}
