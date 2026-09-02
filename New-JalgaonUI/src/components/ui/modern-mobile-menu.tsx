"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Home, Newspaper, CalendarDays, Briefcase, Flame } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

type IconComponentType = React.ElementType<{ className?: string }>;
export interface InteractiveMenuItem {
  label: string;
  icon: IconComponentType;
  href?: string;
}

export interface InteractiveMenuProps {
  items?: InteractiveMenuItem[];
  accentColor?: string;
}

const defaultItems: InteractiveMenuItem[] = [
    { label: 'news', icon: Newspaper, href: '/news' },
    { label: 'events', icon: CalendarDays, href: '/events' },
    { label: 'home', icon: Home, href: '/' },
    { label: 'jobs', icon: Briefcase, href: '/jobs' },
    { label: 'shorts', icon: Flame, href: '/jalgaon-glimpse' },
];

const defaultAccentColor = 'var(--component-active-color-default)';

const InteractiveMenu: React.FC<InteractiveMenuProps> = ({ items, accentColor }) => {
  const router = useRouter();
  const pathname = usePathname();

  const finalItems = useMemo(() => {
     const isValid = items && Array.isArray(items) && items.length >= 2 && items.length <= 5;
     if (!isValid) {
        return defaultItems;
     }
     return items;
  }, [items]);

  const initialIndex = useMemo(() => {
    if (!pathname) return 2; // Default to 'home' index
    const index = finalItems.findIndex(item => {
      if (item.href === '/') {
        return pathname === '/';
      }
      return item.href && pathname.startsWith(item.href);
    });
    if (index !== -1) return index;
    const homeIndex = finalItems.findIndex(item => item.label === 'home');
    return homeIndex !== -1 ? homeIndex : 0;
  }, [pathname, finalItems]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
      setActiveIndex(initialIndex);
  }, [initialIndex]);

  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const setLineWidth = () => {
      const activeItemElement = itemRefs.current[activeIndex];
      const activeTextElement = textRefs.current[activeIndex];

      if (activeItemElement && activeTextElement) {
        const textWidth = activeTextElement.offsetWidth;
        activeItemElement.style.setProperty('--lineWidth', `${textWidth}px`);
      }
    };

    setLineWidth();

    window.addEventListener('resize', setLineWidth);
    return () => {
      window.removeEventListener('resize', setLineWidth);
    };
  }, [activeIndex, finalItems]);

  const handleItemClick = (index: number, href?: string) => {
    setActiveIndex(index);
    if (href) {
      router.push(href);
    }
  };

  const navStyle = useMemo(() => {
      const activeColor = accentColor || defaultAccentColor;
      return { '--component-active-color': activeColor } as React.CSSProperties;
  }, [accentColor]); 

  return (
    <nav
      className="menu block md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white shadow-[0_-2px_10px_rgba(194,198,214,0.5)] pb-[env(safe-area-inset-bottom)]"
      role="navigation"
      style={navStyle}
    >
      <div className="flex justify-around items-center h-16 relative">
        {finalItems.map((item, index) => {
          const isActive = index === activeIndex;
          const isTextActive = isActive;


          const IconComponent = item.icon;

          return (
            <button
              key={item.label}
              className={`menu__item flex flex-col items-center justify-center w-full h-full relative ${isActive ? 'active text-[var(--component-active-color)]' : 'text-[var(--component-inactive-color)]'}`}
              onClick={() => handleItemClick(index, item.href)}
              ref={(el) => { itemRefs.current[index] = el; }}
              style={{ '--lineWidth': '0px' } as React.CSSProperties} 
            >
              <div className="menu__icon transition-transform duration-300">
                <IconComponent className={`icon size-6 ${isActive ? 'animate-[iconBounce_0.5s_ease]' : ''}`} />
              </div>
              <strong
                className={`menu__text text-xs capitalize mt-1 transition-all duration-300 ${isTextActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0 absolute'}`}
                ref={(el) => { textRefs.current[index] = el; }}
              >
                {item.label}
              </strong>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export {InteractiveMenu}
