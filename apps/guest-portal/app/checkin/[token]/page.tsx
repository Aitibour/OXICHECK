"use client";

import { useState, useEffect, use } from "react";
import { CheckinWizard } from "./components/checkin-wizard";
import { Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface HotelInfo {
  name: string;
  logoUrl?: string;
  branding?: Record<string, string>;
  city?: string;
  country?: string;
}

interface ReservationInfo {
  checkInDate: string;
  checkOutDate: string;
  roomType?: string;
  adultsCount: number;
  childrenCount: number;
}

interface GuestInfo {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  nationality?: string;
  dateOfBirth?: string;
}

export interface CheckinData {
  status: string;
  hotel: HotelInfo;
  reservation: ReservationInfo;
  guest: GuestInfo | null;
  formData: Record<string, string> | null;
  preferences: Record<string, unknown> | null;
  message?: string;
}

export default function CheckinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [data, setData] = useState<CheckinData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch(`${API_URL}/api/checkin/${token}`);
        const json = await res.json();

        if (!res.ok) {
          setError(json.error || "Failed to load check-in session");
          return;
        }

        setData(json);
      } catch {
        setError("Unable to connect. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted">Loading your check-in...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="mx-auto h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
            <span className="text-2xl">!</span>
          </div>
          <h1 className="mt-4 text-lg font-semibold text-secondary">
            Check-in Unavailable
          </h1>
          <p className="mt-2 text-sm text-muted">{error}</p>
        </div>
      </div>
    );
  }

  if (data?.status === "completed") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-50 flex items-center justify-center">
            <span className="text-2xl text-success">&#10003;</span>
          </div>
          <h1 className="mt-4 text-lg font-semibold text-secondary">
            Already Checked In
          </h1>
          <p className="mt-2 text-sm text-muted">
            You have already completed your online check-in for{" "}
            <strong>{data.hotel.name}</strong>. See you soon!
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return <CheckinWizard token={token} data={data} />;
}
