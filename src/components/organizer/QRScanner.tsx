"use client";

import React, { useState } from "react";
import { QrCode, Search, CheckCircle2, AlertTriangle, UserCheck, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";
import { EventItem } from "@/lib/types";

interface QRScannerProps {
  events: EventItem[];
  selectedEventId?: string;
  onAttendanceMarked?: () => void;
}

export function QRScanner({
  events,
  selectedEventId,
  onAttendanceMarked,
}: QRScannerProps) {
  const [currentEventId, setCurrentEventId] = useState(selectedEventId || (events[0]?.id || ""));
  const [qrInput, setQrInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScanSubmit = async (codeToVerify?: string) => {
    const code = codeToVerify || qrInput.trim();
    if (!code) {
      setError("Please provide a QR Code payload or Registration ID.");
      return;
    }

    setScanning(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrData: code,
          eventId: currentEventId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.alreadyMarked) {
          setResult({
            alreadyMarked: true,
            message: data.error,
            student: data.student,
            record: data.record,
          });
        } else {
          setError(data.error || "Failed to mark attendance.");
        }
        return;
      }

      setResult({
        success: true,
        message: data.message,
        student: data.student,
        attendance: data.attendance,
        event: data.event,
      });

      setQrInput("");
      if (onAttendanceMarked) onAttendanceMarked();
    } catch (err: any) {
      setError(err.message || "Failed to connect to verification server.");
    } finally {
      setScanning(false);
    }
  };

  // Quick Demo Simulator Codes
  const demoCodes = [
    { label: "Aditya Verma (U22CS045)", code: "DHSGSU-REG:DHSGSU-EVT-2026-0001:U22CS045" },
    { label: "Pooja Bundela (U23PH012)", code: "DHSGSU-REG:DHSGSU-EVT-2026-0003:U23PH012" },
    { label: "Vikram Rajput (U21LW088)", code: "DHSGSU-REG:DHSGSU-EVT-2026-0004:U21LW088" },
  ];

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-university-maroon/10 text-university-maroon flex items-center justify-center">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-black text-gray-900">
              QR Attendance Scanner
            </h3>
            <p className="text-xs text-gray-500">
              Scan student pass or enter Registration ID to verify venue presence
            </p>
          </div>
        </div>

        {/* Target Event Selector */}
        <div className="w-full sm:w-72">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Active Event:
          </label>
          <select
            value={currentEventId}
            onChange={(e) => {
              setCurrentEventId(e.target.value);
              setResult(null);
              setError(null);
            }}
            className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-university-maroon/20 text-gray-800"
          >
            <option value="">Any Registered Event</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title.slice(0, 40)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Scan Input Card */}
      <div className="bg-slate-50 border border-gray-200 rounded-2xl p-6 text-center space-y-4">
        <div className="max-w-md mx-auto space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Scan or paste Registration ID (e.g. DHSGSU-EVT-2026-0001)..."
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleScanSubmit();
              }}
              className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-university-maroon/20 focus:border-university-maroon bg-white"
            />
            <button
              onClick={() => handleScanSubmit()}
              disabled={scanning || !qrInput.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-university-maroon hover:bg-university-darkmaroon text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
            >
              Verify
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Accepts optical scanner input, camera reader strings, or raw registration identifiers.
          </p>

          {/* Quick Demo Simulator Buttons */}
          <div className="pt-2 border-t border-gray-200">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              ⚡ 1-Click Test Scanners (Instant Demo):
            </span>
            <div className="flex flex-wrap gap-2 justify-center">
              {demoCodes.map((d) => (
                <button
                  key={d.code}
                  onClick={() => {
                    setQrInput(d.code);
                    handleScanSubmit(d.code);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-medium text-gray-700 hover:border-university-maroon hover:text-university-maroon shadow-xs transition"
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-sm">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
          <div>
            <h4 className="font-bold text-rose-900">Check-in Error</h4>
            <p className="text-xs mt-0.5 text-rose-700">{error}</p>
          </div>
        </div>
      )}

      {/* Result Display: Already Marked Duplicate Warning */}
      {result?.alreadyMarked && (
        <div className="p-6 bg-amber-50 border-2 border-amber-300 rounded-3xl flex flex-col sm:flex-row items-center gap-5 text-amber-900">
          <div className="w-14 h-14 rounded-2xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-1 text-center sm:text-left flex-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-200 text-amber-900 uppercase">
              Duplicate Attendance Prevented
            </span>
            <h4 className="text-lg font-bold text-gray-900">
              {result.student?.name} is already checked in!
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">{result.message}</p>
            {result.student?.enrollmentNumber && (
              <p className="text-xs font-mono font-bold text-gray-600">
                Enrollment: {result.student.enrollmentNumber}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Result Display: Success */}
      {result?.success && (
        <div className="p-6 bg-emerald-50 border-2 border-emerald-300 rounded-3xl flex flex-col sm:flex-row items-center gap-5 text-emerald-900 animate-in fade-in zoom-in-95">
          <div className="w-14 h-14 rounded-2xl bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0 shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1 text-center sm:text-left flex-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-200 text-emerald-900 uppercase">
              Attendance Recorded
            </span>
            <h4 className="text-xl font-bold text-gray-900">{result.student?.name}</h4>
            <div className="text-xs text-gray-600 space-y-0.5">
              <p>
                Enrollment:{" "}
                <span className="font-mono font-bold text-gray-900">
                  {result.student?.enrollmentNumber || "N/A"}
                </span>{" "}
                • {result.student?.course || "Course Registered"}
              </p>
              <p>
                Department:{" "}
                <span className="font-semibold text-gray-800">
                  {result.student?.department || "DHSGSU"}
                </span>
              </p>
              <p className="text-[11px] text-emerald-700 font-semibold pt-1">
                Checked in at {new Date(result.attendance.checkInTime).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
