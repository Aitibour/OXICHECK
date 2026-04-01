'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { logout } from '@/lib/dashboard-api';

interface StaffUser {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface TopBarProps {
  onMenuClick: () => void;
  user?: StaffUser | null;
  properties?: Array<{ id: string; name: string }>;
  selectedPropertyId?: string;
  onPropertyChange?: (id: string) => void;
}

const roleLabels: Record<string, string> = {
  PLATFORM_ADMIN: 'Platform Admin',
  PROPERTY_OWNER: 'Property Owner',
  GENERAL_MANAGER: 'General Manager',
  FRONT_DESK_SUPERVISOR: 'Supervisor',
  FRONT_DESK_AGENT: 'Front Desk',
  REVENUE_MANAGER: 'Revenue Manager',
};

export function TopBar({
  onMenuClick,
  user,
  properties = [],
  selectedPropertyId,
  onPropertyChange,
}: TopBarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Close menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = () => setUserMenuOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [userMenuOpen]);

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : '??';

  return (
    <header className="h-14 bg-white border-b border-[var(--color-border)] flex items-center justify-between px-4 gap-4">
      {/* Hamburger (mobile) */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-[var(--color-text-muted)]"
        aria-label="Open navigation"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Property selector */}
      {properties.length > 0 && (
        <div className="flex-1 max-w-xs">
          <label htmlFor="property-select" className="sr-only">
            Select property
          </label>
          <select
            id="property-select"
            value={selectedPropertyId}
            onChange={(e) => onPropertyChange?.(e.target.value)}
            className="w-full text-sm border border-[var(--color-border)] rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="ml-auto flex items-center gap-3">
        {/* Today's date */}
        <span className="hidden sm:block text-xs text-[var(--color-text-muted)]">
          {new Date().toLocaleDateString('en-CA', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setUserMenuOpen((o) => !o);
            }}
            className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="User menu"
            aria-expanded={userMenuOpen}
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">{initials}</span>
            </div>
            {user && (
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-medium text-[var(--color-text)] leading-tight">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-xs text-[var(--color-text-muted)] leading-tight">
                  {roleLabels[user.role] ?? user.role}
                </span>
              </div>
            )}
            <svg
              className={clsx(
                'w-4 h-4 text-[var(--color-text-muted)] transition-transform hidden sm:block',
                userMenuOpen && 'rotate-180',
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg border border-[var(--color-border)] shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b border-[var(--color-border)]">
                <p className="text-xs font-semibold text-[var(--color-text)] truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
