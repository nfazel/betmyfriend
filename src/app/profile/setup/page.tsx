import React from 'react';
import { getSessionUserId } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProfileSetupPage() {
  const userId = getSessionUserId();

  if (!userId) {
    redirect('/login');
  }

  return (
    <main style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem', fontFamily: 'sans-serif', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1>Profile Setup (Placeholder)</h1>
      <p>Welcome! You are successfully signed in.</p>
      <p>User ID: <code>{userId}</code></p>
      <p>Continue setting up your profile in a later task.</p>
    </main>
  );
}
