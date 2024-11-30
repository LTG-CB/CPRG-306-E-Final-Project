'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  // Add transaction flow
  const startAddTransactionFlow = async () => {
    try {
      const category = prompt('Enter the transaction category (e.g., Food, Rent):');
      if (!category) throw new Error('Transaction category is required.');

      const amount = parseFloat(prompt('Enter the transaction amount:'));
      if (isNaN(amount) || amount <= 0) throw new Error('Transaction amount must be a positive number.');

      const description = prompt('Enter the transaction description (optional):');

      const response = await fetch('/api/transactions/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, amount, description }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add transaction.');

      setTransactions((prev) => [...prev, data]); // Append the new transaction
      alert('Transaction added successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  // Sign-up flow
  const signUp = async () => {
    const email = prompt('Enter your email:');
    const password = prompt('Enter your password:');
    if (!email || !password) return;

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Sign-up failed.');
      }

      alert('Account created successfully. Please sign in.');
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch transactions for the signed-in user
  useEffect(() => {
    if (session) {
      const fetchTransactions = async () => {
        try {
          const response = await fetch('/api/transactions/transactions');
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Failed to fetch transactions');
          setTransactions(data);
        } catch (err) {
          setError(err.message);
        }
      };
      fetchTransactions();
    }
  }, [session]);

  // Add a new function to handle the edit transaction flow
  const startEditTransactionFlow = async () => {
    try {
      const selectedTransactionId = prompt(
        `Select a transaction to edit by ID:\n\n${transactions
          .map((tx) => `ID: ${tx.id}, ${tx.category}: $${tx.amount}`)
          .join('\n')}`
      );

      if (!selectedTransactionId) return;

      const selectedTransaction = transactions.find((tx) => tx.id === parseInt(selectedTransactionId, 10));
      if (!selectedTransaction) {
        alert('Invalid transaction ID selected.');
        return;
      }

      const newCategory = prompt('Enter the new category:', selectedTransaction.category);
      if (!newCategory) throw new Error('Category is required.');

      const newAmount = parseFloat(prompt('Enter the new amount:', selectedTransaction.amount));
      if (isNaN(newAmount) || newAmount <= 0) throw new Error('Amount must be a positive number.');

      const newDescription = prompt('Enter the new description:', selectedTransaction.description);

      const response = await fetch(`/api/transactions/transactions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: selectedTransaction.id,
          category: newCategory,
          amount: newAmount,
          description: newDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to edit transaction.');
      }

      const updatedTransaction = await response.json();
      setTransactions((prev) =>
        prev.map((tx) => (tx.id === updatedTransaction.id ? updatedTransaction : tx))
      );

      alert('Transaction updated successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete transaction flow
  const startDeleteTransactionFlow = async () => {
    try {
      if (transactions.length === 0) {
        alert('No transactions available to delete.');
        return;
      }

      const transactionOptions = transactions
        .map(
          (tx, index) =>
            `${index + 1}. ${tx.category}: $${Number(tx.amount).toFixed(2)} (${tx.description || 'No description'})`
        )
        .join('\n');

      const selection = prompt(
        `Select a transaction to delete:\n${transactionOptions}\n\nEnter the number of the transaction to delete:`
      );

      const index = parseInt(selection, 10) - 1;
      if (isNaN(index) || index < 0 || index >= transactions.length) {
        throw new Error('Invalid selection.');
      }

      const transactionId = transactions[index].id;

      const response = await fetch(`/api/transactions/transactions?transactionId=${transactionId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete transaction.');

      setTransactions((prev) => prev.filter((tx) => tx.id !== transactionId));
      alert('Transaction deleted successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  if (status === 'loading') return <p>Loading...</p>;

  if (!session) {
    return (
      <div>
        <h1>Finance Tracker</h1>
        <button onClick={() => signIn()}>Sign In</button>
        <button onClick={signUp}>Sign Up</button> {/* Sign-Up button */}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <h1>Finance Tracker</h1>
      <p>Welcome, {session.user.email}</p>
      <button onClick={() => signOut()}>Sign Out</button>

      <h2>Recent Transactions</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {transactions.map((tx) => (
          <li key={tx.id}>
            {tx.category}: ${Number(tx.amount).toFixed(2)} ({tx.description || 'No description'})
          </li>
        ))}
      </ul>

      <div><button onClick={startAddTransactionFlow}>Add Transaction</button></div>
      <div><button onClick={startEditTransactionFlow}>Edit Transaction</button></div>
      <div><button onClick={startDeleteTransactionFlow}>Delete Transaction</button></div>
    </div>
  );
}
