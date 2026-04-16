import { Link as LinkIcon, Calendar, Clock, Settings } from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
  return (
    /* 1. Change: Remove h-screen and w-64. Use w-full for mobile. 
       Remove 'hidden' so it shows up on all screens. */
    <aside className="w-full md:w-64 md:h-screen bg-white border-b md:border-r border-slate-200 flex flex-col">
      {/* App Logo - Hidden on tiny mobile screens to save space */}
      <div className="h-16 hidden sm:flex items-center px-6 border-b border-slate-200">
        <div className="font-bold text-lg tracking-tight flex items-center gap-2">
          <div className="w-6 h-6 bg-slate-900 rounded-md flex items-center justify-center">
            <span className="text-white text-xs">C</span>
          </div>
          <span className="hidden md:block">Cal.com Clone</span>
        </div>
      </div>

      {/* Navigation Links: Horizontal row on mobile, Vertical column on desktop */}
      <nav className="flex flex-row md:flex-col p-2 gap-1 md:gap-2 overflow-x-auto">
        <Link
          href="/event-types"
          className="flex items-center gap-3 px-3 py-2 bg-indigo-50 text-indigo-700 md:text-slate-900 rounded-md font-medium text-sm transition-colors whitespace-nowrap"
        >
          <LinkIcon size={18} />
          <span className="hidden sm:inline md:block">Event Types</span>
        </Link>

        <Link
          href="/bookings"
          className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-md font-medium text-sm transition-colors whitespace-nowrap"
        >
          <Calendar size={18} />
          <span className="hidden sm:inline md:block">Bookings</span>
        </Link>

        <Link
          href="/availability"
          className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-md font-medium text-sm transition-colors whitespace-nowrap"
        >
          <Clock size={18} />
          <span className="hidden sm:inline md:block">Availability</span>
        </Link>

        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-md font-medium text-sm transition-colors whitespace-nowrap"
        >
          <Settings size={18} />
          <span className="hidden sm:inline md:block">Settings</span>
        </Link>
      </nav>

      {/* User Profile - Moves to the right on mobile, stays bottom on desktop */}
      <div className="mt-auto hidden md:block p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
            RM
          </div>
          <div className="text-sm font-medium text-slate-900">Richa Maitry</div>
        </div>
      </div>
    </aside>
  );
}
