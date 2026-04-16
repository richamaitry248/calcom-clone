"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Clock, Plus, MoreHorizontal, Copy } from "lucide-react";

// 1. Declare the API Base URL (Critical for deployment)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove symbols
    .replace(/[\s_-]+/g, "-") // Replace spaces with hyphens
    .replace(/^-+|-+$/g, ""); // Clean edges
};

export default function HomePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [bufferTime, setBufferTime] = useState(0);

  // 1. READ: Fetch existing events on load
  useEffect(() => {
    // Fixed with backticks for variable template
    fetch(`${API_BASE_URL}/api/event-types`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEvents(data);
        } else {
          console.error("Backend sent an error instead of an array:", data);
          setEvents([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching events:", err);
        setEvents([]);
        setLoading(false);
      });
  }, []);

  // 2. CREATE / UPDATE: Save the event
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${API_BASE_URL}/api/event-types/${editingId}`
      : `${API_BASE_URL}/api/event-types`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description,
          duration,
          buffer_time: bufferTime,
        }),
      });

      if (res.ok) {
        const savedEvent = await res.json();
        if (editingId) {
          setEvents(
            events.map((ev) => (ev.id === editingId ? savedEvent : ev)),
          );
        } else {
          setEvents([savedEvent, ...events]);
        }
        setIsModalOpen(false);
        setEditingId(null);
      } else {
        alert("Failed to save event. Make sure the URL slug is unique!");
      }
    } catch (err) {
      console.error(err);
      alert("Network Error: Is the backend server waking up?");
    }
  };

  // 3. DELETE: Remove an event
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/event-types/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEvents(events.filter((ev) => ev.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const openCreateModal = () => {
    setTitle("");
    setSlug("");
    setDescription("");
    setDuration(30);
    setEditingId(null);
    setBufferTime(0);
    setIsModalOpen(true);
  };

  const openEditModal = (event: any) => {
    setTitle(event.title);
    setSlug(event.slug);
    setDescription(event.description || "");
    setDuration(event.duration);
    setEditingId(event.id);
    setBufferTime(event.buffer_time || 0);
    setIsModalOpen(true);
  };

  const copyLink = (slug: string) => {
    // Dynamic origin detection for live links
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
    alert("Link copied to clipboard!");
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header Area */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Event Types
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Create events to share for people to book on your calendar.
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
            >
              <Plus size={16} />
              New Event Type
            </button>
          </div>

          {/* Event Cards Grid */}
          {loading ? (
            <div className="text-slate-500 flex justify-center py-12">
              Loading your events...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative group"
                >
                  <div className="absolute top-4 right-4">
                    <button className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                    <div className="absolute right-0 top-8 bg-white border border-slate-200 shadow-lg rounded-md w-32 py-1 hidden group-hover:block z-10">
                      <button
                        onClick={() => openEditModal(event)}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <h2 className="text-lg font-semibold mb-1 pr-8">
                    {event.title}
                  </h2>
                  <p className="text-sm text-slate-500 mb-6 min-h-[40px] leading-relaxed">
                    {event.description}
                  </p>

                  <div className="flex items-center gap-4 text-slate-600 text-sm font-medium mb-6">
                    <div className="flex items-center gap-1">
                      <Clock size={16} className="text-slate-400" />
                      {event.duration}m
                    </div>
                    {event.buffer_time > 0 && (
                      <div className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] border border-indigo-100 font-bold">
                        +{event.buffer_time}m buffer
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
                    <a
                      href={`/${event.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:underline truncate mr-4"
                    >
                      /{event.slug}
                    </a>
                    <button
                      onClick={() => copyLink(event.slug)}
                      className="flex-shrink-0 flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      <Copy size={14} /> Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Responsive Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold">
                {editingId ? "Edit Event Type" : "Add a new event type"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Title
                </label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setTitle(newTitle);
                    if (!editingId) setSlug(generateSlug(newTitle));
                  }}
                  placeholder="e.g. 15 Min Discovery Call"
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  URL Slug
                </label>
                <div className="flex items-center border border-slate-200 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                  <span className="bg-slate-50 px-3 py-2 text-slate-500 text-sm border-r border-slate-200">
                    cal.com/
                  </span>
                  <input
                    required
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this meeting about?"
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Duration (m)
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={duration === 0 ? "" : duration}
                    onChange={(e) =>
                      setDuration(
                        e.target.value === "" ? 0 : Number(e.target.value),
                      )
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Buffer (m)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bufferTime === 0 ? "" : bufferTime}
                    onChange={(e) =>
                      setBufferTime(
                        e.target.value === "" ? 0 : Number(e.target.value),
                      )
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm order-1 sm:order-2"
                >
                  {editingId ? "Save Changes" : "Save & Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}