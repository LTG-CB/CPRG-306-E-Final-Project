// This directive is required for React components in Next.js when using server components.
'use client';

// Importing the useState hook for managing local state.
import { useState } from 'react';
// Importing NextAuth functions for session handling, signing in, and signing out.
import { useSession, signIn, signOut } from 'next-auth/react';

export default function HomePage() {
  // Destructure session data and its status from the useSession hook.
  const { data: session, status } = useSession();
  // Local state for handling and displaying sign-up errors.
  const [signUpError, setSignUpError] = useState(null);

  // Function to handle user sign-up
  const signUp = async () => {
    // Prompt user for email and password input
    const email = prompt('Enter your email:');
    const password = prompt('Enter your password:');
    
    if (email && password) {
      try {
        // Send the email and password to the sign-up API endpoint
        const response = await fetch('/api/auth/signup', {
          // HTTP POST request
          method: 'POST',
          // Set content type as JSON
          headers: { 'Content-Type': 'application/json' },
          // Send the email and password in the request body
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          // If the response is not successful, handle the error
          const errorData = await response.json();
          // Extract error message or use a default message
          throw new Error(errorData.error || 'Failed to sign up');
        }

        // Alert the user upon successful account creation
        alert('Account created successfully. Please sign in.');
      } catch (error) {
        // Update the sign-up error state to display the error message
        setSignUpError(error.message);
      }
    }
  };

  // Display loading state if the session status is "loading"
  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  // If there is no active session, show the sign-in and sign-up options
  if (!session) {
    return (
      <div>
        <h1>Finance Tracker</h1>
        <p>You are not signed in.</p>
        <div>
          <button onClick={() => signIn()}>Sign In</button> {/* Button to trigger the sign-in flow */}
        </div>
        <div>
          <button onClick={() => signUp()}>Sign Up</button> {/* Button to trigger the sign-up flow */}
        </div>
        {signUpError && <p style={{ color: 'red' }}>{signUpError}</p>} {/* Display any sign-up error */}
      </div>
    );
  }

  // If the user is signed in, display their email and the sign-out button
  return (
    <div>
      <h1>Finance Tracker</h1>
      <p>Welcome, {session.user.email}</p> {/* Display the user's email */}
      <button onClick={() => signOut()}>Sign Out</button> {/* Button to trigger the sign-out flow */}
    </div>
  );
}
