"use client";

import React, { useContext, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import Link from "next/link";

interface AdminTopbarProps {
  toggleSidebar: () => void;
  title?: string;
}

const AdminTopbar: React.FC<AdminTopbarProps> = ({ toggleSidebar, title = "Dashboard" }) => {
  const { user, logout } = useContext(AuthContext);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const getInitials = () => {
    if (user?.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    }
    if (user?.phone_number) {
      return user.phone_number.charAt(0);
    }
    return "U";
  };

  const formatRole = (role?: string) => {
    return role ? role.replace("_", " ") : "";
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      await fetch(`${baseUrl}/api/v1/auth/logout/`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      logout();
      router.push("/");
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="text-xl font-bold text-ink-deep hidden sm:block">{title}</h1>
      </div>

      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        <Link
          href="/"
          className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">open_in_new</span>
          Back to Website
        </Link>

        <div
          className="flex items-center gap-3 cursor-pointer p-1 pr-2 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
          onClick={() => setDropdownOpen(!isDropdownOpen)}
        >
          <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
            {getInitials()}
          </div>
          <div className="hidden sm:block text-sm">
            <p className="font-semibold text-slate-900 leading-tight">
              {user?.first_name || user?.phone_number || "Admin User"}
            </p>
            <p className="text-slate-500 text-xs capitalize">{formatRole(user?.role)}</p>
          </div>
          <span className="material-symbols-outlined text-slate-400 hidden sm:block">
            expand_more
          </span>
        </div>

        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
            <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
              <p className="font-semibold text-slate-900 truncate">
                {user?.phone_number || "User"}
              </p>
              <p className="text-slate-500 text-xs capitalize">{formatRole(user?.role)}</p>
            </div>
            
            <Link
              href="/"
              className="sm:hidden flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">open_in_new</span>
              Back to Website
            </Link>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminTopbar;
