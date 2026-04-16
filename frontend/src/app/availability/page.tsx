"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Clock,
  Calendar as CalendarIcon,
  Video,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { format, addDays, startOfToday, isSameDay } from "date-fns";

// Use Environment Variable for Production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// --- HELPER FUNCTIONS ---
const generateTimeSlots = (
  start: string,
  end: string,
  duration: number,
  buffer: number,
) => {
  const slots = [];
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);

  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const interval = duration + buffer;

  while (currentMinutes + duration <= endMinutes) {
    const h = Math.floor(currentMinutes / 60).toString().padStart(2, "0");
    const m = (currentMinutes % 60).toString().padStart(2, "0");
    slots.push(`${h}:${m}`);
    currentMinutes += interval;
  }
  return slots;
};

interface EventType {
  id: number;
  title: string;
  duration: number;
  buffer_time: number;
  slug: string;
}

interface Availability {
  day_of_week: string;
  is_active: boolean;
  start_time: string;
  end_time: string;
}

export default function PublicBookingPage() {
  const params = useParams();
  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [availabilityData, setAvailabilityData] = useState<Availability[]>([]);

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = startOfToday();
  const availableDays = Array.from({ length: 14 }).map((_, i) => addDays(today, i));

  const currentDaySettings = availabilityData.find(
    (d) => d.day_of_week === format(selectedDate, "EEEE"),
  );

  const allTimeSlots = currentDaySettings
    ? generateTimeSlots(
        currentDaySettings.start_time,
        currentDaySettings.end_time,
        event?.duration || 30,
        event?.buffer_time || 0,
      )
    : [];

  const availableTimeSlots = allTimeSlots.filter((time) => {
    if (!Array.isArray(bookedSlots)) return true;
    const [sH, sM] = time.split(":").map(Number);
    const formattedTime = `${sH.toString().padStart(2, "0")}:${sM.toString().padStart(2, "0")}`;
    const potentialStart = sH * 60 + sM;

    if (bookedSlots.includes(formattedTime)) return false;

    const duration = event?.duration || 15;
    const buffer = event?.buffer_time || 0;

    return !bookedSlots.some((bookedTime) => {
      if (!bookedTime) return false;
      const [bH, bM] = bookedTime.split(":").map(Number);
      const existingStart = bH * 60 + bM;
      const busyStart = existingStart - buffer;
      const busyEnd = existingStart + duration + buffer;
      return potentialStart >= busyStart && potentialStart < busyEnd;
    });
  });

  const isDayDisabled = (date: Date) => {
    const dayName = format(date, "EEEE");
    const daySettings = availabilityData.find((d) => d.day_of_week === dayName);
    if (daySettings) return daySettings.is_active === false;
    return true;
  };

  // --- REFACTORED EFFECTS WITH API_BASE_URL ---
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/availability`)
      .then((res) => res.json())
      .then((data) => setAvailabilityData(data))
      .catch((err) => console.error("Error fetching availability:", err));
  }, []);

  useEffect(() => {
    if (params.slug) {
      fetch(`${API_BASE_URL}/api/event-types/slug/${params.slug}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          setEvent(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [params.slug]);

  useEffect(() => {
    if (selectedDate) {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      fetch(`${API_BASE_URL}/api/booked-slots?date=${dateStr}`)
        .then((res) => res.json())
        .then((data) => setBookedSlots(Array.isArray(data) ? data : []))
        .catch(() => setBookedSlots([]));
    }
  }, [selectedDate]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    setIsSubmitting(true);
    try {
      const startDateString = format(selectedDate, "yyyy-MM-dd");
      const startDateTime = new Date(`${startDateString}T${selectedTime}:00`);
      const endDateTime = new Date(startDateTime.getTime() + event.duration * 60000);

      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type_id: event.id,
          guest_name: guestName,
          guest_email: guestEmail,
          start_time: format(startDateTime, "yyyy-MM-dd HH:mm:00"),
          end_time: format(endDateTime, "yyyy-MM-dd HH:mm:00"),
        }),
      });

      if (res.ok) setStep(3);
      else alert("Error booking event");
    } catch (err) {
      alert("Network Error: Backend may be sleeping.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  if (!event)
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Event not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-lg w-full max-w-4xl flex flex-col md:flex-row overflow-hidden min-h-[500px]">
        {/* Left Side: Event Details */}
        <div className="w-full md:w-1/3 bg-white p-8 border-r border-slate-100 flex flex-col">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="w-fit p-2 -ml-2 mb-4 hover:bg-slate-100 rounded-full text-slate-500"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="text-slate-500 font-medium mb-4 text-sm">Richa Maitry</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">{event.title}</h1>
          <div className="space-y-4 text-slate-600 font-medium text-sm flex-1">
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-slate-400" />
              <span>{event.duration} min</span>
              {event.buffer_time > 0 && (
                <span className="text-xs text-slate-400 font-normal">(+{event.buffer_time}m transition)</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Video size={18} className="text-slate-400" />
              Web conferencing details provided upon confirmation.
            </div>
            {selectedDate && selectedTime && (
              <div className="flex items-center gap-3 text-indigo-600 font-semibold bg-indigo-50 p-3 rounded-md mt-4">
                <CalendarIcon size={18} />
                {format(selectedDate, "EEEE, MMMM d")} at {selectedTime}
              </div>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-2/3 bg-white p-8">
          {step === 1 && (
            <div className="flex flex-col md:flex-row gap-8 h-full">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Select a Date & Time</h2>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 mb-2">
                  <div>SU</div><div>MO</div><div>TU</div><div>WE</div><div>TH</div><div>FR</div><div>SA</div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: today.getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="p-2"></div>
                  ))}
                  {availableDays.map((day, i) => {
                    const disabled = isDayDisabled(day);
                    return (
                      <button
                        key={i}
                        disabled={disabled}
                        onClick={() => {
                          setSelectedDate(day);
                          setSelectedTime(null);
                        }}
                        className={`p-2 rounded-full w-10 h-10 mx-auto flex items-center justify-center text-sm font-medium transition-all
                          ${disabled ? "text-slate-200 cursor-not-allowed opacity-50" : isSameDay(day, selectedDate) ? "bg-indigo-600 text-white shadow-md" : "text-slate-700 hover:bg-slate-100"}`}
                      >
                        {format(day, "d")}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="w-full md:w-48 flex flex-col h-[400px]">
                <h3 className="text-sm font-medium text-slate-900 mb-4 text-center">
                  {format(selectedDate, "EEEE, MMM d")}
                </h3>
                <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                  {availableTimeSlots.length === 0 ? (
                    <div className="text-center text-sm text-slate-500 py-4">No times available</div>
                  ) : (
                    availableTimeSlots.map((time, i) => (
                      <div key={i} className="flex gap-2">
                        <button
                          onClick={() => setSelectedTime(time)}
                          className={`flex-1 py-3 rounded-md text-sm font-medium transition-all border ${selectedTime === time ? "bg-slate-600 border-slate-600 text-white" : "border-slate-200 text-indigo-600 hover:border-indigo-600"}`}
                        >
                          {time}
                        </button>
                        {selectedTime === time && (
                          <button
                            onClick={() => setStep(2)}
                            className="bg-indigo-600 text-white px-4 rounded-md text-sm font-medium hover:bg-indigo-700"
                          >
                            Next
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="max-w-md mx-auto h-full flex flex-col justify-center">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Enter Details</h2>
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <input
                    required
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    required
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-900 bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 text-white py-3 rounded-md font-medium disabled:bg-indigo-400"
                >
                  {isSubmitting ? "Confirming..." : "Schedule Event"}
                </button>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="h-full w-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="flex items-center justify-center rounded-full bg-green-50 w-20 h-20">
                <CheckCircle2 size={48} className="text-green-600 animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">You are all set!</h2>
              <p className="text-slate-500 text-sm">Confirmation sent to <span className="font-semibold">{guestEmail}</span>.</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 text-indigo-600 text-sm font-semibold hover:underline"
              >
                <Plus size={16} /> Schedule another event
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}