import Link from "next/link";

function FooterLogo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="#c9a55c" />
        <path d="M8 16C8 11.6 11.6 8 16 8C20.4 8 24 11.6 24 16C24 20.4 20.4 24 16 24C11.6 24 8 20.4 8 16Z" stroke="#0c1222" strokeWidth="2.5" fill="none" />
        <path d="M13 16L15 18L19 13" stroke="#0c1222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-sm font-semibold text-white/60 tracking-tight">
        Oxi<span className="text-accent/80">Check</span>
      </span>
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="bg-navy">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <FooterLogo />
          <div className="flex items-center gap-6">
            {[
              { href: "/#features", label: "Features" },
              { href: "/pricing", label: "Pricing" },
              { href: "/integrations", label: "Integrations" },
              { href: "/contact", label: "Contact" },
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[11px] text-white/25 hover:text-accent transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-[10px] text-white/15">
            &copy; {new Date().getFullYear()} OxiCheck
          </p>
        </div>
      </div>
    </footer>
  );
}
