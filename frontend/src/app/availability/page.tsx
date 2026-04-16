"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Save, Globe } from "lucide-react";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface Availability {
  day_of_week: string;
  is_active: boolean;
  start_time: string;
  end_time: string;
}

export default function Availability() {
  const [schedule, setSchedule] = useState(
    DAYS.map((day, index) => ({
      day_of_week: day,
      is_active: index >= 1 && index <= 5,
      start_time: "09:00",
      end_time: "17:00",
    })),
  );
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/availability")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          if (data[0].timezone) {
            setTimezone(data[0].timezone);
          }
          const syncedData = DAYS.map((dayName) => {
            const dbEntry = data.find(
              (d:any) => d.day_of_week === dayName,
            );
            if (dbEntry) {
              return {
                day_of_week: dayName,
                is_active: dbEntry.is_active,
                start_time: dbEntry.start_time
                  ? dbEntry.start_time.slice(0, 5)
                  : "09:00",
                end_time: dbEntry.end_time
                  ? dbEntry.end_time.slice(0, 5)
                  : "17:00",
              };
            }
            return {
              day_of_week: dayName,
              is_active: false,
              start_time: "09:00",
              end_time: "17:00",
            };
          });
          setSchedule(syncedData);
        }
      })
      .catch((err) => console.error("Refresh sync failed:", err));
  }, []);

  const handleToggle = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index].is_active = !newSchedule[index].is_active;
    setSchedule(newSchedule);
  };

  const handleTimeChange = (
    index: number,
    field: "start_time" | "end_time",
    value: string,
  ) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:5000/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule, timezone }),
      });
      if (response.ok) {
        alert("Availability updated successfully!");
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.message || "Failed to save"}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Check if your backend terminal is running!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Availability
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Configure your weekly working hours.
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              <Save size={16} />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>

          <div className="mb-6 p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                <Globe size={20} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Schedule Timezone
                </h2>
                <p className="text-xs text-slate-500">
                  Global bookings will align with this zone.
                </p>
              </div>
            </div>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-sm rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="Asia/Kolkata">India (IST)</option>
              <option value="UTC">Universal (UTC)</option>
              <option value="America/New_York">New York (EST)</option>
              <option value="Europe/London">London (GMT)</option>
            </select>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {schedule.map((day, index) => (
              <div
                key={day.day_of_week}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors gap-4"
              >
                <div className="flex items-center gap-4 w-full sm:w-40">
                  <button
                    onClick={() => handleToggle(index)}
                    className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${day.is_active ? "bg-indigo-600" : "bg-slate-200"}`}
                  >
                    <span
                      className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all shadow-sm ${day.is_active ? "left-5" : "left-1"}`}
                    />
                  </button>
                  <span
                    className={`text-sm font-medium ${day.is_active ? "text-slate-900" : "text-slate-400"}`}
                  >
                    {day.day_of_week}
                  </span>
                </div>

                {day.is_active ? (
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-start">
                    <input
                      type="time"
                      value={day.start_time}
                      onChange={(e) =>
                        handleTimeChange(index, "start_time", e.target.value)
                      }
                      className="flex-1 sm:flex-none px-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <span className="text-slate-400 text-sm">-</span>
                    <input
                      type="time"
                      value={day.end_time}
                      onChange={(e) =>
                        handleTimeChange(index, "end_time", e.target.value)
                      }
                      className="flex-1 sm:flex-none px-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 italic">
                    Unavailable
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
