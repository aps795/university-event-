"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Sparkles, User, Layers } from "lucide-react";

export default function LoginPage() {
  const { login, switchDemoRole } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await login(email, password);
    if (result.success) {
      router.push("/my-events");
      router.refresh();
    } else {
      setError(result.error || "Invalid university email or password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-xl">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-university-maroon text-university-gold font-serif text-3xl font-black mx-auto flex items-center justify-center shadow-md border-2 border-university-gold">
            <span>ध</span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-university-maroon block">
            Dr. Harisingh Gour Vishwavidyalaya
          </span>
          <h2 className="text-2xl font-serif font-black text-gray-900">
            Sign in to DHSGSU EventHub
          </h2>
          <p className="text-xs text-gray-500">
            Enter your university credentials or use quick demo profiles below
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              University Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="e.g. student@dhsgsu.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-university-maroon/20 focus:border-university-maroon"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-university-maroon/20 focus:border-university-maroon"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-university-maroon hover:bg-university-darkmaroon text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? "Verifying..." : "Sign In"}</span>
            <ArrowRight className="w-4 h-4 text-university-gold" />
          </button>
        </form>

        {/* 1-Click Demo Profiles */}
        <div className="pt-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center gap-1.5 justify-center text-xs font-bold text-gray-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-university-gold" />
            <span>1-Click Quick Demo Switcher</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => switchDemoRole("student")}
              className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 transition text-center"
            >
              <User className="w-4 h-4 text-blue-700 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-blue-800 block">Student</span>
              <span className="text-[9px] text-blue-600 block">Aditya Verma</span>
            </button>

            <button
              type="button"
              onClick={() => switchDemoRole("organizer")}
              className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 hover:bg-purple-100 transition text-center"
            >
              <Layers className="w-4 h-4 text-purple-700 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-purple-800 block">Organizer</span>
              <span className="text-[9px] text-purple-600 block">Dr. R.K. Sahu</span>
            </button>

            <button
              type="button"
              onClick={() => switchDemoRole("admin")}
              className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 transition text-center"
            >
              <Shield className="w-4 h-4 text-rose-700 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-rose-800 block">Admin (DSW)</span>
              <span className="text-[9px] text-rose-600 block">Prof. Sharma</span>
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center pt-2 text-xs text-gray-600">
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="font-bold text-university-maroon hover:underline">
            Register Student Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
