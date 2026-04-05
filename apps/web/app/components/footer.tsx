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
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
    { href: "/careers", label: "Careers" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/gdpr", label: "GDPR" },
  ],
};

export function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Background image matching hero style */}
      <div className="absolute inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=2070&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-navy/92" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-navy font-bold text-sm">
                O
              </div>
              <span className="text-xl font-semibold text-white tracking-tight">
                Oxi<span className="text-accent">Check</span>
              </span>
            </Link>
            <p className="mt-5 text-sm text-white/35 max-w-xs leading-relaxed font-light">
              Smart Pre-Check-In Solution for Any PMS. Streamline hotel arrivals
              and elevate guest experiences.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                {category}
              </h3>
              <ul className="mt-5 space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/35 hover:text-accent transition-colors duration-300 font-light"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-white/10 pt-8 text-center">
          <p className="text-xs text-white/25 font-light">
            &copy; {new Date().getFullYear()} OxiCheck. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
