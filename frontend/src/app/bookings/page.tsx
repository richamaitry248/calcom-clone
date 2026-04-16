"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Calendar, Clock, Video, User } from "lucide-react";
import { format } from "date-fns";

// Use Environment Variable for Production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Booking {
  id: number;
  event_title: string;
  start_time: string;
  end_time: string;
  guest_name: string;
  guest_email: string;
  status: string;
}

export default function BookingsDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled">(
    "upcoming",
  );

  const now = new Date();

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.start_time) > now && b.status === "confirmed",
  );

  const pastBookings = bookings.filter(
    (b) => new Date(b.start_time) <= now && b.status !== "cancelled",
  );

  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");

  // --- DELETE/CANCEL: Updated with API_BASE_URL ---
  const handleCancel = async (id: number) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === id ? { ...booking, status: "cancelled" } : booking,
          ),
        );
        alert("Booking cancelled.");
      } else {
        alert("Failed to cancel the booking.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Network error: Backend might be down or sleeping.");
    }
  };

  // --- READ: Updated with API_BASE_URL and Backticks ---
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/bookings`)
      .then((res) => res.json())
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
        setBookings([]);
        setLoading(false);
      });
  }, []);

  const currentList =
    activeTab === "upcoming"
      ? upcomingBookings
      : activeTab === "past"
        ? pastBookings
        : cancelledBookings;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your schedule and past meetings.
            </p>
          </div>

          {/* TAB NAVIGATION */}
          <div className="flex gap-6 border-b border-slate-200 mb-6 overflow-x-auto whitespace-nowrap">
            {(["upcoming", "past", "cancelled"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium capitalize transition-all ${
                  activeTab === tab
                    ? "border-b-2 border-indigo-600 text-indigo-600"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500">
              Loading your schedule...
            </div>
          ) : currentList.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
              <p className="text-slate-500">No {activeTab} bookings found.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              {currentList.map((booking, index) => {
                const startTime = new Date(booking.start_time);

                return (
                  <div
                    key={booking.id}
                    className={`p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 transition-colors ${
                      index !== currentList.length - 1
                        ? "border-b border-slate-100"
                        : ""
                    } ${activeTab !== "upcoming" ? "opacity-70" : ""}`}
                  >
                    <div className="flex gap-4 md:gap-6">
                      <div className="flex flex-col items-center justify-center bg-indigo-50 text-indigo-700 rounded-lg p-2 md:p-3 min-w-[60px] md:min-w-[80px]">
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">
                          {format(startTime, "MMM")}
                        </span>
                        <span className="text-lg md:text-2xl font-black">
                          {format(startTime, "d")}
                        </span>
                      </div>

                      <div>
                        <h3
                          className={`text-base md:text-lg font-semibold ${activeTab === "cancelled" ? "line-through text-slate-400" : "text-slate-900"}`}
                        >
                          {booking.event_title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-slate-500 mt-2 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} /> {format(startTime, "h:mm a")}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Video size={14} /> Video
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <User size={16} className="text-slate-400" />{" "}
                        {booking.guest_name}
                      </div>
                      <a
                        href={`mailto:${booking.guest_email}`}
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        {booking.guest_email}
                      </a>

                      {activeTab === "upcoming" && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="mt-3 w-full md:w-auto text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-2 md:py-1.5 rounded-md transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}