"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/integrations", label: "Integrations" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

function Logo({ light }: { light: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="#c9a55c" />
        <path d="M8 16C8 11.6 11.6 8 16 8C20.4 8 24 11.6 24 16C24 20.4 20.4 24 16 24C11.6 24 8 20.4 8 16Z" stroke="#0c1222" strokeWidth="2.5" fill="none" />
        <path d="M13 16L15 18L19 13" stroke="#0c1222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className={`text-lg font-semibold tracking-tight transition-colors duration-500 ${light ? "text-white" : "text-navy"}`}>
        Oxi<span className="text-accent">Check</span>
      </span>
    </Link>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Logo light={!scrolled} />

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors duration-300 ${
                scrolled
                  ? "text-muted hover:text-navy"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className={`text-sm font-medium transition-colors duration-300 ${
              scrolled
                ? "text-muted hover:text-navy"
                : "text-white/70 hover:text-white"
            }`}
          >
            Log in
          </Link>
          <Link
            href="/contact"
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-navy hover:bg-accent-light transition-all duration-300 shadow-lg shadow-accent/20"
          >
            Request Demo
          </Link>
        </div>

        <button
          className={`md:hidden p-2 transition-colors ${
            scrolled ? "text-navy" : "text-white"
          }`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-navy border-t border-white/10"
          >
            <div className="px-6 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm font-medium text-white/70 hover:text-white transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <Link href="/login" className="block text-sm font-medium text-white/70">
                  Log in
                </Link>
                <Link
                  href="/contact"
                  className="block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-navy text-center"
                >
                  Request Demo
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
