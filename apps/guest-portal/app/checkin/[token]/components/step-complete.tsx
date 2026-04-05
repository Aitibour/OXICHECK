"use client";

import { motion } from "framer-motion";
import { CheckCircle, MapPin, Clock, Calendar } from "lucide-react";

interface Props {
  hotel: { name: string; city?: string; country?: string };
  reservation: {
    checkInDate: string;
    checkOutDate: string;
    roomType?: string;
  };
}

export function StepComplete({ hotel, reservation }: Props) {
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto"
        >
          <CheckCircle size={72} className="mx-auto text-success" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="mt-6 text-2xl font-bold text-secondary">
            Check-In Complete!
          </h1>
          <p className="mt-2 text-sm text-muted">
            You&apos;re all set for your stay at{" "}
            <strong>{hotel.name}</strong>. Head straight to reception for your
            key when you arrive.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 rounded-xl border border-gray-200 bg-white p-5 text-left space-y-4"
        >
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted">Hotel</p>
              <p className="text-sm font-medium text-secondary">
                {hotel.name}
              </p>
              {hotel.city && (
                <p className="text-xs text-muted">
                  {hotel.city}
                  {hotel.country ? `, ${hotel.country}` : ""}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar size={18} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted">Check-In</p>
              <p className="text-sm font-medium text-secondary">
                {formatDate(reservation.checkInDate)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock size={18} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted">Check-Out</p>
              <p className="text-sm font-medium text-secondary">
                {formatDate(reservation.checkOutDate)}
              </p>
            </div>
          </div>

          {reservation.roomType && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-muted">Room Type</p>
              <p className="text-sm font-medium text-secondary">
                {reservation.roomType}
              </p>
            </div>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-[10px] text-muted"
        >
          Powered by{" "}
          <span className="font-medium">
            Oxi<span className="text-primary">Check</span>
          </span>
        </motion.p>
      </motion.div>
    </div>
  );
}
