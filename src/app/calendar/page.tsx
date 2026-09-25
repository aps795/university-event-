"use client";

import React, { useState, useEffect } from "react";
import { EventItem } from "@/lib/types";
import { EventCalendar } from "@/components/events/EventCalendar";
import { Calendar as CalendarIcon, Clock, Sparkles } from "lucide-react";

export default function CalendarPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch("/api/events?limit=100");
        const data = await res.json();
        setEvents(data.events || []);
      } catch (e) {
        console.error("Failed to load events for calendar:", e);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-2 text-university-maroon font-bold text-xs uppercase tracking-widest">
          <CalendarIcon className="w-4 h-4" />
          <span>University Schedule</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-gray-900 mt-1">
          DHSGSU Event Calendar
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Interactive monthly view of academic seminars, workshops, cultural fests, competitions and university sports.
        </p>
      </div>

      {loading ? (
        <div className="h-96 bg-gray-200 rounded-3xl animate-pulse" />
      ) : (
        <EventCalendar events={events} />
      )}
    </div>
  );
}
