"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  { quote: "Check-in time reduced by 70%. No more queues at peak times.", author: "Amira Bensalem", role: "Front Office", hotel: "Royal Thalassa, Tunisia", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&auto=format&fit=crop&crop=face" },
  { quote: "Connected to Opera in under an hour. Staff finally focuses on guests.", author: "Karim Medjdoub", role: "GM", hotel: "Sofitel Algiers, Algeria", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop&crop=face" },
  { quote: "ID verification and police reporting handled automatically.", author: "Fatima Zahra El Idrissi", role: "Ops Director", hotel: "La Mamounia, Morocco", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop&crop=face" },
  { quote: "95% completion rate in the first month. Guests love the convenience.", author: "Sophie Durand", role: "Revenue Mgr", hotel: "Le Meurice, France", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop&crop=face" },
  { quote: "Multi-language support is a game-changer for international guests.", author: "Marc-André Tremblay", role: "VP Ops", hotel: "Fairmont, Canada", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop&crop=face" },
  { quote: "Upsell feature alone generated $12K additional revenue last quarter.", author: "Rachel Thompson", role: "Guest Services", hotel: "Ritz-Carlton, USA", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=100&auto=format&fit=crop&crop=face" },
  { quote: "Handles every nationality, every document type, flawlessly.", author: "Youssef Bennani", role: "Hotel Manager", hotel: "Riad Fès, Morocco", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop&crop=face" },
  { quote: "Integrated across 12 properties. Consistency has been remarkable.", author: "Carlos Fernández", role: "CTO", hotel: "Meliá Hotels, Spain", image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=100&auto=format&fit=crop&crop=face" },
  { quote: "Drop-off rate went from 18% to under 5% with the analytics.", author: "Nadia Boudiaf", role: "QA Manager", hotel: "Sheraton, Algeria", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop&crop=face" },
  { quote: "GDPR compliance handled end-to-end. Peace of mind for legal.", author: "Olfa Makhlouf", role: "Compliance", hotel: "Four Seasons, Tunisia", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop&crop=face" },
];

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started.current) {
          started.current = true;
          const dur = 2000;
          const steps = 60;
          const inc = target / steps;
          let cur = 0;
          const timer = setInterval(() => {
            cur += inc;
            if (cur >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(cur));
          }, dur / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export function TestimonialsSection() {
  const [page, setPage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setPage(p => (p + 1) % testimonials.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const visible = [0, 1, 2].map(offset => testimonials[(page + offset) % testimonials.length]!);

  return (
    <section className="py-8 sm:py-10 bg-surface overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          {/* Stats - compact */}
          <div className="lg:w-1/5 shrink-0 text-center lg:text-left">
            <span className="text-[10px] font-semibold text-accent uppercase tracking-[0.2em]">Trusted</span>
            <h2 className="mt-1 font-display text-xl text-secondary sm:text-2xl leading-tight">
              Hotels <span className="italic">love</span> us
            </h2>
            <div className="mt-3 grid grid-cols-4 lg:grid-cols-2 gap-2">
              {[
                { value: 70, suffix: "%", label: "Faster" },
                { value: 95, suffix: "%", label: "Complete" },
                { value: 500, suffix: "+", label: "Hotels" },
                { value: 2, suffix: "M+", label: "Check-ins" },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-lg font-semibold text-navy"><CountUp target={s.value} suffix={s.suffix} /></p>
                  <p className="text-[8px] uppercase tracking-wider text-muted font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials carousel - compact */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-2"
              >
                {visible.map((t) => (
                  <div key={t.author} className="rounded-lg border border-gray-200/80 bg-white p-3 transition-shadow hover:shadow-md">
                    <div className="flex gap-0.5 mb-1">
                      {[1,2,3,4,5].map(j => <Star key={j} size={8} className="text-accent fill-accent" />)}
                    </div>
                    <p className="text-[10px] text-secondary/80 leading-relaxed line-clamp-2">&ldquo;{t.quote}&rdquo;</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <img src={t.image} alt={t.author} className="h-5 w-5 rounded-full object-cover" />
                      <div>
                        <p className="text-[9px] font-semibold text-secondary">{t.author}</p>
                        <p className="text-[8px] text-muted">{t.hotel}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="mt-2 flex justify-center gap-1">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`h-0.5 rounded-full transition-all duration-400 ${
                    i === page ? "w-4 bg-accent" : "w-1 bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
