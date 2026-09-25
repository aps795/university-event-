import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function getCategoryBadgeClass(category: string): string {
  switch (category) {
    case "Academic":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Technical":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "Cultural":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Sports":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Student Activities":
      return "bg-rose-100 text-rose-800 border-rose-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "PUBLISHED":
      return "bg-emerald-100 text-emerald-700 border-emerald-300";
    case "DRAFT":
      return "bg-slate-100 text-slate-700 border-slate-300";
    case "PENDING_APPROVAL":
      return "bg-amber-100 text-amber-700 border-amber-300";
    case "REGISTRATION_CLOSED":
      return "bg-orange-100 text-orange-700 border-orange-300";
    case "COMPLETED":
      return "bg-indigo-100 text-indigo-700 border-indigo-300";
    case "CANCELLED":
      return "bg-rose-100 text-rose-700 border-rose-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
}
