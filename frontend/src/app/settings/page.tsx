"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { User, Mail, Save, BadgeCheck } from "lucide-react";

// Use Environment Variable for Production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SettingsPage() {
  const [name, setName] = useState("Richa Maitry");
  const [email, setEmail] = useState("richa@example.com");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [origin, setOrigin] = useState("");

  // Get the live URL for the badge display
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call to your Render backend
    // Later, you can change this to: fetch(`${API_BASE_URL}/api/user/update`, { ... })
    setTimeout(() => {
      alert("Profile updated successfully!");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your public profile and account details.
            </p>
          </div>

          <div className="space-y-6">
            {/* Profile Section */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-medium">Profile</h2>
                <p className="text-xs text-slate-400">
                  This information will be visible to people booking you.
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} className="p-6 space-y-5">
                {/* Avatar Preview */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl font-bold border-2 border-white shadow-sm">
                    {name
                      ? name.split(" ").map((n) => n[0]).join("")
                      : "U"}
                  </div>
                  <button
                    type="button"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-md transition-colors"
                  >
                    Change Avatar
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                      <User size={14} /> Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                      <Mail size={14} /> Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Save size={16} />
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>

            {/* Account Status Badge */}
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-3">
              <BadgeCheck className="text-indigo-600" size={20} />
              <div className="text-sm">
                <span className="font-semibold text-indigo-900">
                  Account Verified.
                </span>
                <p className="text-indigo-700/70 text-xs">
                  Your public booking page is live at: <br />
                  <span className="font-mono text-[10px] break-all">
                    {origin}/richa-maitry
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}