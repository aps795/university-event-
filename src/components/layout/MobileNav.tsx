"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Home, Compass, BookmarkCheck, Bell, User, Calendar, Shield } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const getProfileLink = () => {
    if (!user) return "/login";
    if (user.role === "ADMIN") return "/admin";
    if (user.role === "ORGANIZER") return "/organizer";
    return "/my-events";
  };

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Events", href: "/events", icon: Compass },
    { label: "Calendar", href: "/calendar", icon: Calendar },
    {
      label: user?.role === "ORGANIZER" ? "Organizer" : "My Events",
      href: user?.role === "ORGANIZER" ? "/organizer" : "/my-events",
      icon: BookmarkCheck,
    },
    {
      label: user ? "Profile" : "Login",
      href: getProfileLink(),
      icon: user?.role === "ADMIN" ? Shield : User,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 shadow-lg px-2">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`inline-flex flex-col items-center justify-center px-1 transition ${
                isActive
                  ? "text-university-maroon font-bold"
                  : "text-gray-500 hover:text-university-maroon"
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
              <span className="text-[10px] truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
