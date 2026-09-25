"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserSession } from "@/lib/types";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchDemoRole: (role: "student" | "organizer" | "admin") => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Login failed" };
      }
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "An unexpected error occurred" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/me", { method: "POST" });
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  const switchDemoRole = async (role: "student" | "organizer" | "admin") => {
    const creds = {
      student: { email: "student@dhsgsu.edu.in", password: "Student@123" },
      organizer: { email: "organizer@dhsgsu.edu.in", password: "Organizer@123" },
      admin: { email: "admin@dhsgsu.edu.in", password: "Admin@123" },
    }[role];

    const result = await login(creds.email, creds.password);
    if (result.success) {
      if (role === "student") router.push("/my-events");
      else if (role === "organizer") router.push("/organizer");
      else if (role === "admin") router.push("/admin");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, switchDemoRole, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
