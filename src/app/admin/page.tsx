"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Shield,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  History,
  Building,
  Award,
  Layers,
  Sparkles,
  BarChart2,
  RefreshCw,
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
import { formatDate } from "@/lib/utils";

const COLORS = ["#781028", "#1E3A8A", "#D4AF37", "#059669", "#E11D48", "#7C3AED"];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const res = await fetch("/api/admin");
      const resData = await res.json();
      setData(resData);
    } catch (e) {
      console.error("Failed to load admin data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  const handleApproveEvent = async (eventId: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE_EVENT", eventId }),
      });
      if (res.ok) {
        setActionMessage("✅ Event approved and published successfully.");
        fetchAdminData();
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch {
      alert("Failed to approve event");
    }
  };

  const handleRejectEvent = async (eventId: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT_EVENT", eventId }),
      });
      if (res.ok) {
        setActionMessage("⚠️ Event returned to draft.");
        fetchAdminData();
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch {
      alert("Failed to reject event");
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_USER_ROLE", userId, newRole }),
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch {
      alert("Failed to update user role");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-6">
        <div className="h-40 bg-gray-200 rounded-3xl animate-pulse" />
        <div className="h-96 bg-gray-200 rounded-3xl animate-pulse" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const pendingEvents = data?.pendingEvents || [];
  const usersList = data?.users || [];
  const auditLogs = data?.recentAuditLogs || [];
  const categoryData = data?.categoryData || [];
  const departmentData = data?.departmentData || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="bg-university-navy text-white rounded-3xl p-6 sm:p-10 shadow-xl border-b-4 border-university-gold flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-university-gold font-bold text-xs uppercase tracking-widest">
            <Shield className="w-4 h-4" />
            <span>Administrative Governance Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-black mt-1">
            DHSGSU Central Administration
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Office of the Dean, Student Welfare • Event Approvals, Audit Logs &amp; University Analytics
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-2 text-xs font-semibold self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-bold animate-in fade-in">
          {actionMessage}
        </div>
      )}

      {/* High Level Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Students</span>
          <div className="text-2xl font-black text-gray-900 mt-1">{stats.totalStudents || 0}</div>
          <span className="text-[10px] text-blue-600 font-semibold">Active accounts</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Organizers</span>
          <div className="text-2xl font-black text-purple-600 mt-1">{stats.totalOrganizers || 0}</div>
          <span className="text-[10px] text-gray-500 font-medium">Faculty Leads</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Total Events</span>
          <div className="text-2xl font-black text-university-maroon mt-1">{stats.totalEvents || 0}</div>
          <span className="text-[10px] text-gray-500 font-medium">Recorded</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Registrations</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{stats.totalRegistrations || 0}</div>
          <span className="text-[10px] text-emerald-700 font-medium">Confirmed entries</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Attendance</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{stats.totalAttendance || 0}</div>
          <span className="text-[10px] text-amber-700 font-medium">QR Scans</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Certificates</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">{stats.totalCertificates || 0}</div>
          <span className="text-[10px] text-indigo-700 font-medium">E-Certs Issued</span>
        </div>
      </div>

      {/* Pending Event Approvals Queue */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-serif font-black text-gray-900">
              Pending Event Approvals ({pendingEvents.length})
            </h2>
            <p className="text-xs text-gray-500">
              Events submitted by departments requiring administrative sanction before publication.
            </p>
          </div>
          {pendingEvents.length > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              Action Required
            </span>
          )}
        </div>

        {pendingEvents.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-500 font-medium">
            ✨ All submitted events have been reviewed. No pending approvals in queue.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingEvents.map((ev: any) => (
              <div
                key={ev.id}
                className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-university-maroon text-white">
                    {ev.category}
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 mt-1">{ev.title}</h3>
                  <div className="text-xs text-gray-600 mt-0.5 space-x-2">
                    <span>Organizer: {ev.organizer?.name}</span>
                    <span>•</span>
                    <span>Dept: {ev.department?.name}</span>
                    <span>•</span>
                    <span>Date: {formatDate(ev.eventDate)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApproveEvent(ev.id)}
                    className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve &amp; Publish</span>
                  </button>

                  <button
                    onClick={() => handleRejectEvent(ev.id)}
                    className="py-2 px-3 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Return to Draft</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900">Events by Category</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="events"
                  label
                >
                  {categoryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Participation */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900">Registrations by Department</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
                <Bar dataKey="registrations" fill="#781028" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* User Directory & Role Assignment */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-serif font-black text-gray-900">
              User Directory &amp; Role Management
            </h2>
            <p className="text-xs text-gray-500">
              Enforce Role-Based Access Control (Student, Organizer, Administrator).
            </p>
          </div>
          <Users className="w-5 h-5 text-gray-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Enrollment / Dept</th>
                <th className="py-3 px-4 text-right">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usersList.slice(0, 15).map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-bold text-gray-900">{u.name}</td>
                  <td className="py-3 px-4 text-gray-600 font-mono text-[11px]">{u.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        u.role === "ADMIN"
                          ? "bg-rose-100 text-rose-800"
                          : u.role === "ORGANIZER"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {u.enrollmentNumber || u.department || "General"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                      className="py-1 px-2 border rounded-lg text-xs bg-white text-gray-700 font-medium"
                    >
                      <option value="STUDENT">Student</option>
                      <option value="ORGANIZER">Organizer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-serif font-black text-gray-900">
              System Audit Logs
            </h2>
            <p className="text-xs text-gray-500">
              Immutable chronological record of administrative actions, check-ins, and registrations.
            </p>
          </div>
          <History className="w-5 h-5 text-gray-400" />
        </div>

        <div className="space-y-2">
          {auditLogs.map((log: any) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-slate-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <span className="font-mono font-bold text-university-maroon bg-university-maroon/10 px-2 py-0.5 rounded mr-2 text-[10px]">
                  {log.action}
                </span>
                <span className="font-semibold text-gray-800">{log.details || log.entity}</span>
                {log.user && (
                  <span className="text-gray-500 ml-1 text-[11px]">
                    (by {log.user.name} • {log.user.role})
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-400 font-mono shrink-0">
                {new Date(log.timestamp).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
