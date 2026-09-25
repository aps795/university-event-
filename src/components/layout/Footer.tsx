import React from "react";
import Link from "next/link";
import { ExternalLink, Mail, MapPin, Phone, Award, BookOpen, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-university-navy text-white pt-16 pb-20 md:pb-12 border-t-4 border-university-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: University Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-university-gold font-serif font-black text-2xl border border-university-gold">
                <span>ध</span>
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-white tracking-wide">
                  DHSGSU EventHub
                </h3>
                <p className="text-xs text-amber-200/80">Discover. Register. Participate.</p>
              </div>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Dr. Harisingh Gour Vishwavidyalaya, Sagar (formerly University of Saugor), established on 18th July 1946 by the visionary benefactor Sir Dr. Hari Singh Gour. A premier Central University accredited with NAAC &apos;A&apos; Grade.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-university-gold border border-university-gold/40">
                <Award className="w-3.5 h-3.5" />
                NAAC Accredited &apos;A&apos; Grade Central University
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-university-gold uppercase tracking-wider mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li>
                <Link href="/events" className="hover:text-university-gold transition">
                  Browse All Events & Workshops
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="hover:text-university-gold transition">
                  Academic & Event Calendar
                </Link>
              </li>
              <li>
                <Link href="/events?category=Cultural" className="hover:text-university-gold transition">
                  Gour Gourav Utsav & Cultural Fest
                </Link>
              </li>
              <li>
                <Link href="/events?category=Technical" className="hover:text-university-gold transition">
                  Hackathons & Tech Symposia
                </Link>
              </li>
              <li>
                <Link href="/verify-certificate/DHSGSU-CERT-2024-0342" className="hover:text-university-gold transition flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Public Certificate Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Official Portals */}
          <div>
            <h4 className="text-sm font-bold text-university-gold uppercase tracking-wider mb-4 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Official Portals
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li>
                <a
                  href="https://www.dhsgsu.edu.in/index.php/en/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-university-gold flex items-center gap-1.5 transition"
                >
                  <span>Official University Website</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://dhsgsuadm.samarth.edu.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-university-gold flex items-center gap-1.5 transition"
                >
                  <span>Samarth e-Gov Admission Portal</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.dhsgsu.edu.in/index.php/en/academics/schools-departments"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-university-gold flex items-center gap-1.5 transition"
                >
                  <span>Schools & Academic Departments</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.dhsgsu.edu.in/index.php/en/notifications/notices"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-university-gold flex items-center gap-1.5 transition"
                >
                  <span>Official Circulars & Notices</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Campus Contact */}
          <div>
            <h4 className="text-sm font-bold text-university-gold uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              University Campus
            </h4>
            <div className="space-y-3 text-xs text-gray-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-university-gold shrink-0 mt-0.5" />
                <span>
                  Dr. Harisingh Gour Vishwavidyalaya,
                  <br />
                  Patharia Hills, Sagar - 470003,
                  <br />
                  Madhya Pradesh, Bharat (India)
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-university-gold shrink-0" />
                <span>+91 7582 264510 / 264444</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-university-gold shrink-0" />
                <span>eventhub@dhsgsu.edu.in</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>
            © {new Date().getFullYear()} Dr. Harisingh Gour Vishwavidyalaya (DHSGSU), Sagar. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-university-gold font-serif">असतो मा सद्गमय</span>
            <span>•</span>
            <span>Lead Me From The Unreal To The Real</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
