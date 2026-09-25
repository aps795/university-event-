"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, X, ArrowRight } from "lucide-react";
import { EventItem } from "@/lib/types";
import { formatDate, getCategoryBadgeClass } from "@/lib/utils";

interface EventCalendarProps {
  events: EventItem[];
}

export function EventCalendar({ events }: EventCalendarProps) {
  // Calendar month state (default to October/November 2026 or current active events)
  const [currentDate, setCurrentDate] = useState(() => {
    // If events exist, default to month of first event, otherwise current date
    if (events.length > 0 && events[0].eventDate) {
      const parts = events[0].eventDate.split("-");
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
    }
    return new Date();
  });

  const [selectedDayEvents, setSelectedDayEvents] = useState<EventItem[] | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Days in month
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDayIndex }, (_, i) => i);

  // Group events by YYYY-MM-DD
  const eventsByDate: Record<string, EventItem[]> = {};
  for (const ev of events) {
    if (ev.eventDate) {
      if (!eventsByDate[ev.eventDate]) {
        eventsByDate[ev.eventDate] = [];
      }
      eventsByDate[ev.eventDate].push(ev);
    }
  }

  const handleDayClick = (dayNumber: number) => {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(dayNumber).padStart(2, "0");
    const dateKey = `${year}-${formattedMonth}-${formattedDay}`;

    const matched = eventsByDate[dateKey] || [];
    setSelectedDateStr(dateKey);
    setSelectedDayEvents(matched);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Academic":
        return "bg-blue-600 text-white";
      case "Technical":
        return "bg-purple-600 text-white";
      case "Cultural":
        return "bg-amber-600 text-white";
      case "Sports":
        return "bg-emerald-600 text-white";
      case "Student Activities":
        return "bg-rose-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-8">
      {/* Calendar Header with Month Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-university-maroon/10 text-university-maroon flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-black text-gray-900">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-gray-500">Dr. Harisingh Gour Vishwavidyalaya Event Calendar</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Category Legend */}
          <div className="hidden lg:flex items-center gap-3 text-[11px] font-semibold text-gray-600 mr-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Academic
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Technical
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600" /> Cultural
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Sports
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> Activities
            </span>
          </div>

          <button
            onClick={prevMonth}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 transition"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 transition"
            aria-label="Next Month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider py-4">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {blankDays.map((_, index) => (
          <div key={`blank-${index}`} className="h-20 sm:h-28 rounded-xl bg-gray-50/50 border border-transparent" />
        ))}

        {daysArray.map((day) => {
          const formattedMonth = String(month + 1).padStart(2, "0");
          const formattedDay = String(day).padStart(2, "0");
          const dateKey = `${year}-${formattedMonth}-${formattedDay}`;
          const dayEvents = eventsByDate[dateKey] || [];
          const hasEvents = dayEvents.length > 0;

          return (
            <div
              key={`day-${day}`}
              onClick={() => handleDayClick(day)}
              className={`h-20 sm:h-28 rounded-xl p-1.5 sm:p-2 border transition cursor-pointer flex flex-col justify-between ${
                hasEvents
                  ? "bg-amber-50/40 border-amber-200 hover:border-university-maroon hover:shadow-md"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${hasEvents ? "text-university-maroon" : "text-gray-700"}`}>
                  {day}
                </span>
                {hasEvents && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-university-maroon text-white">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              {/* Event Pills */}
              <div className="space-y-1 overflow-hidden">
                {dayEvents.slice(0, 2).map((ev) => (
                  <div
                    key={ev.id}
                    className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded truncate shadow-xs ${getCategoryColor(
                      ev.category
                    )}`}
                    title={ev.title}
                  >
                    {ev.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <span className="text-[9px] text-gray-500 font-bold block truncate">
                    +{dayEvents.length - 2} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Modal / Details Drawer */}
      {selectedDayEvents && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold text-university-gold uppercase tracking-wider">
                  Events on
                </span>
                <h3 className="text-lg font-serif font-black text-gray-900">
                  {formatDate(selectedDateStr || "")}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 max-h-96 overflow-y-auto">
              {selectedDayEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No university events scheduled on this date.
                </div>
              ) : (
                selectedDayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 rounded-2xl border border-gray-200 hover:border-university-maroon bg-slate-50 transition"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(ev.category)}`}>
                        {ev.category}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        {ev.startTime} – {ev.endTime}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 leading-snug">{ev.title}</h4>

                    <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-600">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{ev.venue}</span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-200 flex justify-end">
                      <Link
                        href={`/events/${ev.id}`}
                        className="text-xs font-bold text-university-maroon hover:underline flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
