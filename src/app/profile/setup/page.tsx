'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileSetupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [interests, setInterests] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile');
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to load profile');
          return;
        }
        if (data.profile) {
          setDisplayName(data.profile.displayName || '');
          setAge(data.profile.age !== null && data.profile.age !== undefined ? String(data.profile.age) : '');
          setLocation(data.profile.location || '');
          setInterests(Array.isArray(data.profile.interests) ? data.profile.interests.join(', ') : '');
          setIsComplete(Boolean(data.complete));
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          age: age === '' ? null : Number(age),
          location,
          interests,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save profile');
      }
      setIsComplete(Boolean(data.complete));
      if (data.profile?.interests) {
        setInterests(Array.isArray(data.profile.interests) ? data.profile.interests.join(', ') : '');
      }
      setSuccess('Profile saved. You can return later to edit it.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
        Loading profile...
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '500px', margin: '4rem auto', padding: '2rem', fontFamily: 'sans-serif', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1>Profile Setup</h1>
      <div
        style={{
          marginBottom: '1.5rem',
          padding: '0.75rem',
          backgroundColor: isComplete ? '#d4edda' : '#fff3cd',
          color: isComplete ? '#155724' : '#856404',
          borderRadius: '4px',
          border: '1px solid ' + (isComplete ? '#c3e6cb' : '#ffeeba'),
        }}
      >
        {isComplete
          ? 'Status: Complete'
          : 'Status: Incomplete — display name, age, location, and interests are required'}
      </div>

      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginBottom: '1rem' }}>{success}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Display name *</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Age *</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
            min={18}
            max={120}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>City / location *</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Interests * (comma-separated)</label>
          <textarea
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            required
            rows={4}
            placeholder="hiking, coffee, live music"
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          style={{ padding: '0.75rem', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </main>
  );
}
