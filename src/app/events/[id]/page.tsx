"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  UserCheck,
  Award,
  Share2,
  CalendarPlus,
  ShieldAlert,
  ArrowLeft,
  Phone,
  Mail,
  FileText,
  Info,
  CheckCircle2,
} from "lucide-react";
import { EventItem } from "@/lib/types";
import { formatDate, getCategoryBadgeClass, getStatusBadgeClass } from "@/lib/utils";
import { EventRegistrationModal } from "@/components/events/EventRegistrationModal";

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchEventDetails() {
      try {
        const res = await fetch(`/api/events/${id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Event not found");
        } else {
          setEvent(data.event);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchEventDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-6">
        <div className="h-96 bg-gray-200 rounded-3xl animate-pulse" />
        <div className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Event Not Found</h2>
        <p className="text-xs text-gray-500">
          The requested university event may have been unlisted or removed.
        </p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-university-maroon text-white text-xs font-bold rounded-xl shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events Directory</span>
        </Link>
      </div>
    );
  }

  const registeredCount = event._count?.registrations || 0;
  const seatsLeft = Math.max(0, event.maxParticipants - registeredCount);
  const percentFilled = Math.min(100, Math.round((registeredCount / event.maxParticipants) * 100));

  const isRegistrationOpen =
    event.status === "PUBLISHED" &&
    !event.isPast &&
    seatsLeft > 0 &&
    new Date(event.registrationDeadline + "T23:59:59") >= new Date();

  // Parse rules
  let parsedRules: string[] = [];
  if (event.rules) {
    try {
      parsedRules = JSON.parse(event.rules);
    } catch {
      parsedRules = event.rules.split("\n").filter(Boolean);
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Check out ${event.title} at Dr. Harisingh Gour Vishwavidyalaya!`,
          url: window.location.href,
        });
      } catch {
        // user cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
    link.setAttribute("download", `${event.title.slice(0, 25)}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back button */}
      <div>
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-university-maroon transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </Link>
      </div>

      {/* Hero Poster Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-gray-200 shadow-xl min-h-[340px] sm:min-h-[420px] flex items-end">
        {event.posterUrl && (
          <img
            src={event.posterUrl}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />

        <div className="relative z-10 p-6 sm:p-10 w-full space-y-4 text-white">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-3.5 py-1 rounded-full text-xs font-bold border shadow-xs backdrop-blur-md ${getCategoryBadgeClass(
                event.category
              )}`}
            >
              {event.category}
            </span>

            {event.subCategory && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-md">
                {event.subCategory}
              </span>
            )}

            {event.isPast ? (
              <span className="px-3.5 py-1 rounded-full text-xs font-black bg-rose-600 uppercase tracking-wider shadow-md">
                Past Event
              </span>
            ) : (
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md bg-white/90 ${getStatusBadgeClass(
                  event.status
                )}`}
              >
                {isRegistrationOpen ? "Registration Open" : event.status.replace("_", " ")}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black leading-tight max-w-4xl">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-200">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-university-gold" />
              <span>{formatDate(event.eventDate)}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-university-gold" />
              <span>{event.startTime} – {event.endTime}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-university-gold" />
              <span>{event.venue}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: Details, Rules, Eligibility */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Event */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-xl font-serif font-black text-gray-900 border-b border-gray-100 pb-3">
              About This Event
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Speaker / Guest Information */}
          {event.speakerGuest && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-3">
              <h2 className="text-xl font-serif font-black text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-university-maroon" />
                <span>Distinguished Speaker / Guest</span>
              </h2>
              <p className="text-sm font-semibold text-gray-800 bg-amber-50 p-4 rounded-2xl border border-amber-200">
                {event.speakerGuest}
              </p>
            </div>
          )}

          {/* Event Rules & Regulations */}
          {parsedRules.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-xl font-serif font-black text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-university-maroon" />
                <span>Guidelines &amp; Regulations</span>
              </h2>
              <ul className="space-y-2.5">
                {parsedRules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700">
                    <span className="w-5 h-5 rounded-full bg-university-maroon/10 text-university-maroon font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Eligibility & Required Documents */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-xl font-serif font-black text-gray-900 border-b border-gray-100 pb-3">
              Eligibility &amp; Entry Requirements
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 space-y-1">
                <span className="font-bold text-gray-900 block">Eligibility</span>
                <span className="text-gray-600">{event.eligibility || "Open to all DHSGSU students"}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 space-y-1">
                <span className="font-bold text-gray-900 block">Required Credentials</span>
                <span className="text-gray-600">
                  {event.requiredDocuments || "University Student ID Card / Samarth Enrollment Slip"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Registration Card, Capacity, Organizer Contact */}
        <div className="space-y-6">
          {/* Action Card */}
          <div className="bg-white rounded-3xl p-6 border-2 border-university-maroon/20 shadow-lg space-y-6 sticky top-28">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Registration Status
              </span>
              <div className="text-2xl font-serif font-black text-university-maroon mt-1">
                {isRegistrationOpen ? "Registration Open" : event.isPast ? "Event Concluded" : "Closed"}
              </div>
            </div>

            {/* Capacity Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-600">
                  {event.isPast ? "Total Attended" : "Available Seats"}
                </span>
                <span className="font-bold text-gray-900">
                  {registeredCount} / {event.maxParticipants}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    percentFilled >= 90 ? "bg-rose-500" : percentFilled >= 60 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${percentFilled}%` }}
                />
              </div>
              {!event.isPast && (
                <p className="text-[11px] text-gray-500 text-right">
                  Deadline: <span className="font-semibold text-gray-700">{formatDate(event.registrationDeadline)}</span>
                </p>
              )}
            </div>

            {/* Registration CTA */}
            <div className="space-y-3 pt-2">
              {isRegistrationOpen ? (
                <button
                  onClick={() => setModalOpen(true)}
                  className="w-full py-3.5 px-6 rounded-2xl bg-university-maroon hover:bg-university-darkmaroon text-white font-bold text-sm shadow-md transition transform hover:-translate-y-0.5"
                >
                  Register for Event
                </button>
              ) : event.isPast ? (
                <div className="p-3 bg-gray-100 text-gray-600 rounded-xl text-center text-xs font-semibold">
                  This is a past event. Registration has closed.
                </div>
              ) : (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-center text-xs font-semibold">
                  Registration for this event is currently not available.
                </div>
              )}

              {/* Utility actions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleDownloadICS}
                  className="py-2.5 px-3 rounded-xl border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center justify-center gap-1.5 transition"
                >
                  <CalendarPlus className="w-4 h-4 text-university-maroon" />
                  <span>Calendar</span>
                </button>

                <button
                  onClick={handleShare}
                  className="py-2.5 px-3 rounded-xl border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center justify-center gap-1.5 transition"
                >
                  <Share2 className="w-4 h-4 text-gray-600" />
                  <span>{copied ? "Copied Link!" : "Share"}</span>
                </button>
              </div>
            </div>

            {/* Organizer Contact Info */}
            <div className="pt-4 border-t border-gray-100 space-y-2 text-xs">
              <span className="font-bold text-gray-900 block uppercase tracking-wider text-[11px]">
                Organizing Authority
              </span>
              <p className="font-semibold text-university-maroon">
                {event.department?.name || "Dr. Harisingh Gour Vishwavidyalaya"}
              </p>
              {event.contactPerson && (
                <p className="text-gray-600">
                  Coordinator: <span className="font-medium text-gray-900">{event.contactPerson}</span>
                </p>
              )}
              {event.contactPhone && (
                <p className="text-gray-600 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{event.contactPhone}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {modalOpen && (
        <EventRegistrationModal
          event={event}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            // refresh event data to update seat counter
            fetch(`/api/events/${id}`)
              .then((r) => r.json())
              .then((d) => {
                if (d.event) setEvent(d.event);
              });
          }}
        />
      )}
    </div>
  );
}
