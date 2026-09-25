"use client";

import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Award, Download, Printer, ShieldCheck, CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface CertificateViewProps {
  certificateId: string;
  studentName: string;
  enrollmentNumber?: string | null;
  course?: string | null;
  eventTitle: string;
  category?: string;
  departmentName: string;
  eventDate: string;
  organizerName?: string;
  issuedAt: string | Date;
}

export function CertificateView({
  certificateId,
  studentName,
  enrollmentNumber,
  course,
  eventTitle,
  category,
  departmentName,
  eventDate,
  organizerName = "Dean, Student Welfare",
  issuedAt,
}: CertificateViewProps) {
  const verificationUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify-certificate/${certificateId}`
      : `https://dhsgsu.edu.in/verify-certificate/${certificateId}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar (hidden during print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm print:hidden">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span className="text-xs sm:text-sm font-bold text-gray-800">
            Verified University Credential
          </span>
          <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold">
            {certificateId}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="py-2 px-4 bg-university-maroon hover:bg-university-darkmaroon text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>

          <Link
            href={`/verify-certificate/${certificateId}`}
            target="_blank"
            className="py-2 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <span>Verify Online</span>
          </Link>
        </div>
      </div>

      {/* Official Certificate Layout (Designed for Screen & Print) */}
      <div
        id="printable-certificate"
        className="relative bg-[#fffdf8] text-gray-900 border-12 border-double border-[#8C1D40] rounded-2xl p-8 sm:p-14 shadow-2xl overflow-hidden max-w-4xl mx-auto my-4"
        style={{
          boxShadow: "0 20px 40px -15px rgba(120, 16, 40, 0.15)",
        }}
      >
        {/* Subtle Watermark Crest Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <span className="text-[350px] font-serif font-black text-university-maroon">ध</span>
        </div>

        {/* Outer Filigree / Corner Ornaments */}
        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-university-gold" />
        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-university-gold" />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-university-gold" />
        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-university-gold" />

        {/* Certificate Header */}
        <div className="text-center relative z-10 space-y-2">
          {/* University Seal Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-university-maroon text-university-gold border-4 border-university-gold shadow-md mx-auto flex items-center justify-center font-serif text-3xl sm:text-4xl font-black">
            <span>ध</span>
          </div>

          <div className="pt-2">
            <h1 className="text-xl sm:text-3xl font-serif font-black tracking-wide text-university-maroon uppercase">
              Dr. Harisingh Gour Vishwavidyalaya, Sagar (M.P.)
            </h1>
            <p className="text-xs sm:text-sm font-serif font-medium text-amber-900/90 tracking-widest uppercase">
              (A Central University Established under Central Universities Act, 2009 • NAAC &apos;A&apos; Grade)
            </p>
          </div>

          <div className="pt-4">
            <span className="inline-block px-6 py-1.5 rounded-full bg-university-gold/20 text-university-maroon font-serif text-sm sm:text-base font-bold uppercase tracking-widest border border-university-gold/60">
              Certificate of Participation
            </span>
          </div>
        </div>

        {/* Body Text */}
        <div className="my-8 text-center space-y-4 relative z-10">
          <p className="text-sm sm:text-base font-serif italic text-gray-700">
            This certificate is proudly presented to
          </p>

          <div className="py-2">
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-gray-900 tracking-tight underline decoration-university-gold decoration-2 underline-offset-8">
              {studentName}
            </h2>
            {enrollmentNumber && (
              <p className="text-xs sm:text-sm font-mono font-bold text-gray-600 mt-2">
                Enrollment No: {enrollmentNumber} {course ? `• ${course}` : ""}
              </p>
            )}
          </div>

          <p className="text-sm sm:text-base font-serif italic text-gray-700">
            For successfully participating in
          </p>

          <div className="py-1">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-university-maroon max-w-2xl mx-auto leading-snug">
              {eventTitle}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Organized by <span className="font-semibold text-gray-800">{departmentName}</span>
            </p>
          </div>

          <p className="text-xs sm:text-sm text-gray-600">
            Held on <span className="font-bold text-gray-800">{formatDate(eventDate)}</span> at Patharia Hills Campus, Sagar, Madhya Pradesh.
          </p>
        </div>

        {/* Signatures & QR Section */}
        <div className="pt-8 mt-6 border-t border-gray-300 relative z-10 grid grid-cols-3 items-end text-center">
          {/* Left Signatory */}
          <div className="space-y-1">
            <div className="h-10 flex items-center justify-center">
              <span className="font-serif italic font-bold text-gray-700 text-sm">
                Dr. R. K. Sahu
              </span>
            </div>
            <div className="border-t border-gray-400 w-32 sm:w-40 mx-auto" />
            <p className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">
              Event Convener
            </p>
            <p className="text-[9px] text-gray-500">Department Coordinator</p>
          </div>

          {/* Center QR Code for Instant Verification */}
          <div className="flex flex-col items-center justify-center space-y-1">
            <div className="p-2 bg-white border border-gray-300 rounded-lg shadow-xs inline-block">
              <QRCodeSVG
                value={verificationUrl}
                size={80}
                level="M"
                includeMargin={false}
              />
            </div>
            <p className="text-[9px] font-mono text-gray-500 font-bold uppercase tracking-wider">
              {certificateId}
            </p>
            <span className="text-[8px] text-gray-400">Scan to Verify</span>
          </div>

          {/* Right Signatory */}
          <div className="space-y-1">
            <div className="h-10 flex items-center justify-center">
              <span className="font-serif italic font-bold text-gray-700 text-sm">
                Prof. Arvind Sharma
              </span>
            </div>
            <div className="border-t border-gray-400 w-32 sm:w-40 mx-auto" />
            <p className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">
              Dean, Student Welfare
            </p>
            <p className="text-[9px] text-gray-500">Dr. Harisingh Gour Vishwavidyalaya</p>
          </div>
        </div>

        {/* Footer Seal Verification Note */}
        <div className="mt-8 text-center text-[9px] text-gray-400 tracking-wider uppercase font-mono relative z-10">
          Official University E-Certificate • Authenticated by DHSGSU EventHub Digital Registry
        </div>
      </div>
    </div>
  );
}
