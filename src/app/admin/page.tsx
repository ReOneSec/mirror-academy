'use client';

import { useState, useEffect, useMemo, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { SITE, COURSE_STREAMS } from '@/lib/constants';
import type { RegistrationRecord } from '@/types';
import {
  LockIcon,
  LogOutIcon,
  PhoneIcon,
  SearchIcon,
  RefreshIcon,
  DownloadIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  SparklesIcon,
  WhatsAppIcon,
  MailIcon,
} from '@/components/Icons';

export default function AdminPage() {
  const [authState, setAuthState] = useState<'checking' | 'logged_out' | 'logged_in'>('checking');
  const [user, setUser] = useState<User | null>(null);

  // Login form state
  const [email, setEmail] = useState('mirrorexams@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Data state
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState<'all' | 'Free batch' | 'Paid batch'>('all');
  const [streamFilter, setStreamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');

  // Selected student detail modal
  const [selectedRecord, setSelectedRecord] = useState<RegistrationRecord | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3500);
  }

  // 1. Initialize Supabase Auth state & listener
  useEffect(() => {
    const supabase = createClient();

    async function checkSession() {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (currentUser) {
          setUser(currentUser);
          setAuthState('logged_in');
          loadRegistrations();
        } else {
          setAuthState('logged_out');
        }
      } catch {
        setAuthState('logged_out');
      }
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setAuthState('logged_in');
      } else {
        setUser(null);
        setAuthState('logged_out');
        setRegistrations([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError('');

    if (!email.trim() || !password) {
      setLoginError('Please enter both email and password.');
      return;
    }

    setLoginLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setLoginError(error.message);
      } else if (data.user) {
        setUser(data.user);
        setAuthState('logged_in');
        setPassword('');
        loadRegistrations();
      }
    } catch {
      setLoginError('Could not connect to Supabase Auth. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Continue client cleanup
    }
    setUser(null);
    setAuthState('logged_out');
    setRegistrations([]);
  }

  async function loadRegistrations() {
    setDataLoading(true);
    setDataError('');
    try {
      const res = await fetch('/api/admin/enquiries');
      if (res.status === 401) {
        setAuthState('logged_out');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setRegistrations(data.registrations ?? []);
      } else {
        setDataError(data.message || 'Failed to load records.');
      }
    } catch {
      setDataError('Could not fetch student records. Please check your connection.');
    } finally {
      setDataLoading(false);
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    // Optimistic UI update
    setRegistrations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    if (selectedRecord && selectedRecord.id === id) {
      setSelectedRecord((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      const res = await fetch('/api/admin/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        loadRegistrations();
        showToast('Failed to update status.');
      } else {
        showToast(`Status updated to "${newStatus}".`);
      }
    } catch {
      loadRegistrations();
      showToast('Network error while updating status.');
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Are you sure you want to delete the registration for "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/enquiries?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRegistrations((prev) => prev.filter((r) => r.id !== id));
        if (selectedRecord?.id === id) setSelectedRecord(null);
        showToast(`Deleted record for ${name}.`);
      } else {
        showToast(data.message || 'Failed to delete record.');
      }
    } catch {
      showToast('Network error while deleting record.');
    }
  }

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((r) => {
      if (batchFilter !== 'all' && r.batchType !== batchFilter) return false;
      if (streamFilter !== 'all' && r.stream !== streamFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (genderFilter !== 'all' && r.gender !== genderFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesPhone = r.phone.includes(q);
        const matchesCourse = r.courseName.toLowerCase().includes(q);
        const matchesAddress = r.address.toLowerCase().includes(q);
        const matchesMsg = r.message ? r.message.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesPhone && !matchesCourse && !matchesAddress && !matchesMsg) {
          return false;
        }
      }

      return true;
    });
  }, [registrations, batchFilter, streamFilter, statusFilter, genderFilter, search]);

  // Statistics
  const stats = useMemo(() => {
    const total = registrations.length;
    const free = registrations.filter((r) => r.batchType === 'Free batch').length;
    const paid = registrations.filter((r) => r.batchType === 'Paid batch').length;
    const pending = registrations.filter((r) => r.status === 'new').length;
    const contacted = registrations.filter((r) => r.status === 'contacted').length;
    const admitted = registrations.filter((r) => r.status === 'admitted').length;
    return { total, free, paid, pending, contacted, admitted };
  }, [registrations]);

  function exportToCSV() {
    if (filteredRegistrations.length === 0) {
      alert('No registrations to export.');
      return;
    }

    const headers = [
      'Registration ID',
      'Student Name',
      'Contact Number',
      'Batch Type',
      'Gender',
      'Course',
      'Stream',
      'Residential Address',
      'Questions / Notes',
      'Status',
      'Registered Date',
    ];

    const escapeCsv = (val: string | null | undefined) => {
      if (!val) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredRegistrations.map((r) => [
      escapeCsv(r.id),
      escapeCsv(r.name),
      escapeCsv(r.phone),
      escapeCsv(r.batchType),
      escapeCsv(r.gender),
      escapeCsv(r.courseName),
      escapeCsv(r.stream),
      escapeCsv(r.address),
      escapeCsv(r.message || ''),
      escapeCsv(r.status),
      escapeCsv(new Date(r.createdAt).toLocaleString('en-IN')),
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const today = new Date().toISOString().slice(0, 10);
    link.download = `mirror-academy-students-${today}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Exported CSV successfully.');
  }

  // 1. Loading screen
  if (authState === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-navy/20 border-t-navy" />
          <p className="text-sm font-medium text-slate">Verifying Supabase Auth session…</p>
        </div>
      </div>
    );
  }

  // 2. Supabase Auth Login Screen
  if (authState === 'logged_out') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-navy/20 bg-navy p-2 shadow-sm">
              <Image
                src="/brand/logo.jpg"
                alt="Mirror Academy logo"
                width={64}
                height={64}
                className="rounded-full object-cover"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-navy">{SITE.name}</h1>
            <div className="mt-1 flex items-center justify-center gap-1.5">
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                Supabase Auth
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-gold">
                Admin Portal
              </span>
            </div>
            <p className="mt-2 text-xs text-slate">
              Sign in with your institute admin credentials to manage student registrations.
            </p>
          </div>

          {loginError && (
            <div
              className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700"
              role="alert"
            >
              <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Admin Email
              </label>
              <div className="relative">
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mirrorexams@gmail.com"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                  <MailIcon className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-slate-500 hover:text-navy"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password…"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                  <LockIcon className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-navy py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-light disabled:opacity-60"
            >
              {loginLoading ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                'Sign In with Supabase'
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <Link
              href="/"
              className="text-xs font-medium text-slate-500 hover:text-navy underline-offset-4 hover:underline"
            >
              &larr; Back to Mirror Academy website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Admin Dashboard
  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-navy px-4 py-3 text-sm font-medium text-white shadow-lg animate-fade-in">
          <CheckCircleIcon className="h-5 w-5 text-gold" aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-navy/20 bg-navy text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/logo.jpg"
              alt="Mirror Academy logo"
              width={34}
              height={34}
              className="rounded-full ring-2 ring-gold/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight">{SITE.name}</span>
                <span className="rounded-md bg-gold px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-navy">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-white/60">Student Admissions &amp; Enquiries</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Authenticated user pill */}
            <div className="hidden md:flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1 text-xs text-white/90">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="truncate max-w-[180px] font-medium">{user?.email}</span>
            </div>

            <button
              type="button"
              onClick={loadRegistrations}
              disabled={dataLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20 disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshIcon
                className={`h-3.5 w-3.5 ${dataLoading ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-medium text-white/90 hover:bg-white/10 transition"
            >
              Public Site &rarr;
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600/80 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600"
              title="Sign out from Supabase"
            >
              <LogOutIcon className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        {/* KPI Stats Grid */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs font-medium text-slate-500">Total Applications</p>
            <p className="mt-1 text-2xl font-black text-navy">{stats.total}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">Free Batch</p>
              <span className="h-2 w-2 rounded-full bg-blue-500" />
            </div>
            <p className="mt-1 text-2xl font-black text-blue-700">{stats.free}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">Paid Batch</p>
              <SparklesIcon className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
            </div>
            <p className="mt-1 text-2xl font-black text-amber-700">{stats.paid}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs font-medium text-slate-500">Pending Follow-up</p>
            <p className="mt-1 text-2xl font-black text-orange-600">{stats.pending}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs font-medium text-slate-500">Contacted</p>
            <p className="mt-1 text-2xl font-black text-indigo-600">{stats.contacted}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs font-medium text-slate-500">Admitted</p>
            <p className="mt-1 text-2xl font-black text-emerald-600">{stats.admitted}</p>
          </div>
        </div>

        {/* Search, Filter & Actions Toolbar */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student name, phone, course, address, or remarks…"
                className="w-full rounded-lg border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-navy focus:bg-white focus:outline-none focus:ring-1 focus:ring-navy"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <SearchIcon className="h-4 w-4" aria-hidden="true" />
              </div>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400 hover:text-slate-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Batch Filter */}
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value as typeof batchFilter)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-navy focus:outline-none"
                aria-label="Filter by batch"
              >
                <option value="all">All Batches</option>
                <option value="Free batch">Free batch</option>
                <option value="Paid batch">Paid batch</option>
              </select>

              {/* Stream Filter */}
              <select
                value={streamFilter}
                onChange={(e) => setStreamFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-navy focus:outline-none"
                aria-label="Filter by stream"
              >
                <option value="all">All Streams</option>
                {COURSE_STREAMS.map((s) => (
                  <option key={s.slug} value={s.stream}>
                    {s.stream}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-navy focus:outline-none"
                aria-label="Filter by status"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="admitted">Admitted</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Gender Filter */}
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-navy focus:outline-none"
                aria-label="Filter by gender"
              >
                <option value="all">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>

              {/* Export CSV button */}
              <button
                type="button"
                onClick={exportToCSV}
                className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-navy-light"
              >
                <DownloadIcon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Data Error Banner */}
        {dataError && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>{dataError}</span>
          </div>
        )}

        {/* Results Count & Current Filter Info */}
        <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
          <p>
            Showing <strong className="text-slate-800">{filteredRegistrations.length}</strong> of{' '}
            {registrations.length} applications
          </p>
          {(batchFilter !== 'all' ||
            streamFilter !== 'all' ||
            statusFilter !== 'all' ||
            genderFilter !== 'all' ||
            search) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setBatchFilter('all');
                setStreamFilter('all');
                setStatusFilter('all');
                setGenderFilter('all');
              }}
              className="text-navy hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Registrations Table (Desktop) / Cards (Mobile) */}
        {filteredRegistrations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-base font-semibold text-slate-700">No applications match your filter.</p>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your search terms or clearing active filters.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th scope="col" className="px-4 py-3.5">
                      Student
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Contact &amp; Connect
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Batch Type
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Course &amp; Stream
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Address
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Date
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRegistrations.map((record) => {
                    const waMessage = encodeURIComponent(
                      `Hello ${record.name}, this is Mirror Academy Berhampore regarding your registration for ${record.courseName} (${record.batchType}).`
                    );
                    const waLink = `https://wa.me/91${record.phone}?text=${waMessage}`;

                    return (
                      <tr key={record.id} className="transition-colors hover:bg-slate-50/80">
                        {/* Student Name & Gender */}
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => setSelectedRecord(record)}
                            className="text-left font-bold text-navy hover:text-gold hover:underline focus:outline-none"
                          >
                            {record.name}
                          </button>
                          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span>{record.gender}</span>
                            <span>•</span>
                            <span className="font-mono text-[10px] text-slate-400">
                              #{record.id.slice(0, 8)}
                            </span>
                          </div>
                        </td>

                        {/* Phone with Call & WhatsApp buttons */}
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-900 tabular-nums">
                            {record.phone}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <a
                              href={`tel:${record.phone}`}
                              className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-navy hover:bg-navy hover:text-white transition"
                              title="Call student"
                            >
                              <PhoneIcon className="h-3 w-3" aria-hidden="true" />
                              Call
                            </a>
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-600 hover:text-white transition"
                              title="Chat on WhatsApp"
                            >
                              <WhatsAppIcon className="h-3 w-3" aria-hidden="true" />
                              WhatsApp
                            </a>
                          </div>
                        </td>

                        {/* Batch Type Badge */}
                        <td className="px-4 py-3.5">
                          {record.batchType === 'Paid batch' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 font-bold text-amber-900">
                              <SparklesIcon className="h-3 w-3 text-amber-600" aria-hidden="true" />
                              Paid batch
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 font-bold text-blue-800">
                              Free batch
                            </span>
                          )}
                        </td>

                        {/* Course & Stream */}
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-900">{record.courseName}</div>
                          <div className="text-[11px] text-slate-500">{record.stream}</div>
                        </td>

                        {/* Address */}
                        <td className="max-w-[200px] px-4 py-3.5">
                          <p className="truncate text-slate-700" title={record.address}>
                            {record.address}
                          </p>
                        </td>

                        {/* Registration Date */}
                        <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                          {new Date(record.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        {/* Status Dropdown */}
                        <td className="px-4 py-3.5">
                          <select
                            value={record.status}
                            onChange={(e) => handleStatusChange(record.id, e.target.value)}
                            className={`rounded-lg border px-2 py-1 text-[11px] font-semibold transition focus:outline-none ${
                              record.status === 'new'
                                ? 'border-orange-300 bg-orange-50 text-orange-800'
                                : record.status === 'contacted'
                                ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
                                : record.status === 'admitted'
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                : 'border-slate-300 bg-slate-100 text-slate-700'
                            }`}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="admitted">Admitted</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>

                        {/* Actions (View detail & Delete) */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedRecord(record)}
                            className="mr-2 text-navy hover:text-gold hover:underline font-semibold"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(record.id, record.name)}
                            className="text-red-600 hover:text-red-800 hover:underline"
                            title="Delete registration"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Student Detail & Notes */}
        {selectedRecord && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="pr-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Application Details
                  </span>
                  <h3 className="text-xl font-bold text-navy break-words [overflow-wrap:anywhere]">{selectedRecord.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              <dl className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <dt className="font-medium text-slate-400">Batch Type</dt>
                  <dd className="mt-0.5 font-bold text-navy">{selectedRecord.batchType}</dd>
                </div>

                <div>
                  <dt className="font-medium text-slate-400">Gender</dt>
                  <dd className="mt-0.5 font-bold text-navy">{selectedRecord.gender}</dd>
                </div>

                <div>
                  <dt className="font-medium text-slate-400">Selected Course</dt>
                  <dd className="mt-0.5 font-bold text-navy">
                    {selectedRecord.courseName}{' '}
                    <span className="font-normal text-slate-500">({selectedRecord.stream})</span>
                  </dd>
                </div>

                <div>
                  <dt className="font-medium text-slate-400">Contact Number</dt>
                  <dd className="mt-0.5 font-bold text-navy tabular-nums">
                    <a href={`tel:${selectedRecord.phone}`} className="hover:underline text-navy">
                      {selectedRecord.phone}
                    </a>
                  </dd>
                </div>

                <div className="col-span-2">
                  <dt className="font-medium text-slate-400">Residential Address</dt>
                  <dd className="mt-0.5 rounded-lg bg-slate-50 p-2.5 font-medium text-slate-800 break-words [overflow-wrap:anywhere] whitespace-pre-wrap">
                    {selectedRecord.address}
                  </dd>
                </div>

                <div className="col-span-2">
                  <dt className="font-medium text-slate-400">Student Remarks / Questions</dt>
                  <dd className="mt-0.5 min-h-[60px] max-h-48 overflow-y-auto rounded-lg bg-slate-50 p-2.5 text-slate-800 break-words [overflow-wrap:anywhere] whitespace-pre-wrap">
                    {selectedRecord.message || (
                      <span className="italic text-slate-400">No questions or notes provided.</span>
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="font-medium text-slate-400">Application Date</dt>
                  <dd className="mt-0.5 text-slate-700">
                    {new Date(selectedRecord.createdAt).toLocaleString('en-IN')}
                  </dd>
                </div>

                <div>
                  <dt className="font-medium text-slate-400">Application Status</dt>
                  <dd className="mt-1">
                    <select
                      value={selectedRecord.status}
                      onChange={(e) => handleStatusChange(selectedRecord.id, e.target.value)}
                      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="admitted">Admitted</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </dd>
                </div>
              </dl>

              <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <a
                  href={`tel:${selectedRecord.phone}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-xs font-bold text-white hover:bg-navy-light"
                >
                  <PhoneIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Call {selectedRecord.phone}
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
