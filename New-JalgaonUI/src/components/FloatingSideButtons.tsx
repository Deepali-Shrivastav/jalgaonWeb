"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Landmark, HeartHandshake, FileEdit, PhoneCall, Users, ChevronsLeft, ChevronsRight } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  isExternal?: boolean;
  cardStyle: string;
  iconColor: string;
}

const navItems: NavItem[] = [
  {
    name: "Tourism",
    href: "/tourism",
    icon: Landmark,
    cardStyle: "bg-[#0081C7]/12 hover:bg-[#0081C7]/22 border border-white/70 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-md",
    iconColor: "text-[#0081C7]",
  },
  {
    name: "NGO",
    href: "/ngo",
    icon: HeartHandshake,
    cardStyle: "bg-emerald-500/12 hover:bg-emerald-500/22 border border-white/70 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-md",
    iconColor: "text-emerald-600",
  },
  {
    name: "Blog",
    href: "/blog",
    icon: FileEdit,
    cardStyle: "bg-sky-500/12 hover:bg-sky-500/22 border border-white/70 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-md",
    iconColor: "text-sky-600",
  },
  {
    name: "Directory",
    href: "https://jalgaon.gov.in/en/telephone-directory/",
    isExternal: true,
    icon: PhoneCall,
    cardStyle: "bg-amber-500/12 hover:bg-amber-500/22 border border-white/70 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-md",
    iconColor: "text-amber-600",
  },
  {
    name: "Clubs",
    href: "/clubs",
    icon: Users,
    cardStyle: "bg-purple-500/12 hover:bg-purple-500/22 border border-white/70 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-md",
    iconColor: "text-purple-600",
  },
];

export default function FloatingSideButtons() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-collapse on small mobile screens to keep layout aligned and prevent clipping
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setIsCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="fixed top-1/2 right-1.5 sm:right-3 -translate-y-1/2 z-[9999] transition-all duration-300 scale-90 sm:scale-100 origin-right">
      {/* High-End Frosted Glassmorphism Outer Capsule */}
      <div className="relative flex flex-col gap-2.5 p-2 sm:p-2.5 bg-gradient-to-b from-white/70 via-white/45 to-white/25 backdrop-blur-3xl saturate-150 border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-[28px] sm:rounded-[32px]">
        
        {/* Specular Frosted Glass Minimize/Expand Button */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand Navigation" : "Collapse Navigation"}
          className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-xl border border-white shadow-[0_4px_12px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,1)] flex items-center justify-center text-[#0081C7] hover:scale-110 active:scale-95 transition-all duration-200 z-20 cursor-pointer"
        >
          {isCollapsed ? (
            <ChevronsRight className="w-4 h-4 stroke-[2.5]" />
          ) : (
            <ChevronsLeft className="w-4 h-4 stroke-[2.5]" />
          )}
        </button>

        {/* Vertical Rounded Glass Cards */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && !item.isExternal && pathname?.startsWith(item.href));

          const LinkComponent = item.isExternal ? "a" : Link;
          const linkProps = item.isExternal
            ? { href: item.href, target: "_blank", rel: "noopener noreferrer" }
            : { href: item.href };

          return (
            <LinkComponent
              key={item.name}
              {...linkProps}
              title={item.name}
              className={`group flex flex-col items-center justify-center rounded-[20px] sm:rounded-[22px] transition-all duration-300 cursor-pointer relative hover:scale-105 active:scale-95 ${
                isCollapsed ? "w-11 h-11" : "w-15 h-15 sm:w-16 sm:h-16"
              } ${item.cardStyle} ${
                isActive ? "ring-2 ring-[#0081C7] bg-white/90 shadow-md scale-[1.03]" : ""
              }`}
            >
              {/* Outline Icon */}
              <Icon className={`transition-transform duration-300 group-hover:scale-110 ${item.iconColor} ${
                isCollapsed ? "w-5 h-5" : "w-5 h-5 sm:w-6 sm:h-6"
              }`} />

              {/* Black Text Label */}
              {!isCollapsed && (
                <span className="text-[10px] sm:text-[11px] font-black tracking-tight text-slate-950 mt-1 leading-none">
                  {item.name}
                </span>
              )}
            </LinkComponent>
          );
        })}
      </div>
    </div>
  );
}
