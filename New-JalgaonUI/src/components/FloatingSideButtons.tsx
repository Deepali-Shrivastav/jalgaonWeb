"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Landmark,
  HeartHandshake,
  FileEdit,
  PhoneCall,
  Users,
  ChevronsLeft,
  ChevronsRight,
  GripVertical,
} from "lucide-react";

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
    href: "/directory",
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
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [topPos, setTopPos] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Drag Tracking Refs
  const dragStartPos = useRef<{ startY: number; initialTop: number }>({ startY: 0, initialTop: 0 });
  const hasDraggedRef = useRef<boolean>(false);

  // Auto-hide FAB stick when FloatingVideoAd modal is open (prevents visual overlaps)
  useEffect(() => {
    let timerId: NodeJS.Timeout;

    const handleAdStateChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ isAdOpen: boolean }>;
      const openState = customEvent.detail?.isAdOpen ?? false;

      clearTimeout(timerId);
      timerId = setTimeout(() => {
        setIsAdOpen(openState);
      }, 150);
    };

    window.addEventListener("floating-ad-state-change", handleAdStateChange);

    return () => {
      clearTimeout(timerId);
      window.removeEventListener("floating-ad-state-change", handleAdStateChange);
    };
  }, []);

  // Auto-collapse on small mobile screens & initialize drag position
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setIsCollapsed(true);
      }
    };
    handleResize();

    const savedTop = localStorage.getItem("floating_buttons_top_pos");
    if (savedTop !== null) {
      const parsed = parseFloat(savedTop);
      if (!isNaN(parsed) && parsed > 0 && parsed < window.innerHeight - 100) {
        setTopPos(parsed);
      } else {
        setTopPos(window.innerHeight / 2 - 160);
      }
    } else {
      setTopPos(window.innerHeight / 2 - 160);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-collapse ONLY on pointer tap outside of the navigation container
  useEffect(() => {
    if (isCollapsed) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsCollapsed(true);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCollapsed(true);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCollapsed]);

  // Pointer Drag Handlers (Supports Touch, Mouse, & Stylus)
  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    // Allow normal click navigation if user touches an interactive link/button
    if (target.closest("button, a") && !target.closest(".drag-handle")) {
      return;
    }

    setIsDragging(true);
    hasDraggedRef.current = false;
    const currentTop = topPos ?? (window.innerHeight / 2 - 160);
    dragStartPos.current = {
      startY: e.clientY,
      initialTop: currentTop,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const deltaY = e.clientY - dragStartPos.current.startY;
    if (Math.abs(deltaY) > 5) {
      hasDraggedRef.current = true;
    }

    const height = navRef.current?.offsetHeight || 320;
    const minTop = 16;
    const maxTop = Math.max(minTop, window.innerHeight - height - 16);
    const newTop = Math.min(Math.max(dragStartPos.current.initialTop + deltaY, minTop), maxTop);

    setTopPos(newTop);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (topPos !== null) {
      localStorage.setItem("floating_buttons_top_pos", topPos.toString());
    }
  };

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const styleTop = topPos !== null ? `${topPos}px` : "50%";
  const styleTransform =
    topPos !== null
      ? isAdOpen
        ? "translateX(160%)"
        : "none"
      : isAdOpen
      ? "translate(160%, -50%)"
      : "translateY(-50%)";

  const styleTransition = isDragging
    ? "none"
    : "top 250ms cubic-bezier(0.16, 1, 0.3, 1), transform 550ms cubic-bezier(0.16, 1, 0.3, 1), opacity 550ms cubic-bezier(0.16, 1, 0.3, 1)";

  return (
    <div
      ref={navRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        top: styleTop,
        transform: styleTransform,
        opacity: isAdOpen ? 0 : 1,
        pointerEvents: isAdOpen ? "none" : "auto",
        transition: styleTransition,
      }}
      className={`fixed right-1 sm:right-3 z-[9999] scale-[0.88] sm:scale-100 origin-right select-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      {/* High-End Frosted Glassmorphism Outer Capsule */}
      <div className="relative flex flex-col gap-1.5 sm:gap-2.5 p-1.5 sm:p-2.5 bg-gradient-to-b from-white/70 via-white/45 to-white/25 backdrop-blur-3xl saturate-150 border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-[22px] sm:rounded-[32px]">
        
        {/* Mobile-Friendly Drag Handle Indicator */}
        <div
          title="Drag to reposition"
          className="drag-handle w-full flex flex-col items-center justify-center py-2 sm:py-0.5 text-slate-500 hover:text-slate-800 transition-colors cursor-grab active:cursor-grabbing touch-none select-none"
        >
          <div className="w-7 h-1 bg-slate-400/80 rounded-full mb-0.5 sm:hidden" />
          <GripVertical className="w-3.5 h-3.5 rotate-90 opacity-70" />
        </div>

        {/* Specular Frosted Glass Minimize/Expand Button */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand Navigation" : "Collapse Navigation"}
          aria-expanded={!isCollapsed}
          className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/80 backdrop-blur-xl border border-white shadow-[0_4px_12px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,1)] flex items-center justify-center text-[#0081C7] hover:scale-110 active:scale-95 transition-all duration-200 z-20 cursor-pointer"
        >
          {isCollapsed ? (
            <ChevronsRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          ) : (
            <ChevronsLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
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
              onClick={(e) => {
                // Only prevent navigation if user actively dragged the capsule
                if (hasDraggedRef.current) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              className={`group flex flex-col items-center justify-center rounded-[16px] sm:rounded-[22px] transition-all duration-300 cursor-pointer relative hover:scale-105 active:scale-95 ${
                isCollapsed ? "w-9 h-9 sm:w-11 sm:h-11" : "w-13 h-13 sm:w-16 sm:h-16"
              } ${item.cardStyle} ${
                isActive ? "ring-2 ring-[#0081C7] bg-white/90 shadow-md scale-[1.03]" : ""
              }`}
            >
              {/* Outline Icon */}
              <Icon className={`transition-transform duration-300 group-hover:scale-110 ${item.iconColor} ${
                isCollapsed ? "w-4 h-4 sm:w-5 sm:h-5" : "w-4.5 h-4.5 sm:w-6 sm:h-6"
              }`} />

              {/* Black Text Label */}
              {!isCollapsed && (
                <span className="text-[9px] sm:text-[11px] font-black tracking-tight text-slate-950 mt-0.5 sm:mt-1 leading-none">
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
