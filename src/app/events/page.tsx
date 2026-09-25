"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { EventItem, DepartmentItem } from "@/lib/types";
import { EventCard } from "@/components/events/EventCard";
import { EventFilter } from "@/components/events/EventFilter";
import { EventRegistrationModal } from "@/components/events/EventRegistrationModal";
import { Compass, AlertCircle } from "lucide-react";

function EventsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";

  const [events, setEvents] = useState<EventItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedSort, setSelectedSort] = useState("date");

  // Registration modal
  const [modalEvent, setModalEvent] = useState<EventItem | null>(null);

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await fetch("/api/departments");
        const data = await res.json();
        setDepartments(data.departments || []);
      } catch (e) {
        console.error("Failed to load departments:", e);
      }
    }
    fetchDepartments();
  }, []);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append("query", searchQuery);
        if (selectedCategory && selectedCategory !== "All") params.append("category", selectedCategory);
        if (selectedDepartment && selectedDepartment !== "All") params.append("departmentId", selectedDepartment);
        if (selectedTimeframe && selectedTimeframe !== "all") params.append("timeframe", selectedTimeframe);
        if (selectedSort) params.append("sort", selectedSort);

        const res = await fetch(`/api/events?${params.toString()}`);
        const data = await res.json();
        setEvents(data.events || []);
      } catch (e) {
        console.error("Failed to load events:", e);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchEvents();
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedTimeframe, selectedDepartment, selectedSort]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedTimeframe("all");
    setSelectedDepartment("All");
    setSelectedSort("date");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-university-maroon font-bold text-xs uppercase tracking-widest">
            <Compass className="w-4 h-4" />
            <span>Discover University Events</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-gray-900 mt-1">
            DHSGSU Campus Events
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse, search and register for seminars, workshops, cultural festivals and competitions.
          </p>
        </div>

        <div className="text-xs text-gray-500 font-semibold bg-white py-2 px-4 rounded-xl border border-gray-200 shadow-xs">
          Showing <span className="text-university-maroon font-black">{events.length}</span> events
        </div>
      </div>

      {/* Filter Component */}
      <EventFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        departments={departments}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
        onReset={handleResetFilters}
      />

      {/* Event Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-gray-200 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No events found</h3>
          <p className="text-xs text-gray-500">
            No events match your current search and filter criteria. Try resetting filters to see all campus activities.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-university-maroon text-white text-xs font-bold rounded-xl shadow-xs hover:bg-university-darkmaroon transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onRegisterClick={(ev) => setModalEvent(ev)}
            />
          ))}
        </div>
      )}

      {/* Registration Modal */}
      {modalEvent && (
        <EventRegistrationModal
          event={modalEvent}
          isOpen={!!modalEvent}
          onClose={() => setModalEvent(null)}
          onSuccess={() => {
            // refresh event list count
          }}
        />
      )}
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="h-12 bg-gray-200 rounded-xl w-64 animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 bg-gray-200 rounded-3xl animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <EventsContent />
    </Suspense>
  );
}
