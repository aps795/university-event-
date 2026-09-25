"use client";

import React from "react";
import { Search, Filter, Calendar as CalendarIcon, SlidersHorizontal, X } from "lucide-react";
import { DepartmentItem } from "@/lib/types";

interface EventFilterProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedTimeframe: string;
  onTimeframeChange: (tf: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (deptId: string) => void;
  departments: DepartmentItem[];
  selectedSort: string;
  onSortChange: (sort: string) => void;
  onReset: () => void;
}

const CATEGORIES = [
  "All",
  "Academic",
  "Technical",
  "Cultural",
  "Sports",
  "Student Activities",
];

const TIMEFRAMES = [
  { id: "all", label: "All Events" },
  { id: "upcoming", label: "Upcoming" },
  { id: "today", label: "Today" },
  { id: "past", label: "Past Events" },
];

export function EventFilter({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedTimeframe,
  onTimeframeChange,
  selectedDepartment,
  onDepartmentChange,
  departments,
  selectedSort,
  onSortChange,
  onReset,
}: EventFilterProps) {
  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "All" ||
    selectedTimeframe !== "all" ||
    selectedDepartment !== "All" ||
    selectedSort !== "date";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-8 space-y-5">
      {/* Top Search & Sort Row */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by event title, guest speaker, venue or keywords..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-university-maroon/20 focus:border-university-maroon transition placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Department Filter */}
        <div className="w-full md:w-64">
          <select
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-university-maroon/20 focus:border-university-maroon text-gray-700"
          >
            <option value="All">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name.replace("Department of ", "")}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Select */}
        <div className="w-full md:w-48">
          <select
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-university-maroon/20 focus:border-university-maroon text-gray-700"
          >
            <option value="date">Date: Soonest First</option>
            <option value="popularity">Most Popular / Registered</option>
            <option value="deadline">Registration Deadline</option>
            <option value="newest">Recently Published</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="py-2 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition border border-rose-200 self-center"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Category Pills Row */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          Category:
        </span>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                isSelected
                  ? "bg-university-maroon text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Timeframe Tabs */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1 flex items-center gap-1">
          <CalendarIcon className="w-3.5 h-3.5" />
          Timeline:
        </span>
        {TIMEFRAMES.map((tf) => {
          const isSelected = selectedTimeframe === tf.id;
          return (
            <button
              key={tf.id}
              onClick={() => onTimeframeChange(tf.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                isSelected
                  ? "bg-university-navy text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tf.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
