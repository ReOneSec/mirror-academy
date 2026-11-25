'use client';

import { useState, useEffect, useMemo, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { SITE, COURSE_STREAMS } from '@/lib/constants';
import type { RegistrationRecord } from '@/types';
import ThemeToggle from '@/components/ThemeToggle';

const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'admitted', label: 'Admitted' },
  { value: 'cancelled', label: 'Cancelled' },
];

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
  const [batchFilter, setBatchFilter] = useState<'all' | 'Free batch' | 'Paid batch' | 'Interview batch'>('all');
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
    const interview = registrations.filter((r) => r.batchType === 'Interview batch').length;
    const pending = registrations.filter((r) => r.status === 'new').length;
    const contacted = registrations.filter((r) => r.status === 'contacted').length;
    const admitted = registrations.filter((r) => r.status === 'admitted').length;
    return { total, free, paid, interview, pending, contacted, admitted };
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

  const filtersActive =
    batchFilter !== 'all' ||
    streamFilter !== 'all' ||
    statusFilter !== 'all' ||
    genderFilter !== 'all' ||
    Boolean(search);

  function resetFilters() {
    setSearch('');
    setBatchFilter('all');
    setStreamFilter('all');
    setStatusFilter('all');
    setGenderFilter('all');
  }

  // 1. Loading screen
  if (authState === 'checking') {
    return (
      <div className="adm-center" role="status">
        <span className="spinner" aria-hidden="true" />
        <p className="muted">Checking your session…</p>
      </div>
    );
  }

  // 2. Sign-in
  if (authState === 'logged_out') {
    return (
      <div className="adm-center">
        <div className="adm-login">
          <div className="adm-login__head">
            <span className="adm-logo">
              <Image src="/brand/logo.jpg" alt="Mirror Academy logo" width={56} height={56} priority />
            </span>
            <span className="chip chip--solid">Admin portal</span>
            <h1>{SITE.name}</h1>
            <p className="muted">Sign in with your institute admin account to manage student registrations.</p>
          </div>

          {loginError && (
            <p className="notice notice--error" role="alert">
              {loginError}
            </p>
          )}

          <form onSubmit={handleLogin} className="form" noValidate>
            <div>
              <label htmlFor="admin-email" className="field-label">
                Admin email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                spellCheck={false}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mirrorexams@gmail.com"
                className="field"
              />
            </div>

            <div>
              <div className="field-label">
                <label htmlFor="admin-password">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="adm-textbtn"
                  aria-controls="admin-password"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password…"
                className="field"
              />
            </div>

            <button type="submit" disabled={loginLoading} className="btn btn--primary btn--lg btn--block">
              {loginLoading ? <span className="spinner spinner--on" aria-label="Signing in" /> : 'Sign in'}
            </button>
          </form>

          <div className="adm-login__foot">
            <Link href="/" className="link">
              Back to the Mirror Academy website
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    );
  }

  // 3. Dashboard
  return (
    <div className="page">
      {toastMessage && (
        <div className="adm-toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}

      <header className="nav glass adm-nav">
        <Link href="/" className="nav__brand" aria-label={`${SITE.name} website`} target="_blank">
          <Image src="/brand/logo-round.webp" alt="" width={88} height={88} priority />
        </Link>
        <span className="adm-nav__title">Admin</span>
        <span className="adm-nav__user" title={user?.email ?? undefined}>
          {user?.email}
        </span>
        <button type="button" onClick={loadRegistrations} disabled={dataLoading} className="adm-nav__btn">
          {dataLoading ? 'Refreshing…' : 'Refresh'}
        </button>
        <button type="button" onClick={handleLogout} className="nav__cta">
          Sign out
        </button>
        <ThemeToggle />
      </header>

      <main className="main">
        <section className="adm-section adm-section--intro" aria-labelledby="adm-title">
          <div className="head">
            <p className="head__eyebrow">Admissions</p>
            <h2 id="adm-title">Student registrations</h2>
            <p className="head__sub">Call or WhatsApp new students, then move them along: New, Contacted, Admitted.</p>
          </div>

          <div className="stats adm-stats">
            <div className="stat">
              <span className="stat__fig">{stats.total}</span>
              <span className="stat__label">Applications</span>
            </div>
            <div className="stat">
              <span className="stat__fig">{stats.free}</span>
              <span className="stat__label">Free batch</span>
            </div>
            <div className="stat">
              <span className="stat__fig">{stats.paid}</span>
              <span className="stat__label">Paid batch</span>
            </div>
            <div className="stat">
              <span className="stat__fig">{stats.interview}</span>
              <span className="stat__label">Interview batch</span>
            </div>
            <div className="stat">
              <span className="stat__fig adm-fig--new">{stats.pending}</span>
              <span className="stat__label">Waiting for a call</span>
            </div>
            <div className="stat">
              <span className="stat__fig">{stats.contacted}</span>
              <span className="stat__label">Contacted</span>
            </div>
            <div className="stat">
              <span className="stat__fig adm-fig--done">{stats.admitted}</span>
              <span className="stat__label">Admitted</span>
            </div>
          </div>
        </section>

        <section className="adm-section adm-records" aria-label="Registrations">
          <div className="panel adm-tools">
            <label className="adm-search">
              <span className="sr-only">Search registrations</span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, phone, course, address or notes…"
                className="field"
              />
            </label>
            <div className="adm-filters">
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value as typeof batchFilter)}
                className="field adm-select"
                aria-label="Filter by batch"
              >
                <option value="all">All batches</option>
                <option value="Free batch">Free batch</option>
                <option value="Paid batch">Paid batch</option>
                <option value="Interview batch">Interview batch</option>
              </select>
              <select
                value={streamFilter}
                onChange={(e) => setStreamFilter(e.target.value)}
                className="field adm-select"
                aria-label="Filter by stream"
              >
                <option value="all">All streams</option>
                {COURSE_STREAMS.map((s) => (
                  <option key={s.slug} value={s.stream}>
                    {s.stream}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="field adm-select"
                aria-label="Filter by status"
              >
                <option value="all">All statuses</option>
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="field adm-select"
                aria-label="Filter by gender"
              >
                <option value="all">All genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <button type="button" onClick={exportToCSV} className="btn btn--primary">
                Export CSV
              </button>
            </div>
          </div>

          {dataError && (
            <p className="notice notice--error" role="alert">
              {dataError}
            </p>
          )}

          <div className="adm-count">
            <p>
              Showing <strong>{filteredRegistrations.length}</strong> of {registrations.length} applications
            </p>
            {filtersActive && (
              <button type="button" onClick={resetFilters} className="adm-textbtn">
                Reset filters
              </button>
            )}
          </div>

          {filteredRegistrations.length === 0 ? (
            <div className="adm-empty">
              <p className="adm-empty__title">
                {registrations.length === 0 ? 'No registrations yet.' : 'No applications match these filters.'}
              </p>
              <p className="muted">
                {registrations.length === 0
                  ? 'New student registrations from the website show up here.'
                  : 'Try other search words, or reset the filters.'}
              </p>
            </div>
          ) : (
            <div className="adm-card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Student</th>
                      <th scope="col">Contact</th>
                      <th scope="col">Batch</th>
                      <th scope="col">Course</th>
                      <th scope="col">Address</th>
                      <th scope="col">Date</th>
                      <th scope="col">Status</th>
                      <th scope="col">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrations.map((record) => {
                      const waMessage = encodeURIComponent(
                        `Hello ${record.name}, this is Mirror Academy Berhampore regarding your registration for ${record.courseName} (${record.batchType}).`
                      );
                      const waLink = `https://wa.me/91${record.phone}?text=${waMessage}`;

                      return (
                        <tr key={record.id}>
                          <th scope="row">
                            <button type="button" onClick={() => setSelectedRecord(record)} className="adm-name">
                              {record.name}
                            </button>
                            <small>
                              {record.gender} · <span className="adm-id">#{record.id.slice(0, 8)}</span>
                            </small>
                          </th>
                          <td data-label="Contact">
                            <span className="adm-phone">{record.phone}</span>
                            <span className="adm-actions">
                              <a href={`tel:${record.phone}`} className="btn">
                                Call
                              </a>
                              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn">
                                WhatsApp
                              </a>
                            </span>
                          </td>
                          <td data-label="Batch">
                            <span className={`chip${record.batchType === 'Paid batch' ? ' chip--solid' : ''}`}>
                              {record.batchType}
                            </span>
                          </td>
                          <td data-label="Course">
                            {record.courseName}
                            <small>{record.stream}</small>
                          </td>
                          <td data-label="Address" className="adm-address">
                            <span title={record.address}>{record.address}</span>
                          </td>
                          <td data-label="Date" className="adm-nowrap">
                            {new Date(record.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td data-label="Status">
                            <select
                              value={record.status}
                              onChange={(e) => handleStatusChange(record.id, e.target.value)}
                              className="field adm-status"
                              data-status={record.status}
                              aria-label={`Status for ${record.name}`}
                            >
                              {STATUSES.map((s) => (
                                <option key={s.value} value={s.value}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="adm-row-actions">
                            <button type="button" onClick={() => setSelectedRecord(record)} className="btn">
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(record.id, record.name)}
                              className="adm-textbtn adm-textbtn--danger"
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
        </section>

        <footer className="foot">
          <span>
            <strong>{SITE.name}</strong> admin
          </span>
          <Link href="/" className="link" target="_blank">
            Open the public website
          </Link>
        </footer>
      </main>

      {selectedRecord && (
        <div
          className="adm-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="adm-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedRecord(null);
          }}
        >
          <div className="adm-sheet">
            <div className="adm-sheet__head">
              <div>
                <p className="head__eyebrow">Application</p>
                <h3 id="adm-modal-title">{selectedRecord.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="adm-close"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="record">
              <dl>
                <div>
                  <dt>Batch</dt>
                  <dd>{selectedRecord.batchType}</dd>
                </div>
                <div>
                  <dt>Gender</dt>
                  <dd>{selectedRecord.gender}</dd>
                </div>
                <div>
                  <dt>Course</dt>
                  <dd>
                    {selectedRecord.courseName} <span className="muted">({selectedRecord.stream})</span>
                  </dd>
                </div>
                <div>
                  <dt>Mobile</dt>
                  <dd>
                    <a href={`tel:${selectedRecord.phone}`} className="link">
                      {selectedRecord.phone}
                    </a>
                  </dd>
                </div>
                <div className="wide">
                  <dt>Address</dt>
                  <dd>{selectedRecord.address}</dd>
                </div>
                <div className="wide">
                  <dt>Questions or notes</dt>
                  <dd className="adm-notes">
                    {selectedRecord.message || <span className="muted">No questions or notes.</span>}
                  </dd>
                </div>
                <div>
                  <dt>Registered</dt>
                  <dd>{new Date(selectedRecord.createdAt).toLocaleString('en-IN')}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>
                    <select
                      value={selectedRecord.status}
                      onChange={(e) => handleStatusChange(selectedRecord.id, e.target.value)}
                      className="field adm-status"
                      data-status={selectedRecord.status}
                      aria-label="Application status"
                    >
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="adm-sheet__foot">
              <button type="button" onClick={() => setSelectedRecord(null)} className="btn">
                Close
              </button>
              <a
                href={`https://wa.me/91${selectedRecord.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
              >
                WhatsApp
              </a>
              <a href={`tel:${selectedRecord.phone}`} className="btn btn--primary">
                Call {selectedRecord.phone}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
