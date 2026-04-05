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
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-navy font-bold text-sm">
                O
              </div>
              <span className="text-xl font-semibold text-secondary tracking-tight">
                Oxi<span className="text-accent">Check</span>
              </span>
            </Link>
            <p className="mt-5 text-sm text-muted max-w-xs leading-relaxed font-light">
              Smart Pre-Check-In Solution for Any PMS. Streamline hotel arrivals
              and elevate guest experiences.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider">
                {category}
              </h3>
              <ul className="mt-5 space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted hover:text-primary transition-colors duration-300 font-light"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-gray-100 pt-8 text-center">
          <p className="text-xs text-muted/60 font-light">
            &copy; {new Date().getFullYear()} OxiCheck. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
