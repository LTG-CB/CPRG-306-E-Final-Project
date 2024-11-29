'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (!session) {
    return (
      <div>
        <h1>Finance Tracker</h1>
        <p>You are not signed in.</p>
        <button onClick={() => signIn()}>Sign In</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Finance Tracker</h1>
      <p>Welcome, {session.user.email}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
