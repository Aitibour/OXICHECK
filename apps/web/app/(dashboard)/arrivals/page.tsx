"use client";

import { useState } from "react";
import {
  CalendarCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  Send,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Users,
} from "lucide-react";

// Mock data for the arrivals board
const mockArrivals = [
  {
    id: "1",
    guestName: "Maria Santos",
    email: "maria@example.com",
    roomType: "Deluxe Double",
    roomNumber: "301",
    checkIn: "2026-04-05",
    checkOut: "2026-04-08",
    adults: 2,
    children: 0,
    checkinStatus: "completed" as const,
    confirmationCode: "BK-78234",
  },
  {
    id: "2",
    guestName: "James Mitchell",
    email: "james.m@example.com",
    roomType: "Superior Suite",
    roomNumber: "502",
    checkIn: "2026-04-05",
    checkOut: "2026-04-07",
    adults: 1,
    children: 0,
    checkinStatus: "in_progress" as const,
    confirmationCode: "BK-78235",
  },
  {
    id: "3",
    guestName: "Laura Rossi",
    email: "laura.r@example.com",
    roomType: "Standard Twin",
    roomNumber: "205",
    checkIn: "2026-04-05",
    checkOut: "2026-04-10",
    adults: 2,
    children: 1,
    checkinStatus: "pending" as const,
    confirmationCode: "BK-78236",
  },
  {
    id: "4",
    guestName: "Ahmed Hassan",
    email: "ahmed@example.com",
    roomType: "Deluxe King",
    roomNumber: "410",
    checkIn: "2026-04-05",
    checkOut: "2026-04-06",
    adults: 2,
    children: 0,
    checkinStatus: "pending" as const,
    confirmationCode: "BK-78237",
  },
  {
    id: "5",
    guestName: "Sophie Chen",
    email: "sophie.c@example.com",
    roomType: "Junior Suite",
    roomNumber: "601",
    checkIn: "2026-04-05",
    checkOut: "2026-04-09",
    adults: 1,
    children: 0,
    checkinStatus: "completed" as const,
    confirmationCode: "BK-78238",
  },
  {
    id: "6",
    guestName: "Thomas Weber",
    email: "t.weber@example.com",
    roomType: "Standard Double",
    roomNumber: "108",
    checkIn: "2026-04-05",
    checkOut: "2026-04-07",
    adults: 2,
    children: 2,
    checkinStatus: "not_sent" as const,
    confirmationCode: "BK-78239",
  },
];

type CheckinStatus = "completed" | "in_progress" | "pending" | "not_sent";

const statusConfig: Record<
  CheckinStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  completed: {
    label: "Completed",
    color: "text-green-700",
    bg: "bg-green-50",
    icon: CheckCircle,
  },
  in_progress: {
    label: "In Progress",
    color: "text-blue-700",
    bg: "bg-blue-50",
    icon: Loader2,
  },
  pending: {
    label: "Link Sent",
    color: "text-amber-700",
    bg: "bg-amber-50",
    icon: Clock,
  },
  not_sent: {
    label: "Not Sent",
    color: "text-gray-500",
    bg: "bg-gray-50",
    icon: AlertCircle,
  },
};

export default function ArrivalsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CheckinStatus | "all">("all");

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const filtered = mockArrivals.filter((a) => {
    const matchesSearch =
      !search ||
      a.guestName.toLowerCase().includes(search.toLowerCase()) ||
      a.confirmationCode.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || a.checkinStatus === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: mockArrivals.length,
    completed: mockArrivals.filter((a) => a.checkinStatus === "completed").length,
    inProgress: mockArrivals.filter((a) => a.checkinStatus === "in_progress").length,
    pending: mockArrivals.filter(
      (a) => a.checkinStatus === "pending" || a.checkinStatus === "not_sent"
    ).length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">
            Today&apos;s Arrivals
          </h1>
          <p className="text-sm text-muted">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium px-3">Today</span>
          <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <StatCard
          label="Total Arrivals"
          value={stats.total}
          icon={Users}
          color="text-secondary"
          bg="bg-gray-50"
        />
        <StatCard
          label="Checked In"
          value={stats.completed}
          icon={CheckCircle}
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon={Loader2}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={Clock}
          color="text-amber-600"
          bg="bg-amber-50"
        />
      </div>

      {/* Search & Filter */}
      <div className="mt-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search by guest name or confirmation code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 pl-9 pr-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
        <div className="flex gap-1 rounded-lg border border-gray-200 p-1">
          {(["all", "completed", "in_progress", "pending", "not_sent"] as const).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f
                    ? "bg-primary text-white"
                    : "text-muted hover:bg-gray-50"
                }`}
              >
                {f === "all"
                  ? "All"
                  : f === "not_sent"
                    ? "Not Sent"
                    : f
                        .split("_")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")}
              </button>
            )
          )}
        </div>
      </div>

      {/* Arrivals Table */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left font-medium text-muted px-4 py-3">
                Guest
              </th>
              <th className="text-left font-medium text-muted px-4 py-3">
                Room
              </th>
              <th className="text-left font-medium text-muted px-4 py-3">
                Stay
              </th>
              <th className="text-left font-medium text-muted px-4 py-3">
                Guests
              </th>
              <th className="text-left font-medium text-muted px-4 py-3">
                Check-In Status
              </th>
              <th className="text-right font-medium text-muted px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((arrival) => {
              const status = statusConfig[arrival.checkinStatus];
              const StatusIcon = status.icon;
              return (
                <tr
                  key={arrival.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-secondary">
                        {arrival.guestName}
                      </p>
                      <p className="text-xs text-muted">
                        {arrival.confirmationCode}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-secondary">
                        #{arrival.roomNumber}
                      </p>
                      <p className="text-xs text-muted">{arrival.roomType}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-muted">
                      {new Date(arrival.checkIn).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      &mdash;{" "}
                      {new Date(arrival.checkOut).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-muted">
                      {arrival.adults}A{" "}
                      {arrival.children > 0 ? `${arrival.children}C` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.bg} ${status.color}`}
                    >
                      <StatusIcon size={12} />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {(arrival.checkinStatus === "not_sent" ||
                        arrival.checkinStatus === "pending") && (
                        <button
                          className="p-1.5 rounded-md text-muted hover:text-primary hover:bg-primary/5 transition-colors"
                          title="Send check-in link"
                        >
                          <Send size={14} />
                        </button>
                      )}
                      <button
                        className="p-1.5 rounded-md text-muted hover:text-secondary hover:bg-gray-100 transition-colors"
                        title="View details"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <CalendarCheck size={32} className="mx-auto text-muted/40" />
            <p className="mt-2 text-sm text-muted">
              No arrivals match your search
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{label}</span>
        <div className={`p-1.5 rounded-lg ${bg}`}>
          <Icon size={14} className={color} />
        </div>
      </div>
      <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
