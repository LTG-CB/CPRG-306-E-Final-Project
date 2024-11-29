'use client';

import { useState, useEffect } from 'react'; // Importing useState and useEffect hooks for local state and side effects
import { useSession, signIn, signOut } from 'next-auth/react'; // Importing NextAuth functions for session handling

export default function HomePage() {
  const { data: session, status } = useSession(); // Destructure session data and status from the useSession hook
  const [signUpError, setSignUpError] = useState(null); // State to handle sign-up errors
  const [transactions, setTransactions] = useState([]); // State to store transactions
  const [fetchError, setFetchError] = useState(null); // State to handle transaction fetch errors

  // Function to handle user sign-up
  const signUp = async () => {
    const email = prompt('Enter your email:'); // Prompt for email
    const password = prompt('Enter your password:'); // Prompt for password

    if (email && password) {
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST', // HTTP POST request
          headers: { 'Content-Type': 'application/json' }, // Set content type to JSON
          body: JSON.stringify({ email, password }), // Send email and password in the request body
        });

        if (!response.ok) {
          const errorData = await response.json(); // Parse error response
          throw new Error(errorData.error || 'Failed to sign up'); // Throw error if sign-up fails
        }

        alert('Account created successfully. Please sign in.'); // Notify the user of successful sign-up
      } catch (error) {
        setSignUpError(error.message); // Update sign-up error state
      }
    }
  };

  // Fetch transactions when the user is signed in
  useEffect(() => {
    if (session) {
      const fetchTransactions = async () => {
        try {
          const response = await fetch('/api/transactions/transactions', {
            method: 'GET', // HTTP GET request
            headers: { 'Content-Type': 'application/json' }, // Set content type to JSON
          });

          if (!response.ok) {
            const errorData = await response.json(); // Parse error response
            throw new Error(errorData.error || 'Failed to fetch transactions'); // Throw error if fetch fails
          }

          const data = await response.json(); // Parse successful response
          setTransactions(data); // Update transactions state
        } catch (error) {
          setFetchError(error.message); // Update fetch error state
        }
      };

      fetchTransactions(); // Call the function to fetch transactions
    }
  }, [session]); // Dependency array to re-run when the session changes

  // Display loading state if session status is "loading"
  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  // If no active session, show sign-in and sign-up options
  if (!session) {
    return (
      <div>
        <h1>Finance Tracker</h1>
        <p>You are not signed in.</p>
        <div>
          <button onClick={() => signIn()}>Sign In</button> {/* Trigger sign-in flow */}
        </div>
        <div>
          <button onClick={() => signUp()}>Sign Up</button> {/* Trigger sign-up flow */}
        </div>
        {signUpError && <p style={{ color: 'red' }}>{signUpError}</p>} {/* Display sign-up error */}
      </div>
    );
  }

  // If the user is signed in, display their email and fetched transactions
  return (
    <div>
      <h1>Finance Tracker</h1>
      <p>Welcome, {session.user.email}</p> {/* Display the user's email */}
      <button onClick={() => signOut()}>Sign Out</button> {/* Trigger sign-out flow */}
      <h2>Recent Transactions</h2>
      {fetchError && <p style={{ color: 'red' }}>{fetchError}</p>} {/* Display transaction fetch error */}
      {transactions.length > 0 ? (
        <ul>
          {transactions.map((transaction) => (
            <li key={transaction.id}>
              <p>
                <strong>Category:</strong> {transaction.category}
              </p>
              <p>
                <strong>Amount:</strong> ${transaction.amount.toFixed(2)}
              </p>
              <p>
                <strong>Description:</strong> {transaction.description || 'N/A'}
              </p>
              <p>
                <strong>Date:</strong> {new Date(transaction.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No transactions found.</p>
      )}
    </div>
  );
}
