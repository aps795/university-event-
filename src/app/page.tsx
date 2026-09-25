"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  BookOpen,
  Code2,
  Sparkles,
  Trophy,
  Users2,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Building2,
  ExternalLink,
  MapPin,
  ChevronRight,
  Bell,
  Clock,
} from "lucide-react";
import { EventItem, DepartmentItem } from "@/lib/types";
import { EventCard } from "@/components/events/EventCard";
import { EventRegistrationModal } from "@/components/events/EventRegistrationModal";

export default function HomePage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventForModal, setSelectedEventForModal] = useState<EventItem | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [evRes, deptRes] = await Promise.all([
          fetch("/api/events?limit=8"),
          fetch("/api/departments"),
        ]);
        const evData = await evRes.json();
        const deptData = await deptRes.json();
        setEvents(evData.events || []);
        setDepartments(deptData.departments || []);
      } catch (e) {
        console.error("Failed to load home data:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = [
    {
      title: "Academic",
      icon: BookOpen,
      color: "from-blue-600 to-indigo-700",
      description: "Seminars, Conferences, Guest Lectures, Webinars & Academic Workshops",
      subItems: ["National Seminars", "International Conferences", "Faculty Keynotes", "Workshops"],
      href: "/events?category=Academic",
    },
    {
      title: "Technical",
      icon: Code2,
      color: "from-purple-600 to-violet-800",
      description: "Hackathons, Ideathons, Coding Competitions & Tech Workshops",
      subItems: ["HackDHSGSU 2026", "AI & ML Labs", "Coding Sprints", "Project Exhibitions"],
      href: "/events?category=Technical",
    },
    {
      title: "Cultural",
      icon: Sparkles,
      color: "from-amber-500 to-orange-700",
      description: "Music, Dance, Theatre, Literary Events & Fine Arts (Gour Gourav Utsav)",
      subItems: ["Gour Gourav Utsav", "Classical & Folk Dance", "Youth Theatre", "Fine Arts"],
      href: "/events?category=Cultural",
    },
    {
      title: "Sports",
      icon: Trophy,
      color: "from-emerald-600 to-teal-800",
      description: "Cricket, Football, Athletics, Badminton & University Tournaments",
      subItems: ["Inter-Departmental Cricket", "Track & Field", "Badminton Meet", "Fitness Rallies"],
      href: "/events?category=Sports",
    },
    {
      title: "Student Activities",
      icon: Users2,
      color: "from-rose-600 to-pink-700",
      description: "Competitions, Awareness Programs, Club Activities & Student Development",
      subItems: ["Founder's Day Oration", "Blood Donation Camps", "NCC/NSS Drives", "Debate Forum"],
      href: "/events?category=Student+Activities",
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-university-navy text-white pt-16 pb-24 sm:pt-24 sm:pb-32 border-b-4 border-university-gold">
        {/* Background Graphic Accents */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-university-maroon rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-university-gold rounded-full blur-3xl opacity-20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* University Crest / Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-university-gold/40 text-xs sm:text-sm font-semibold text-amber-200 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Central University (NAAC &apos;A&apos; Grade) • Sagar, Madhya Pradesh</span>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-tight">
              Discover What&apos;s Happening at{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400">
                DHSGSU
              </span>
            </h1>

            <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Explore seminars, workshops, cultural programs, competitions and student activities happening across Dr. Harisingh Gour Vishwavidyalaya.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/events"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-university-maroon hover:bg-university-darkmaroon text-white font-bold text-base shadow-xl hover:shadow-2xl transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 border border-university-gold/30"
            >
              <span>Explore Events</span>
              <ArrowRight className="w-5 h-5 text-university-gold" />
            </Link>

            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-base backdrop-blur-md transition border border-white/20 flex items-center justify-center gap-2"
            >
              <span>Register Now</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
              <div className="text-2xl sm:text-3xl font-serif font-black text-university-gold">11</div>
              <div className="text-xs text-gray-300 mt-0.5">Academic Schools</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
              <div className="text-2xl sm:text-3xl font-serif font-black text-university-gold">1946</div>
              <div className="text-xs text-gray-300 mt-0.5">Founding Year</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
              <div className="text-2xl sm:text-3xl font-serif font-black text-university-gold">QR Code</div>
              <div className="text-xs text-gray-300 mt-0.5">Instant Check-in</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
              <div className="text-2xl sm:text-3xl font-serif font-black text-university-gold">E-Cert</div>
              <div className="text-xs text-gray-300 mt-0.5">Instant Digital Registry</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Official Notice Board Ticker */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="p-2 rounded-xl bg-university-maroon text-white">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-bold text-university-maroon uppercase tracking-wider block">
                Official Notice
              </span>
              <span className="text-xs text-gray-700 font-medium">
                Annual Youth Festival &amp; Gour Jayanti Celebrations Scheduled
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
            <span className="hidden sm:inline">Venue: Swarna Jayanti Sabhagar (Golden Jubilee Auditorium)</span>
            <a
              href="https://www.dhsgsu.edu.in/index.php/en/notifications/notices"
              target="_blank"
              rel="noopener noreferrer"
              className="text-university-maroon hover:underline flex items-center gap-1 font-bold shrink-0"
            >
              <span>View dhsgsu.edu.in Notices</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

      {/* 3. Event Categories Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-university-maroon uppercase tracking-widest">
            Campus Spectrum
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-gray-900">
            Explore by Category
          </h2>
          <p className="text-sm text-gray-600">
            From technical hackathons and academic seminars to the vibrant AIU Gour Gourav Utsav youth festivals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.title}
                href={cat.href}
                className="group relative bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-university-maroon transition">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-university-maroon">
                  <span>Browse Category</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Upcoming & Featured Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-university-maroon uppercase tracking-widest">
              Campus Highlights
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-gray-900 mt-1">
              Upcoming &amp; Featured Events
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Register early to secure your seat and receive your unique QR attendance badge.
            </p>
          </div>

          <Link
            href="/events"
            className="px-5 py-2.5 rounded-xl border border-gray-300 hover:border-university-maroon text-xs font-bold text-gray-700 hover:text-university-maroon transition flex items-center gap-1.5 shrink-0"
          >
            <span>View All Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 bg-gray-200 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onRegisterClick={(ev) => setSelectedEventForModal(ev)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 5. University Information Section (Official DHSGSU Reference) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-university-maroon to-university-navy text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden border-2 border-university-gold/40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-university-gold text-xs font-bold uppercase tracking-widest">
                <Building2 className="w-4 h-4" />
                <span>About Dr. Harisingh Gour Vishwavidyalaya</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-serif font-black tracking-tight leading-snug">
                A Beacon of Higher Learning in Sagar, Madhya Pradesh
              </h2>

              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                Founded on 18th July 1946 by Sir Dr. Hari Singh Gour—a distinguished jurist, author, and educationist who donated his entire lifetime earnings to establish this sanctuary of learning. It is the oldest and biggest university in Madhya Pradesh, elevated to a Central University in 2009.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                  <span className="font-bold text-university-gold block">Campus Location</span>
                  <span className="text-gray-300">Patharia Hills, Sagar (M.P.)</span>
                </div>
                <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                  <span className="font-bold text-university-gold block">NAAC Status</span>
                  <span className="text-gray-300">Accredited &apos;A&apos; Grade</span>
                </div>
                <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                  <span className="font-bold text-university-gold block">Schools of Study</span>
                  <span className="text-gray-300">11 Academic Schools</span>
                </div>
                <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                  <span className="font-bold text-university-gold block">Official Portal</span>
                  <span className="text-gray-300">dhsgsu.edu.in</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="https://www.dhsgsu.edu.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-university-gold text-university-navy font-bold text-xs hover:bg-yellow-400 transition"
                >
                  <span>Visit Official DHSGSU Website</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* University Crest / Heritage Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-university-gold text-university-maroon font-serif text-4xl font-black mx-auto flex items-center justify-center shadow-lg border-2 border-white">
                <span>ध</span>
              </div>
              <h3 className="text-xl font-serif font-black text-amber-100">
                “असतो मा सद्गमय”
              </h3>
              <p className="text-xs text-gray-300 max-w-sm mx-auto italic">
                “Lead me from the unreal to the real, from darkness to light, from mortality to immortality.”
              </p>
              <div className="pt-2 text-left bg-black/20 p-4 rounded-xl text-xs space-y-2">
                <p className="font-bold text-university-gold uppercase text-[10px] tracking-wider">
                  Publicly Verified Facts
                </p>
                <p className="text-gray-300 text-[11px]">
                  • Host of 38th AIU Inter-University Youth Fest &apos;Gour Gourav Utsav&apos;.
                </p>
                <p className="text-gray-300 text-[11px]">
                  • Founder&apos;s Day &apos;Gour Jayanti&apos; celebrated annually on 26th November.
                </p>
                <p className="text-gray-300 text-[11px]">
                  • Centralized event registration, automated QR attendance, and verified e-certificates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      {selectedEventForModal && (
        <EventRegistrationModal
          event={selectedEventForModal}
          isOpen={!!selectedEventForModal}
          onClose={() => setSelectedEventForModal(null)}
          onSuccess={() => {
            // refresh data if needed
          }}
        />
      )}
    </div>
  );
}
