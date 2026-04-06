"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowUpRight } from "lucide-react";

const categories = ["All", "Hotels", "Resorts", "Boutique", "Chains", "Apartments"] as const;

const projects = [
  // Hotels
  { name: "Sofitel Algiers Hamma Garden", location: "Algiers, Algeria", category: "Hotels", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop" },
  { name: "Four Seasons Tunis", location: "Gammarth, Tunisia", category: "Hotels", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600&auto=format&fit=crop" },
  { name: "Le Meurice Paris", location: "Paris, France", category: "Hotels", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=600&auto=format&fit=crop" },
  { name: "Ritz-Carlton New York", location: "New York, USA", category: "Hotels", image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=600&auto=format&fit=crop" },
  { name: "Fairmont Royal York", location: "Toronto, Canada", category: "Hotels", image: "https://images.unsplash.com/photo-1455587734955-081b22074882?q=80&w=600&auto=format&fit=crop" },
  { name: "Hilton Barcelona", location: "Barcelona, Spain", category: "Hotels", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=600&auto=format&fit=crop" },
  { name: "Sheraton Oran", location: "Oran, Algeria", category: "Hotels", image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=600&auto=format&fit=crop" },
  { name: "Marriott Marrakech", location: "Marrakech, Morocco", category: "Hotels", image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=600&auto=format&fit=crop" },
  // Resorts
  { name: "Royal Thalassa Monastir", location: "Monastir, Tunisia", category: "Resorts", image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=600&auto=format&fit=crop" },
  { name: "Mazagan Beach Resort", location: "El Jadida, Morocco", category: "Resorts", image: "https://images.unsplash.com/photo-1540541338287-41700c1d3baa?q=80&w=600&auto=format&fit=crop" },
  { name: "Atlantis The Palm", location: "Dubai, UAE", category: "Resorts", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600&auto=format&fit=crop" },
  { name: "Club Med Cancún", location: "Cancún, Mexico", category: "Resorts", image: "https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?q=80&w=600&auto=format&fit=crop" },
  { name: "Anantara Al Jabal", location: "Oman", category: "Resorts", image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=600&auto=format&fit=crop" },
  { name: "Constance Belle Mare", location: "Mauritius", category: "Resorts", image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=600&auto=format&fit=crop" },
  { name: "Rixos Sharm El Sheikh", location: "Sharm El Sheikh, Egypt", category: "Resorts", image: "https://images.unsplash.com/photo-1600011689032-8b628b8a8747?q=80&w=600&auto=format&fit=crop" },
  { name: "Iberostar Bouganville", location: "Tenerife, Spain", category: "Resorts", image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=600&auto=format&fit=crop" },
  // Boutique
  { name: "Riad Fès", location: "Fès, Morocco", category: "Boutique", image: "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?q=80&w=600&auto=format&fit=crop" },
  { name: "Dar El Jeld", location: "Tunis, Tunisia", category: "Boutique", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop" },
  { name: "Hotel Negresco", location: "Nice, France", category: "Boutique", image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600&auto=format&fit=crop" },
  { name: "The Hoxton", location: "Amsterdam, Netherlands", category: "Boutique", image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600&auto=format&fit=crop" },
  { name: "Ace Hotel", location: "Brooklyn, USA", category: "Boutique", image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=600&auto=format&fit=crop" },
  { name: "Mama Shelter", location: "Marseille, France", category: "Boutique", image: "https://images.unsplash.com/photo-1521783988139-89397d761dce?q=80&w=600&auto=format&fit=crop" },
  { name: "25hours Hotel", location: "Berlin, Germany", category: "Boutique", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=600&auto=format&fit=crop" },
  { name: "Kasbah Tamadot", location: "Atlas Mountains, Morocco", category: "Boutique", image: "https://images.unsplash.com/photo-1561501900-3701fa6a0864?q=80&w=600&auto=format&fit=crop" },
  // Chains
  { name: "Meliá Hotels International", location: "Palma de Mallorca, Spain", category: "Chains", image: "https://images.unsplash.com/photo-1529290130-4ca3753253ae?q=80&w=600&auto=format&fit=crop" },
  { name: "AccorHotels Group", location: "Paris, France", category: "Chains", image: "https://images.unsplash.com/photo-1606402179428-a57976d71fa4?q=80&w=600&auto=format&fit=crop" },
  { name: "Radisson Blu Collection", location: "Brussels, Belgium", category: "Chains", image: "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?q=80&w=600&auto=format&fit=crop" },
  { name: "IHG Hotels & Resorts", location: "London, UK", category: "Chains", image: "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?q=80&w=600&auto=format&fit=crop" },
  { name: "Hyatt Regency Portfolio", location: "Chicago, USA", category: "Chains", image: "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?q=80&w=600&auto=format&fit=crop" },
  { name: "NH Hotel Group", location: "Madrid, Spain", category: "Chains", image: "https://images.unsplash.com/photo-1517840901100-8179e982acb7?q=80&w=600&auto=format&fit=crop" },
  // Apartments
  { name: "Citadines Apart'hotel", location: "Lyon, France", category: "Apartments", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=600&auto=format&fit=crop" },
  { name: "Adagio Aparthotel", location: "Abu Dhabi, UAE", category: "Apartments", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop" },
  { name: "Sonder Stays", location: "Montreal, Canada", category: "Apartments", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=600&auto=format&fit=crop" },
  { name: "Staycity Aparthotels", location: "Dublin, Ireland", category: "Apartments", image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=600&auto=format&fit=crop" },
  { name: "Zoku Amsterdam", location: "Amsterdam, Netherlands", category: "Apartments", image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=600&auto=format&fit=crop" },
  { name: "Lyric Aparthotel", location: "Casablanca, Morocco", category: "Apartments", image: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=600&auto=format&fit=crop" },
];

export function ProjectsSection() {
  const [filter, setFilter] = useState<string>("All");
  const filtered = filter === "All" ? projects : projects.filter(p => p.category === filter);

  return (
    <section className="py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-5">
          <span className="text-[10px] font-semibold text-accent uppercase tracking-[0.2em]">Portfolio</span>
          <h2 className="mt-2 font-display text-2xl text-secondary sm:text-3xl">
            <span className="text-accent">{projects.length}</span> projects <span className="italic">worldwide</span>
          </h2>
          <p className="mt-1 text-xs text-muted max-w-xl mx-auto">Hotels, resorts, and apartment brands trust OxiCheck to streamline their guest arrivals.</p>
        </div>

        {/* Category filter */}
        <div className="flex justify-center gap-1.5 mb-6 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 rounded-full text-[10px] font-medium transition-all duration-300 ${
                filter === cat
                  ? "bg-accent text-navy shadow-sm shadow-accent/20"
                  : "bg-gray-100 text-muted hover:bg-gray-200"
              }`}
            >
              {cat}
              {cat !== "All" && (
                <span className="ml-1 text-[8px] opacity-60">
                  {projects.filter(p => p.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Project grid */}
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <motion.div
                key={project.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer"
              >
                <img
                  src={project.image}
                  alt={project.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                {/* Default overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-navy/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <ArrowUpRight size={16} className="text-accent" />
                </div>
                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-[9px] font-semibold text-white leading-tight truncate">{project.name}</p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <MapPin size={7} className="text-accent shrink-0" />
                    <p className="text-[7px] text-white/60 truncate">{project.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Bottom stat */}
        <div className="mt-5 flex justify-center gap-6">
          {[
            { label: "Countries", value: "25+" },
            { label: "Properties", value: "500+" },
            { label: "Arrivals processed", value: "2M+" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-sm font-bold text-navy">{s.value}</p>
              <p className="text-[8px] text-muted uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
