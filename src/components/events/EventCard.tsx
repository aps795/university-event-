"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, MapPin, Users, ArrowRight, ShieldAlert, Award } from "lucide-react";
import { EventItem } from "@/lib/types";
import { formatDate, getCategoryBadgeClass, getStatusBadgeClass } from "@/lib/utils";

interface EventCardProps {
  event: EventItem;
  onRegisterClick?: (event: EventItem) => void;
}

export function EventCard({ event, onRegisterClick }: EventCardProps) {
  const registeredCount = event._count?.registrations || 0;
  const seatsLeft = Math.max(0, event.maxParticipants - registeredCount);
  const percentFilled = Math.min(100, Math.round((registeredCount / event.maxParticipants) * 100));

  const isRegistrationOpen =
    event.status === "PUBLISHED" &&
    !event.isPast &&
    seatsLeft > 0 &&
    new Date(event.registrationDeadline + "T23:59:59") >= new Date();

  return (
    <div className="group bg-white rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Poster Image Container */}
      <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
        {event.posterUrl ? (
          <img
            src={event.posterUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-university-maroon to-university-navy flex items-center justify-center text-university-gold font-serif text-3xl font-black">
            DHSGSU
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Badges on Top */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm backdrop-blur-md ${getCategoryBadgeClass(
              event.category
            )}`}
          >
            {event.category}
          </span>

          {event.isPast ? (
            <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600/90 text-white uppercase tracking-wider shadow-md">
              Past Event
            </span>
          ) : (
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md bg-white/90 ${getStatusBadgeClass(
                event.status
              )}`}
            >
              {isRegistrationOpen ? "Registration Open" : event.status.replace("_", " ")}
            </span>
          )}
        </div>

        {/* SubCategory if present */}
        {event.subCategory && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-black/60 text-white backdrop-blur-md">
              {event.subCategory}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-university-maroon transition line-clamp-2 leading-snug">
            {event.title}
          </h3>

          <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Key Details Grid */}
          <div className="mt-4 space-y-2 text-xs text-gray-700">
            <div className="flex items-center gap-2 text-university-maroon font-medium">
              <Calendar className="w-4 h-4 shrink-0 text-university-maroon" />
              <span>{formatDate(event.eventDate)}</span>
              <span className="text-gray-300">•</span>
              <Clock className="w-3.5 h-3.5 shrink-0 text-gray-500" />
              <span className="text-gray-600">{event.startTime} – {event.endTime}</span>
            </div>

            <div className="flex items-start gap-2 text-gray-600">
              <MapPin className="w-4 h-4 shrink-0 text-gray-400 mt-0.5" />
              <span className="truncate">{event.venue}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-500 text-[11px]">
              <span className="font-semibold text-gray-700">Organizer:</span>
              <span className="truncate">{event.department?.name || event.organizer?.name || "DHSGSU"}</span>
            </div>
          </div>
        </div>

        {/* Capacity / Seats Status */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1 text-gray-600 font-medium">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              <span>
                {event.isPast ? `${registeredCount} Attended` : `${seatsLeft} Seats Left`}
              </span>
            </span>
            <span className="text-gray-400 font-semibold">{registeredCount} / {event.maxParticipants}</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentFilled >= 90
                  ? "bg-rose-500"
                  : percentFilled >= 60
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${percentFilled}%` }}
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex items-center gap-2">
            <Link
              href={`/events/${event.id}`}
              className="flex-1 py-2.5 px-3 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:text-university-maroon hover:border-university-maroon text-center transition flex items-center justify-center gap-1.5"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {isRegistrationOpen && onRegisterClick && (
              <button
                onClick={() => onRegisterClick(event)}
                className="py-2.5 px-4 rounded-xl bg-university-maroon hover:bg-university-darkmaroon text-white text-xs font-bold shadow-sm transition"
              >
                Register Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
