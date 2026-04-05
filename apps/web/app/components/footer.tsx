import Link from "next/link";

const footerLinks = {
  Product: [
    { href: "/#features", label: "Features" },
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/integrations", label: "Integrations" },
    { href: "/pricing", label: "Pricing" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/blog", label: "Blog" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/gdpr", label: "GDPR" },
  ],
};

function FooterLogo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="#c9a55c" />
        <path d="M8 16C8 11.6 11.6 8 16 8C20.4 8 24 11.6 24 16C24 20.4 20.4 24 16 24C11.6 24 8 20.4 8 16Z" stroke="#0c1222" strokeWidth="2.5" fill="none" />
        <path d="M13 16L15 18L19 13" stroke="#0c1222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-base font-semibold text-white tracking-tight">
        Oxi<span className="text-accent">Check</span>
      </span>
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Background image matching hero */}
      <div className="absolute inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=2070&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-navy/93" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="shrink-0">
            <FooterLogo />
            <p className="mt-3 text-xs text-white/30 max-w-[200px] leading-relaxed font-light">
              Smart Pre-Check-In for Any PMS.
            </p>
          </div>

          <div className="flex gap-12 sm:gap-16">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                  {category}
                </h3>
                <ul className="mt-3 space-y-2">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-xs text-white/30 hover:text-accent transition-colors duration-300 font-light"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-white/5 pt-5 text-center">
          <p className="text-[10px] text-white/20 font-light">
            &copy; {new Date().getFullYear()} OxiCheck. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
