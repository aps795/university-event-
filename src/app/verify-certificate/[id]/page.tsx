"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ShieldAlert, Award, Calendar, CheckCircle2, ArrowLeft, ExternalLink, Printer } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function VerifyCertificatePage() {
  const params = useParams();
  const id = params?.id as string;

  const [verification, setVerification] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch(`/api/certificates/${id}`);
        const data = await res.json();
        if (res.ok && data.verified) {
          setVerification(data);
        } else {
          setError(data.error || "Certificate could not be verified in the university database.");
        }
      } catch (err: any) {
        setError("Network error while connecting to verification server.");
      } finally {
        setLoading(false);
      }
    }
    if (id) verify();
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-university-maroon transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full animate-pulse mx-auto" />
          <p className="text-sm font-semibold text-gray-600">Verifying credential in DHSGSU Digital Registry...</p>
        </div>
      ) : error || !verification ? (
        /* Invalid Certificate State */
        <div className="bg-white p-8 sm:p-12 rounded-3xl border-2 border-rose-300 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-700 uppercase tracking-widest">
              Unverified Record
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-gray-900">
              Certificate Not Found
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
              No authentic university credential exists with identifier{" "}
              <span className="font-mono font-bold text-gray-900">{id}</span>.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-gray-200 rounded-2xl text-xs text-gray-500 max-w-md mx-auto text-left space-y-1.5">
            <p className="font-bold text-gray-700">Security Verification Advisory:</p>
            <p>• Only certificates issued through DHSGSU EventHub are officially recorded.</p>
            <p>• Check that the Certificate ID in your URL or QR code is spelled accurately.</p>
            <p>• For manual inquiries, contact the Office of the Dean, Student Welfare.</p>
          </div>
        </div>
      ) : (
        /* Verified Authentic Certificate Record */
        <div className="bg-white rounded-3xl border-2 border-emerald-300 shadow-2xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-6 sm:p-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/10 text-emerald-300 border border-emerald-400/40 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-400/20 text-emerald-200 uppercase tracking-widest border border-emerald-400/40 inline-block">
                    Official DHSGSU Record
                  </span>
                  <h1 className="text-xl sm:text-2xl font-serif font-black text-white mt-1">
                    Authentic Certificate Verified
                  </h1>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[11px] text-emerald-200 block uppercase font-mono">
                  Certificate ID
                </span>
                <span className="text-base sm:text-lg font-mono font-black text-white">
                  {verification.certificateId}
                </span>
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="p-6 sm:p-10 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Student Name
                </span>
                <div className="text-lg font-serif font-black text-gray-900">
                  {verification.studentName}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Enrollment Number
                </span>
                <div className="text-base font-mono font-bold text-gray-800">
                  {verification.enrollmentNumber}
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Event / Activity Name
                </span>
                <div className="text-base font-bold text-university-maroon">
                  {verification.eventTitle}
                </div>
                <div className="text-xs text-gray-500">
                  Category: <span className="font-semibold text-gray-700">{verification.eventCategory}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Organizing Department
                </span>
                <div className="text-sm font-semibold text-gray-800">
                  {verification.department}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Event Date
                </span>
                <div className="text-sm font-semibold text-gray-800">
                  {formatDate(verification.eventDate)}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Issuing Institution
                </span>
                <div className="text-xs font-bold text-gray-800">
                  {verification.institution}
                </div>
                <div className="text-[11px] text-gray-500">{verification.accreditation}</div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Date of Issuance
                </span>
                <div className="text-xs font-semibold text-gray-800">
                  {new Date(verification.issuedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>

            {/* Official Validation Badge */}
            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verification Status: AUTHENTIC &amp; DIGITALLY SIGNED</span>
              </div>

              <button
                onClick={() => window.print()}
                className="py-2.5 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-2 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Record</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
