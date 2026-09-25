"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import {
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Award,
  XCircle,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  ExternalLink,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { RegistrationItem, CertificateItem } from "@/lib/types";
import { formatDate, getCategoryBadgeClass } from "@/lib/utils";
import { CertificateView } from "@/components/certificates/CertificateView";

export default function MyEventsPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");

  // QR Modal
  const [selectedQR, setSelectedQR] = useState<{
    id: string;
    qr: string;
    eventTitle: string;
    regId: string;
  } | null>(null);

  // Certificate Modal
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateItem | null>(null);
  const [issuingCertFor, setIssuingCertFor] = useState<string | null>(null);

  const fetchStudentData = async () => {
    try {
      const [regRes, certRes] = await Promise.all([
        fetch("/api/registrations"),
        fetch("/api/certificates"),
      ]);
      const regData = await regRes.json();
      const certData = await certRes.json();
      setRegistrations(regData.registrations || []);
      setCertificates(certData.certificates || []);
    } catch (e) {
      console.error("Error loading student events:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [user]);

  const handleCancelRegistration = async (id: string, eventTitle: string) => {
    if (!confirm(`Are you sure you want to cancel your registration for '${eventTitle}'?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/registrations/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchStudentData();
      } else {
        alert("Failed to cancel registration.");
      }
    } catch {
      alert("Network error.");
    }
  };

  const handleGenerateOrViewCertificate = async (reg: RegistrationItem) => {
    // Check if certificate already exists in certificates array
    const existing = certificates.find((c) => c.eventId === reg.eventId);
    if (existing) {
      setSelectedCertificate(existing);
      return;
    }

    // Try to issue certificate via POST
    setIssuingCertFor(reg.id);
    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: reg.eventId }),
      });
      const data = await res.json();
      if (res.ok && data.certificate) {
        setSelectedCertificate(data.certificate);
        fetchStudentData();
      } else {
        alert(data.error || "Attendance must be verified to obtain certificate.");
      }
    } catch {
      alert("Failed to issue certificate.");
    } finally {
      setIssuingCertFor(null);
    }
  };

  // Filtered registrations based on tab
  const todayStr = new Date().toISOString().split("T")[0];

  const upcomingRegistrations = registrations.filter(
    (r) => r.status === "CONFIRMED" && (!r.event.isPast && r.event.eventDate >= todayStr)
  );

  const completedRegistrations = registrations.filter(
    (r) => r.status === "CONFIRMED" && (r.event.isPast || r.event.eventDate < todayStr || r.attendance?.length)
  );

  const cancelledRegistrations = registrations.filter((r) => r.status === "CANCELLED");

  const currentList =
    activeTab === "upcoming"
      ? upcomingRegistrations
      : activeTab === "completed"
      ? completedRegistrations
      : cancelledRegistrations;

  const attendedCount = registrations.filter((r) => r.attendance && r.attendance.length > 0).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Student Banner */}
      <div className="bg-gradient-to-r from-university-maroon to-university-navy text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-university-gold uppercase tracking-widest">
              Student Dashboard
            </span>
            <h1 className="text-2xl sm:text-4xl font-serif font-black">
              Welcome, {user?.name || "Student"} 👋
            </h1>
            <p className="text-xs sm:text-sm text-gray-200">
              Enrollment No: <span className="font-mono font-bold text-amber-200">{user?.enrollmentNumber || "U22CS045"}</span> • {user?.course || "B.Tech Computer Science"}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
              <span className="text-xl sm:text-2xl font-black text-amber-300 block">
                {upcomingRegistrations.length}
              </span>
              <span className="text-[10px] text-gray-300 font-semibold uppercase">Upcoming</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
              <span className="text-xl sm:text-2xl font-black text-amber-300 block">
                {registrations.length}
              </span>
              <span className="text-[10px] text-gray-300 font-semibold uppercase">Registered</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
              <span className="text-xl sm:text-2xl font-black text-amber-300 block">
                {attendedCount}
              </span>
              <span className="text-[10px] text-gray-300 font-semibold uppercase">Attended</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
              <span className="text-xl sm:text-2xl font-black text-amber-300 block">
                {certificates.length}
              </span>
              <span className="text-[10px] text-gray-300 font-semibold uppercase">Certificates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-4 sm:gap-8">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`pb-4 text-sm font-bold transition relative ${
            activeTab === "upcoming"
              ? "text-university-maroon border-b-2 border-university-maroon"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Upcoming Events ({upcomingRegistrations.length})
        </button>

        <button
          onClick={() => setActiveTab("completed")}
          className={`pb-4 text-sm font-bold transition relative ${
            activeTab === "completed"
              ? "text-university-maroon border-b-2 border-university-maroon"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Completed &amp; Past ({completedRegistrations.length})
        </button>

        <button
          onClick={() => setActiveTab("cancelled")}
          className={`pb-4 text-sm font-bold transition relative ${
            activeTab === "cancelled"
              ? "text-university-maroon border-b-2 border-university-maroon"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Cancelled ({cancelledRegistrations.length})
        </button>
      </div>

      {/* Registrations List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No events in this section</h3>
          <p className="text-xs text-gray-500">
            You don&apos;t have any {activeTab} registrations currently.
          </p>
          <Link
            href="/events"
            className="inline-block px-5 py-2.5 bg-university-maroon text-white text-xs font-bold rounded-xl shadow-xs hover:bg-university-darkmaroon transition"
          >
            Explore Events Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentList.map((reg) => {
            const hasAttended = reg.attendance && reg.attendance.length > 0;
            const hasCertificate = certificates.some((c) => c.eventId === reg.eventId);

            return (
              <div
                key={reg.id}
                className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`px-3 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadgeClass(
                        reg.event.category
                      )}`}
                    >
                      {reg.event.category}
                    </span>

                    {/* Attendance Pill */}
                    {hasAttended ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Present (Verified)</span>
                      </span>
                    ) : reg.status === "CANCELLED" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                        Cancelled
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        Confirmed Entry
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                    {reg.event.title}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center gap-2 text-university-maroon font-semibold">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span>{formatDate(reg.event.eventDate)}</span>
                      <span>•</span>
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{reg.event.startTime}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 shrink-0 text-gray-400" />
                      <span className="truncate">{reg.event.venue}</span>
                    </div>

                    <div className="pt-2 text-[11px] font-mono text-gray-500">
                      Reg ID: <span className="font-bold text-gray-800">{reg.registrationId}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Show QR Button */}
                    <button
                      onClick={() =>
                        setSelectedQR({
                          id: reg.id,
                          qr: reg.qrCode,
                          eventTitle: reg.event.title,
                          regId: reg.registrationId,
                        })
                      }
                      className="py-2 px-3 rounded-xl border border-gray-300 hover:border-university-maroon text-xs font-bold text-gray-700 hover:text-university-maroon flex items-center gap-1.5 transition"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Show QR Pass</span>
                    </button>

                    {/* Certificate Action if attended */}
                    {hasAttended && (
                      <button
                        onClick={() => handleGenerateOrViewCertificate(reg)}
                        disabled={issuingCertFor === reg.id}
                        className="py-2 px-3 rounded-xl bg-university-gold/20 hover:bg-university-gold/30 text-university-navy border border-university-gold/60 text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <Award className="w-4 h-4 text-university-maroon" />
                        <span>
                          {issuingCertFor === reg.id
                            ? "Issuing..."
                            : hasCertificate
                            ? "View Certificate"
                            : "Claim Certificate"}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Cancel Button if upcoming */}
                  {reg.status === "CONFIRMED" && !reg.event.isPast && !hasAttended && (
                    <button
                      onClick={() => handleCancelRegistration(reg.id, reg.event.title)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline"
                    >
                      Cancel Registration
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Pass Modal */}
      {selectedQR && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-xs font-bold text-university-maroon uppercase tracking-wider">
                Event Pass &amp; Check-in
              </span>
              <button
                onClick={() => setSelectedQR(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-base font-bold text-gray-900 line-clamp-2">
              {selectedQR.eventTitle}
            </h3>

            <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-gray-300 inline-block shadow-inner">
              <QRCodeSVG value={selectedQR.qr} size={200} level="H" includeMargin={true} />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                Registration ID
              </span>
              <span className="text-sm font-mono font-black text-university-maroon bg-slate-100 px-3 py-1 rounded-lg inline-block">
                {selectedQR.regId}
              </span>
              <p className="text-[11px] text-gray-500 pt-1">
                Present this QR code to the event coordinator at the venue entrance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Viewer Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedCertificate(null)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full transition z-20 print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            <CertificateView
              certificateId={selectedCertificate.certificateId}
              studentName={selectedCertificate.student?.name || user?.name || "Student"}
              enrollmentNumber={selectedCertificate.student?.enrollmentNumber || user?.enrollmentNumber}
              course={selectedCertificate.student?.course || user?.course}
              eventTitle={selectedCertificate.event?.title || "University Event"}
              category={selectedCertificate.event?.category}
              departmentName={selectedCertificate.event?.department?.name || "Dr. Harisingh Gour Vishwavidyalaya"}
              eventDate={selectedCertificate.event?.eventDate || "2026-10-15"}
              issuedAt={selectedCertificate.issuedAt}
            />
          </div>
        </div>
      )}
    </div>
  );
}
