"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar,
  Users,
  CheckCircle2,
  Plus,
  QrCode,
  FileDown,
  Megaphone,
  BarChart3,
  Layers,
  Sparkles,
  TrendingUp,
  X,
  Edit,
  Trash2,
  Clock,
  MapPin,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { EventItem, DepartmentItem, RegistrationItem } from "@/lib/types";
import { formatDate, getCategoryBadgeClass, getStatusBadgeClass } from "@/lib/utils";
import { QRScanner } from "@/components/organizer/QRScanner";

const COLORS = ["#781028", "#1E3A8A", "#D4AF37", "#059669", "#E11D48", "#7C3AED"];

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Active view tab
  const [activeTab, setActiveTab] = useState<"overview" | "events" | "scanner" | "participants" | "announcements">("overview");

  // Create/Edit Event Modal
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Selected event for participant view
  const [selectedEventIdForParts, setSelectedEventIdForParts] = useState<string>("");
  const [participants, setParticipants] = useState<RegistrationItem[]>([]);

  // Announcement Form State
  const [announcement, setAnnouncement] = useState({
    title: "",
    message: "",
    audience: "EVENT_PARTICIPANTS",
    targetEventId: "",
    type: "INFO",
  });
  const [announcementStatus, setAnnouncementStatus] = useState<string | null>(null);

  // Event Form State
  const [eventFormData, setEventFormData] = useState({
    title: "",
    description: "",
    category: "Academic",
    subCategory: "Seminars",
    departmentId: "",
    venue: "",
    eventDate: "2026-11-15",
    startTime: "10:00 AM",
    endTime: "01:00 PM",
    registrationDeadline: "2026-11-10",
    maxParticipants: 100,
    eligibility: "Open to all DHSGSU students",
    rules: "Bring University ID Card\nMaintain discipline in the auditorium\nAttendance mandatory for certificates",
    speakerGuest: "",
    contactPerson: user?.name || "Dr. Rajesh K. Sahu",
    contactPhone: user?.phone || "+91 94251 12345",
    requiredDocuments: "University Identity Card",
    posterUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    status: "PUBLISHED",
  });

  const fetchOrganizerData = async () => {
    try {
      const [evRes, deptRes] = await Promise.all([
        fetch("/api/events?limit=100"),
        fetch("/api/departments"),
      ]);
      const evData = await evRes.json();
      const deptData = await deptRes.json();

      const allEvents = evData.events || [];
      setEvents(allEvents);
      setDepartments(deptData.departments || []);
      if (allEvents.length > 0 && !selectedEventIdForParts) {
        setSelectedEventIdForParts(allEvents[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerData();
  }, [user]);

  // Fetch participants when selected event changes
  useEffect(() => {
    async function loadParticipants() {
      if (!selectedEventIdForParts) return;
      try {
        const res = await fetch(`/api/registrations?eventId=${selectedEventIdForParts}`);
        const data = await res.json();
        setParticipants(data.registrations || []);
      } catch (e) {
        console.error("Failed to load participants:", e);
      }
    }
    loadParticipants();
  }, [selectedEventIdForParts]);

  // Aggregate stats
  const totalEvents = events.length;
  const totalRegistrations = events.reduce((acc, ev) => acc + (ev._count?.registrations || 0), 0);
  const totalAttendance = events.reduce((acc, ev) => acc + (ev._count?.attendance || 0), 0);
  const todayStr = new Date().toISOString().split("T")[0];
  const todayEvents = events.filter((ev) => ev.eventDate === todayStr).length;
  const upcomingEventsCount = events.filter((ev) => !ev.isPast && ev.eventDate >= todayStr).length;

  // Chart 1: Registrations & Attendance by Event
  const eventChartData = events.slice(0, 6).map((ev) => ({
    name: ev.title.length > 18 ? ev.title.slice(0, 18) + "..." : ev.title,
    Registrations: ev._count?.registrations || 0,
    Attendance: ev._count?.attendance || 0,
    Capacity: ev.maxParticipants,
  }));

  // Chart 2: Category distribution
  const categoryCounts: Record<string, number> = {};
  for (const ev of events) {
    categoryCounts[ev.category] = (categoryCounts[ev.category] || 0) + 1;
  }
  const categoryChartData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Handle Event Create / Update Submit
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingEventId ? `/api/events/${editingEventId}` : "/api/events";
      const method = editingEventId ? "PUT" : "POST";

      const payload = {
        ...eventFormData,
        rules: eventFormData.rules.split("\n").filter(Boolean),
        departmentId: eventFormData.departmentId || departments[0]?.id,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setEventModalOpen(false);
        setEditingEventId(null);
        fetchOrganizerData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save event");
      }
    } catch {
      alert("Network error");
    }
  };

  const handleEditClick = (ev: EventItem) => {
    setEditingEventId(ev.id);
    setEventFormData({
      title: ev.title,
      description: ev.description,
      category: ev.category,
      subCategory: ev.subCategory || "Seminars",
      departmentId: ev.departmentId,
      venue: ev.venue,
      eventDate: ev.eventDate,
      startTime: ev.startTime,
      endTime: ev.endTime,
      registrationDeadline: ev.registrationDeadline,
      maxParticipants: ev.maxParticipants,
      eligibility: ev.eligibility || "Open to all DHSGSU students",
      rules: ev.rules ? (ev.rules.startsWith("[") ? JSON.parse(ev.rules).join("\n") : ev.rules) : "",
      speakerGuest: ev.speakerGuest || "",
      contactPerson: ev.contactPerson || "",
      contactPhone: ev.contactPhone || "",
      requiredDocuments: ev.requiredDocuments || "",
      posterUrl: ev.posterUrl || "",
      status: ev.status,
    });
    setEventModalOpen(true);
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete '${title}'?`)) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchOrganizerData();
      } else {
        alert("Failed to delete event");
      }
    } catch {
      alert("Network error");
    }
  };

  const handleBroadcastAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnnouncementStatus("Sending announcement...");
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: announcement.title,
          message: announcement.message,
          audience: announcement.audience,
          targetEventId: announcement.targetEventId || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAnnouncementStatus(`✅ ${data.message}`);
        setAnnouncement({ ...announcement, title: "", message: "" });
        setTimeout(() => setAnnouncementStatus(null), 4000);
      } else {
        setAnnouncementStatus(`❌ ${data.error}`);
      }
    } catch {
      setAnnouncementStatus("❌ Network error sending announcement");
    }
  };

  const handleExportCSV = () => {
    if (!selectedEventIdForParts) return;
    window.open(`/api/attendance?eventId=${selectedEventIdForParts}&format=csv`, "_blank");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase tracking-widest">
            <Layers className="w-4 h-4" />
            <span>Faculty &amp; Coordinator Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-gray-900 mt-1">
            Organizer Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage registrations, verify QR attendance, broadcast announcements, and monitor campus metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingEventId(null);
              setEventModalOpen(true);
            }}
            className="py-3 px-5 bg-university-maroon hover:bg-university-darkmaroon text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New Event</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition ${
            activeTab === "overview"
              ? "bg-purple-100 text-purple-900 shadow-xs"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Overview &amp; Analytics
        </button>

        <button
          onClick={() => setActiveTab("events")}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition ${
            activeTab === "events"
              ? "bg-purple-100 text-purple-900 shadow-xs"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Manage Events ({events.length})
        </button>

        <button
          onClick={() => setActiveTab("scanner")}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "scanner"
              ? "bg-purple-100 text-purple-900 shadow-xs"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>QR Attendance Scanner</span>
        </button>

        <button
          onClick={() => setActiveTab("participants")}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition ${
            activeTab === "participants"
              ? "bg-purple-100 text-purple-900 shadow-xs"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Participant Registry &amp; Export
        </button>

        <button
          onClick={() => setActiveTab("announcements")}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "announcements"
              ? "bg-purple-100 text-purple-900 shadow-xs"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>Broadcast Announcements</span>
        </button>
      </div>

      {/* 1. OVERVIEW & ANALYTICS TAB */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Total Events</span>
              <div className="text-2xl font-black text-gray-900 mt-1">{totalEvents}</div>
              <span className="text-[10px] text-emerald-600 font-semibold">Active campus portfolio</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Registrations</span>
              <div className="text-2xl font-black text-blue-600 mt-1">{totalRegistrations}</div>
              <span className="text-[10px] text-gray-400">Total student signups</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Today&apos;s Events</span>
              <div className="text-2xl font-black text-amber-600 mt-1">{todayEvents}</div>
              <span className="text-[10px] text-gray-400">Active today</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Total Attendance</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">{totalAttendance}</div>
              <span className="text-[10px] text-emerald-600 font-semibold">Verified via QR</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Upcoming</span>
              <div className="text-2xl font-black text-purple-600 mt-1">{upcomingEventsCount}</div>
              <span className="text-[10px] text-gray-400">On the calendar</span>
            </div>
          </div>

          {/* Recharts Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Registrations & Attendance by Event */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Registrations vs Verified Attendance
                  </h3>
                  <p className="text-xs text-gray-500">Real-time attendance rates per event</p>
                </div>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={eventChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                    <Bar dataKey="Registrations" fill="#1E3A8A" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Attendance" fill="#059669" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Events by Category */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900">Events by Category</h3>
              <p className="text-xs text-gray-500">Distribution across disciplines</p>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MANAGE EVENTS TAB */}
      {activeTab === "events" && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Event Details</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Date &amp; Venue</th>
                    <th className="py-3 px-4">Registrations</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {events.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900 line-clamp-1">{ev.title}</div>
                        <div className="text-[11px] text-gray-500">
                          {ev.department?.name || "DHSGSU"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold border ${getCategoryBadgeClass(ev.category)}`}>
                          {ev.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-gray-900 font-semibold">{formatDate(ev.eventDate)}</div>
                        <div className="text-gray-500 truncate max-w-[150px]">{ev.venue}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-gray-900">
                          {ev._count?.registrations || 0}
                        </span>{" "}
                        / {ev.maxParticipants}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold border text-[10px] ${getStatusBadgeClass(ev.status)}`}>
                          {ev.isPast ? "PAST EVENT" : ev.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleEditClick(ev)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-university-maroon"
                          title="Edit Event"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(ev.id, ev.title)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-red-50 text-gray-600 hover:text-red-700"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. QR SCANNER TAB */}
      {activeTab === "scanner" && (
        <QRScanner
          events={events}
          selectedEventId={selectedEventIdForParts}
          onAttendanceMarked={() => {
            fetchOrganizerData();
          }}
        />
      )}

      {/* 4. PARTICIPANTS & EXPORT TAB */}
      {activeTab === "participants" && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="w-full sm:w-96">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Select Event:
                </label>
                <select
                  value={selectedEventIdForParts}
                  onChange={(e) => setSelectedEventIdForParts(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm font-semibold bg-white"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({ev._count?.registrations || 0} registered)
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleExportCSV}
                className="py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 self-end sm:self-auto"
              >
                <FileDown className="w-4 h-4" />
                <span>Export Attendance as CSV</span>
              </button>
            </div>

            {/* Participants Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Registration ID</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Enrollment No</th>
                    <th className="py-3 px-4">Course &amp; Dept</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {participants.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No registrations found for this event.
                      </td>
                    </tr>
                  ) : (
                    participants.map((p) => {
                      const isPresent = p.attendance && p.attendance.length > 0;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 px-4 font-mono font-bold text-university-maroon">
                            {p.registrationId}
                          </td>
                          <td className="py-3 px-4 font-bold text-gray-900">
                            {p.student?.name}
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-gray-700">
                            {p.student?.enrollmentNumber || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {p.student?.course || "UG"} • {p.student?.department || "DHSGSU"}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 text-[10px]">
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {isPresent ? (
                              <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 text-[10px] flex items-center gap-1 w-max">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Present</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full font-bold bg-gray-100 text-gray-500 text-[10px]">
                                Not Checked In
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. BROADCAST ANNOUNCEMENTS TAB */}
      {activeTab === "announcements" && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 max-w-2xl mx-auto shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-university-maroon/10 text-university-maroon flex items-center justify-center">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-black text-gray-900">
                Broadcast Announcement
              </h3>
              <p className="text-xs text-gray-500">
                Notify registered participants about schedule changes, venue updates, or rules.
              </p>
            </div>
          </div>

          {announcementStatus && (
            <div className="p-3 bg-slate-50 border rounded-xl text-xs font-semibold">
              {announcementStatus}
            </div>
          )}

          <form onSubmit={handleBroadcastAnnouncement} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Announcement Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Venue Change Notice / Workshop Lab Assignment"
                value={announcement.title}
                onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-university-maroon/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Target Audience *
              </label>
              <select
                value={announcement.audience}
                onChange={(e) => setAnnouncement({ ...announcement, audience: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white"
              >
                <option value="EVENT_PARTICIPANTS">Participants of Specific Event</option>
                <option value="ALL_STUDENTS">All University Students</option>
              </select>
            </div>

            {announcement.audience === "EVENT_PARTICIPANTS" && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Select Event *
                </label>
                <select
                  value={announcement.targetEventId}
                  onChange={(e) =>
                    setAnnouncement({ ...announcement, targetEventId: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white"
                >
                  <option value="">Select target event</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Notification Message *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Write the circular or announcement instructions here..."
                value={announcement.message}
                onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-university-maroon/20"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-university-maroon hover:bg-university-darkmaroon text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              Send Official Announcement
            </button>
          </form>
        </div>
      )}

      {/* CREATE / EDIT EVENT MODAL */}
      {eventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setEventModalOpen(false);
                setEditingEventId(null);
              }}
              className="absolute top-5 right-5 p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-serif font-black text-gray-900 border-b border-gray-100 pb-3">
              {editingEventId ? "Edit University Event" : "Create University Event"}
            </h2>

            <form onSubmit={handleSaveEvent} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventFormData.title}
                    onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={eventFormData.description}
                    onChange={(e) =>
                      setEventFormData({ ...eventFormData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={eventFormData.category}
                    onChange={(e) =>
                      setEventFormData({ ...eventFormData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Student Activities">Student Activities</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Sub-Category
                  </label>
                  <input
                    type="text"
                    value={eventFormData.subCategory}
                    onChange={(e) =>
                      setEventFormData({ ...eventFormData, subCategory: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={eventFormData.departmentId}
                    onChange={(e) =>
                      setEventFormData({ ...eventFormData, departmentId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name.replace("Department of ", "")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Venue *</label>
                  <input
                    type="text"
                    required
                    value={eventFormData.venue}
                    onChange={(e) => setEventFormData({ ...eventFormData, venue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={eventFormData.eventDate}
                    onChange={(e) =>
                      setEventFormData({ ...eventFormData, eventDate: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Registration Deadline
                  </label>
                  <input
                    type="date"
                    value={eventFormData.registrationDeadline}
                    onChange={(e) =>
                      setEventFormData({ ...eventFormData, registrationDeadline: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={eventFormData.startTime}
                    onChange={(e) =>
                      setEventFormData({ ...eventFormData, startTime: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">End Time</label>
                  <input
                    type="text"
                    value={eventFormData.endTime}
                    onChange={(e) =>
                      setEventFormData({ ...eventFormData, endTime: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Max Capacity (Seats)
                  </label>
                  <input
                    type="number"
                    value={eventFormData.maxParticipants}
                    onChange={(e) =>
                      setEventFormData({
                        ...eventFormData,
                        maxParticipants: parseInt(e.target.value) || 100,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Event Status
                  </label>
                  <select
                    value={eventFormData.status}
                    onChange={(e) =>
                      setEventFormData({ ...eventFormData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="PENDING_APPROVAL">Pending Approval</option>
                    <option value="REGISTRATION_CLOSED">Registration Closed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Rules (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={eventFormData.rules}
                    onChange={(e) =>
                      setEventFormData({ ...eventFormData, rules: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Guest Speaker / Keynote
                  </label>
                  <input
                    type="text"
                    value={eventFormData.speakerGuest}
                    onChange={(e) =>
                      setEventFormData({ ...eventFormData, speakerGuest: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Poster Image URL
                  </label>
                  <input
                    type="url"
                    value={eventFormData.posterUrl}
                    onChange={(e) =>
                      setEventFormData({ ...eventFormData, posterUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEventModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-university-maroon hover:bg-university-darkmaroon text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {editingEventId ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
