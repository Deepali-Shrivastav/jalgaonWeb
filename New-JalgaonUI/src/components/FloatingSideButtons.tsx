"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FloatingSideButtons() {
  const pathname = usePathname();

  // Don't render on pages where it might be intrusive, or keep it everywhere as requested?
  // "Always visible while scrolling." -> Let's keep it everywhere except admin.
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="fixed top-1/2 right-0 -translate-y-1/2 z-[9999] flex flex-col gap-1 sm:gap-2">
      <Link
        href="/tourism"
        aria-label="Tourism"
        className="group flex items-center justify-center w-8 h-28 sm:w-9 sm:h-32 md:w-10 md:h-36 bg-primary text-on-primary rounded-l-lg sm:rounded-l-xl shadow-md hover:scale-[1.05] hover:brightness-110 transition-all duration-300 origin-right cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <span
          className="font-semibold tracking-wider text-[10px] sm:text-xs md:text-sm whitespace-nowrap"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          Tourism
        </span>
      </Link>

      <Link
        href="/ngo"
        aria-label="NGO"
        className="group flex items-center justify-center w-8 h-28 sm:w-9 sm:h-32 md:w-10 md:h-36 bg-green-600 text-white rounded-l-lg sm:rounded-l-xl shadow-md hover:scale-[1.05] hover:brightness-110 transition-all duration-300 origin-right cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
      >
        <span
          className="font-semibold tracking-wider text-[10px] sm:text-xs md:text-sm whitespace-nowrap"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          NGO
        </span>
      </Link>

      <Link
        href="https://jalgaon.gov.in/en/telephone-directory/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Phone Directory"
        className="group flex items-center justify-center w-8 h-28 sm:w-9 sm:h-32 md:w-10 md:h-36 bg-[#d34a24] text-white rounded-l-lg sm:rounded-l-xl shadow-md hover:scale-[1.05] hover:brightness-110 transition-all duration-300 origin-right cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#d34a24] focus:ring-offset-2"
      >
        <span
          className="font-semibold tracking-wider text-[10px] sm:text-xs md:text-sm whitespace-nowrap"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          Phone Directory
        </span>
      </Link>
    </div>
  );
}
