"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import { X, CheckCircle2, Calendar, MapPin, AlertCircle, Download, Check, ArrowRight } from "lucide-react";
import { EventItem, RegistrationItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface EventRegistrationModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EventRegistrationModal({
  event,
  isOpen,
  onClose,
  onSuccess,
}: EventRegistrationModalProps) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    enrollmentNumber: user?.enrollmentNumber || "",
    course: user?.course || "",
    department: user?.department || event?.department?.name || "",
    semester: user?.semester || "6th Semester",
    gender: "Male",
    phone: user?.phone || "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedRegistration, setConfirmedRegistration] = useState<RegistrationItem | null>(null);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Please log in with your DHSGSU student account first.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          notes: formData.notes,
          enrollmentNumber: formData.enrollmentNumber,
          course: formData.course,
          department: formData.department,
          semester: formData.semester,
          phone: formData.phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to complete registration");
        setSubmitting(false);
        return;
      }

      setConfirmedRegistration(data.registration);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "An unexpected network error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadICS = () => {
    const title = event.title;
    const desc = event.description;
    const location = event.venue;
    const startDate = event.eventDate.replace(/-/g, "") + "T100000";
    const endDate = event.eventDate.replace(/-/g, "") + "T130000";

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//DHSGSU EventHub//University Events//EN
BEGIN:VEVENT
SUMMARY:${title}
DESCRIPTION:${desc.slice(0, 100)}
LOCATION:${location}
DTSTART:${startDate}
DTEND:${endDate}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${event.title.slice(0, 20)}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-gray-100 my-8">
        {/* Header */}
        <div className="bg-university-maroon text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="pr-8">
            <span className="text-[11px] font-bold uppercase tracking-wider text-university-gold">
              Dr. Harisingh Gour Vishwavidyalaya
            </span>
            <h2 className="text-xl font-serif font-black mt-1 line-clamp-1">
              {confirmedRegistration ? "Registration Confirmed" : "Event Registration"}
            </h2>
            <p className="text-xs text-amber-100/90 mt-1 line-clamp-1">{event.title}</p>
          </div>
        </div>

        {/* Confirmation State */}
        {confirmedRegistration ? (
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-serif font-black text-gray-900">
                Registration Successful!
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Your seat has been reserved. Please preserve this QR Code for entry check-in.
              </p>
            </div>

            {/* Registration Badge Box */}
            <div className="bg-slate-50 border-2 border-dashed border-gray-300 rounded-2xl p-6 max-w-sm mx-auto shadow-sm">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                Official Registration ID
              </div>
              <div className="text-lg font-mono font-black text-university-maroon bg-white py-1 px-3 rounded-lg border border-gray-200 inline-block">
                {confirmedRegistration.registrationId}
              </div>

              {/* QR Code Graphic */}
              <div className="my-5 p-3 bg-white rounded-xl shadow-sm border border-gray-200 inline-block">
                <QRCodeSVG
                  value={confirmedRegistration.qrCode}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="text-xs text-gray-600 space-y-1">
                <p className="font-semibold text-gray-900">{formData.name}</p>
                <p>
                  Enrollment: <span className="font-mono font-bold">{formData.enrollmentNumber || user?.enrollmentNumber || "N/A"}</span>
                </p>
                <p className="text-[11px] text-gray-500">{event.venue}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center pt-2">
              <button
                onClick={handleDownloadICS}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition"
              >
                <Calendar className="w-4 h-4 text-university-maroon" />
                <span>Add to Calendar</span>
              </button>

              <Link
                href="/my-events"
                onClick={onClose}
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-university-maroon hover:bg-university-darkmaroon text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
              >
                <span>Go to My Events</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-university-maroon/20 focus:border-university-maroon"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Enrollment Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. U22CS045"
                  value={formData.enrollmentNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, enrollmentNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm uppercase focus:ring-2 focus:ring-university-maroon/20 focus:border-university-maroon"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  University Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-university-maroon/20 focus:border-university-maroon"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-university-maroon/20 focus:border-university-maroon"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Course / Degree *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech, M.Sc, MBA, BA LLB"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-university-maroon/20 focus:border-university-maroon"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Department *
                </label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-university-maroon/20 focus:border-university-maroon"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Semester
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-university-maroon/20 focus:border-university-maroon bg-white"
                >
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="3rd Semester">3rd Semester</option>
                  <option value="4th Semester">4th Semester</option>
                  <option value="5th Semester">5th Semester</option>
                  <option value="6th Semester">6th Semester</option>
                  <option value="7th Semester">7th Semester</option>
                  <option value="8th Semester">8th Semester</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-university-maroon/20 focus:border-university-maroon bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Event Specific Notes / Team */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Event-Specific Information / Team Name / Dietary notes
              </label>
              <textarea
                rows={2}
                placeholder="Optional: Team name, topic of interest, or relevant notes for the organizers"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-university-maroon/20 focus:border-university-maroon"
              />
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="py-2.5 px-6 rounded-xl bg-university-maroon hover:bg-university-darkmaroon text-white text-xs font-bold shadow-md transition disabled:opacity-50"
              >
                {submitting ? "Processing..." : "Confirm Registration"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
