"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
    enrollmentNumber: "",
    course: "B.Tech Computer Science & Engineering",
    department: "Department of Computer Science & Applications",
    semester: "6th Semester",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to register profile");
        setLoading(false);
        return;
      }

      await refreshUser();
      router.push(formData.role === "ORGANIZER" ? "/organizer" : "/my-events");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-university-maroon text-university-gold font-serif text-3xl font-black mx-auto flex items-center justify-center shadow-md border-2 border-university-gold">
            <span>ध</span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-university-maroon block">
            Dr. Harisingh Gour Vishwavidyalaya
          </span>
          <h2 className="text-2xl font-serif font-black text-gray-900">
            Create University Profile
          </h2>
          <p className="text-xs text-gray-500">
            Join the centralized event management and digital attendance portal
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-university-maroon/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                University Email *
              </label>
              <input
                type="email"
                required
                placeholder="student@dhsgsu.edu.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-university-maroon/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-university-maroon/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                User Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white"
              >
                <option value="STUDENT">Student</option>
                <option value="ORGANIZER">Faculty Organizer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Enrollment Number (or Faculty ID)
              </label>
              <input
                type="text"
                placeholder="e.g. U23CS099"
                value={formData.enrollmentNumber}
                onChange={(e) =>
                  setFormData({ ...formData, enrollmentNumber: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Course / Program
              </label>
              <input
                type="text"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Semester
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white"
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
                Mobile Number
              </label>
              <input
                type="tel"
                placeholder="+91 98765 00000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-university-maroon hover:bg-university-darkmaroon text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? "Registering..." : "Create Account"}</span>
            <ArrowRight className="w-4 h-4 text-university-gold" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-university-maroon hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
