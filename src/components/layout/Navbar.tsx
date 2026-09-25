"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Bell,
  Calendar,
  Compass,
  GraduationCap,
  Layers,
  LogOut,
  Menu,
  Shield,
  User,
  X,
  CheckCircle,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { NotificationItem } from "@/lib/types";

export function Navbar() {
  const { user, logout, switchDemoRole } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: NotificationItem) => !n.readStatus).length);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, readStatus: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "Calendar", href: "/calendar" },
    ...(user?.role === "STUDENT" ? [{ name: "My Events", href: "/my-events" }] : []),
    ...(user?.role === "ORGANIZER" ? [{ name: "Organizer Desk", href: "/organizer" }] : []),
    ...(user?.role === "ADMIN" ? [{ name: "Admin Portal", href: "/admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-sm">
      {/* Top University Branding Bar */}
      <div className="bg-university-maroon text-white text-xs py-1.5 px-4 sm:px-6 font-medium flex flex-wrap items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-serif tracking-wide font-bold">
            डॉ. हरीसिंह गौर विश्वविद्यालय, सागर (म.प्र.)
          </span>
          <span className="hidden md:inline text-university-gold">|</span>
          <span className="hidden md:inline font-sans text-amber-100">
            Dr. Harisingh Gour Vishwavidyalaya, Sagar (M.P.) — Central University (NAAC &apos;A&apos; Grade)
          </span>
        </div>
        <div className="flex items-center gap-3 text-amber-200">
          <a
            href="https://www.dhsgsu.edu.in/index.php/en/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white flex items-center gap-1 transition"
          >
            <span>Official Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Branding */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-university-maroon flex items-center justify-center text-university-gold font-serif font-black text-2xl shadow-md border-2 border-university-gold group-hover:scale-105 transition transform">
              <span>ध</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-serif font-black text-university-maroon tracking-tight">
                  DHSGSU
                </span>
                <span className="text-xl sm:text-2xl font-sans font-bold text-gray-900">
                  EventHub
                </span>
              </div>
              <p className="text-xs font-medium text-gray-500 tracking-wider uppercase">
                Discover. Register. Participate.
              </p>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                    active
                      ? "bg-university-maroon text-white shadow-sm"
                      : "text-gray-700 hover:text-university-maroon hover:bg-gray-100"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* User Controls & Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Switcher Pill */}
            <div className="hidden lg:flex items-center bg-gray-100 rounded-full p-1 text-xs border border-gray-200">
              <span className="px-2 py-0.5 text-gray-500 font-medium">Demo:</span>
              <button
                onClick={() => switchDemoRole("student")}
                className={`px-2.5 py-1 rounded-full font-medium transition ${
                  user?.role === "STUDENT"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-700 hover:text-blue-700 hover:bg-white"
                }`}
                title="Switch to Student Account"
              >
                Student
              </button>
              <button
                onClick={() => switchDemoRole("organizer")}
                className={`px-2.5 py-1 rounded-full font-medium transition ${
                  user?.role === "ORGANIZER"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-gray-700 hover:text-purple-700 hover:bg-white"
                }`}
                title="Switch to Faculty Organizer Account"
              >
                Organizer
              </button>
              <button
                onClick={() => switchDemoRole("admin")}
                className={`px-2.5 py-1 rounded-full font-medium transition ${
                  user?.role === "ADMIN"
                    ? "bg-rose-700 text-white shadow-sm"
                    : "text-gray-700 hover:text-rose-700 hover:bg-white"
                }`}
                title="Switch to DSW / Admin Account"
              >
                Admin
              </button>
            </div>

            {/* Notification Bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 text-gray-600 hover:text-university-maroon hover:bg-gray-100 rounded-full transition relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-university-maroon" />
                        <h4 className="text-sm font-bold text-gray-900">Notifications</h4>
                        <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-semibold">
                          {unreadCount} new
                        </span>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-blue-600 hover:underline font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-500">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n.id}
                            className={`p-3.5 hover:bg-gray-50 transition text-left ${
                              !n.readStatus ? "bg-amber-50/50" : ""
                            }`}
                          >
                            <p className="text-xs font-bold text-gray-900 mb-0.5">{n.title}</p>
                            <p className="text-xs text-gray-600 line-clamp-2">{n.message}</p>
                            <span className="text-[10px] text-gray-400 mt-1 inline-block">
                              {new Date(n.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile or Login */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-sm font-bold text-gray-900 leading-tight">
                      {user.name.split(" ")[0]}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        user.role === "ADMIN"
                          ? "bg-rose-100 text-rose-800"
                          : user.role === "ORGANIZER"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500 block truncate max-w-[140px]">
                    {user.enrollmentNumber || user.department || user.email}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="p-2 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-university-maroon hover:bg-university-lightgold rounded-lg transition border border-university-maroon/20"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-university-maroon hover:bg-university-darkmaroon rounded-lg shadow-sm transition"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-gray-600 hover:text-university-maroon hover:bg-gray-100 rounded-lg transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-base font-semibold ${
                  pathname === link.href
                    ? "bg-university-maroon text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Role Switcher */}
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Quick Role Switcher (Test / Demo)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  switchDemoRole("student");
                  setMobileMenuOpen(false);
                }}
                className="py-1.5 px-2 bg-blue-50 text-blue-700 font-semibold rounded-md text-xs border border-blue-200"
              >
                Student
              </button>
              <button
                onClick={() => {
                  switchDemoRole("organizer");
                  setMobileMenuOpen(false);
                }}
                className="py-1.5 px-2 bg-purple-50 text-purple-700 font-semibold rounded-md text-xs border border-purple-200"
              >
                Organizer
              </button>
              <button
                onClick={() => {
                  switchDemoRole("admin");
                  setMobileMenuOpen(false);
                }}
                className="py-1.5 px-2 bg-rose-50 text-rose-700 font-semibold rounded-md text-xs border border-rose-200"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
