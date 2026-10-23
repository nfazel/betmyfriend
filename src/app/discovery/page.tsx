'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Profile {
  id: string;
  userId: string;
  displayName: string;
  age: number;
  location: string;
  bio?: string;
  interests: string[];
}

export default function DiscoveryPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');


  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/discovery/feed?page=1', {
        cache: 'no-store',
      });
      if (!res.ok) {
        throw new Error('Failed to fetch discovery feed');
      }

      const data = await res.json();

      setProfiles(data.profiles || []);
      setCurrentIndex(0);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Error loading profiles'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (liked: boolean) => {
    if (submitting || currentIndex >= profiles.length) return;

    const profile = profiles[currentIndex];

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/discovery/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: profile.userId,
          liked,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit action');
      }

      if (currentIndex + 1 >= profiles.length) {
        await fetchFeed();
      } else {
        setCurrentIndex((prev) => prev + 1);
      }

    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Error performing action'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const currentProfile = profiles[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Platonic Discovery</h1>
        <div className="space-x-4">
          <Link href="/matches" className="text-indigo-600 hover:underline">Matches</Link>
          <Link href="/profile" className="text-gray-600 hover:underline">Profile</Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {!currentProfile || currentIndex >= profiles.length ? (
          <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md w-full">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">No more profiles</h2>
            <p className="text-gray-600 mb-4">Check back later for new platonic connections!</p>
            <button
              onClick={() => { setCurrentIndex(0); fetchFeed(); }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Refresh Feed
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="h-64 bg-indigo-100 flex items-center justify-center text-indigo-400 text-6xl font-bold">
              {currentProfile.displayName.charAt(0)}
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{currentProfile.displayName}, {currentProfile.age}</h2>
                  <span className="text-sm text-gray-500">{currentProfile.location}</span>
                </div>
                {currentProfile.bio && (
                  <p className="text-gray-700 mb-4">{currentProfile.bio}</p>
                )}
                {currentProfile.interests && currentProfile.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {currentProfile.interests.map((interest, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full">
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-center space-x-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleAction(false)}
                  disabled={submitting}
                  className="w-16 h-16 rounded-full border-2 border-red-300 text-red-500 flex items-center justify-center text-2xl hover:bg-red-50 transition"
                  title="Pass"
                >
                  ✕
                </button>
                <button
                  onClick={() => handleAction(true)}
                  disabled={submitting}
                  className="w-16 h-16 rounded-full border-2 border-green-300 text-green-500 flex items-center justify-center text-2xl hover:bg-green-50 transition"
                  title="Connect"
                >
                  ♥
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
