"use client";

import { useRef, useState, useEffect } from "react";
type Wonder = {
  name: string;
  label: string;
  distance: string;
  image: string;
  imageAlt: string;
  mapLink: string;
};

const wonders: Wonder[] = [
  {
    name: "Ajanta Caves",
    label: "World Heritage Site",
    distance: "Approx. 60 km",
    image: "/Wonders-image/Ajanta-caves.png",
    imageAlt: "Ancient rock-cut cave courtyard",
    mapLink: "https://www.google.com/maps/search/?api=1&query=Ajanta+Caves",
  },
  {
    name: "Padalsare Dam",
    label: "Scenic escape",
    distance: "Approx. 55 km",
    image: "/Wonders-image/padalsare-dam.png",
    imageAlt: "Dam surrounded by green hills",
    mapLink: "https://www.google.com/maps/search/?api=1&query=Padalsare+Dam",
  },
  {
    name: "Mehrun Lake",
    label: "City sanctuary",
    distance: "In Jalgaon",
    image: "/Wonders-image/Mehrun-lake.png",
    imageAlt: "Quiet lake reflecting a line of trees",
    mapLink: "https://www.google.com/maps/search/?api=1&query=Mehrun+Lake",
  },
  {
    name: "Patnadevi Temple",
    label: "Spiritual heritage",
    distance: "Approx. 70 km",
    image: "/Wonders-image/patna-devi.png",
    imageAlt: "Historic temple glowing at sunset",
    mapLink: "https://www.google.com/maps/search/?api=1&query=Patnadevi+Temple",
  },
  {
    name: "Swinging Tower",
    label: "Jhulta Minar Farkande",
    distance: "Approx. 35 km",
    image: "/Wonders-image/swinging-tower.png",
    imageAlt: "Historical swinging towers",
    mapLink: "https://www.google.com/maps/search/?api=1&query=Swinging+Tower+Farkande",
  },
];

export default function LocalWonders() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [translateX, setTranslateX] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const row = rowRef.current;
    if (!container || !row) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 1024) {
        setTranslateX(0);
        return;
      }

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const relativeX = Math.min(Math.max(mouseX / rect.width, 0), 1); // 0 to 1

      const containerWidth = rect.width;
      const rowWidth = row.scrollWidth;

      if (rowWidth > containerWidth) {
        const maxTranslate = rowWidth - containerWidth;
        const targetTranslate = -relativeX * maxTranslate;
        setTranslateX(targetTranslate);
      } else {
        const maxParallax = 40; // max px offset
        const targetTranslate = (0.5 - relativeX) * 2 * maxParallax;
        setTranslateX(targetTranslate);
      }
    };

    const handleMouseLeave = () => {
      setTranslateX(0);
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <section id="local-wonders" className="bg-surface-container-low py-section overflow-hidden" aria-labelledby="wonders-heading">
      <div className="mx-auto max-w-container-max px-base sm:px-xxl">
        <div className="mb-xxl flex items-end justify-between gap-xl">
          <div>
            <p className="mb-xs text-xs font-extrabold uppercase tracking-[0.2em] text-primary">Around Jalgaon</p>
            <h2 id="wonders-heading" className="text-3xl font-extrabold text-ink-deep md:text-4xl">Explore Local Wonders</h2>
          </div>
          <span className="hidden text-sm font-bold text-secondary sm:block">Places worth the journey</span>
        </div>

        <div 
          ref={containerRef}
          className="overflow-x-auto lg:overflow-x-visible scrollbar-none snap-x snap-mandatory lg:snap-none"
        >
          <div 
            ref={rowRef}
            style={{
              transform: `translateX(${translateX}px)`,
              transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
            }}
            className="flex flex-row gap-base min-w-max pb-4 lg:pb-0"
          >
            {wonders.map((wonder) => (
              <a 
                href={wonder.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                key={wonder.name} 
                className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-ink-deep shadow-xl w-[75vw] sm:w-[320px] lg:w-[350px] shrink-0 snap-start block cursor-pointer"
              >
                <img src={wonder.image} alt={wonder.imageAlt} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-deep via-ink-deep/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-xl">
                  <span className="rounded-full bg-white/15 px-sm py-xxs text-[10px] font-extrabold uppercase tracking-widest text-white backdrop-blur">{wonder.distance}</span>
                  <h3 className="mt-md text-2xl font-extrabold text-white">{wonder.name}</h3>
                  <p className="mt-xxs text-sm text-white/75">{wonder.label}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
