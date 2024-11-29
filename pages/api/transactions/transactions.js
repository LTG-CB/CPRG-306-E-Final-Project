// Import server session management from NextAuth
import { getServerSession } from 'next-auth/next';
// Import authentication options
import authOptions from '../auth/[...nextauth]';
// Import PostgreSQL library
import { Pool } from 'pg';

// Create a connection pool for PostgreSQL
const pool = new Pool({
  // Database connection string from environment variables
  connectionString: process.env.POSTGRES_URL,
});

// API handler for transactions
export default async function handler(req, res) {
  // Get the current session
  const session = await getServerSession(req, res, authOptions);

  // If no session is found, return an unauthorized error
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get the user's ID from the session
  const userId = session.user.id;

  if (req.method === 'GET') {
    // Handle GET requests to fetch transactions
    try {
      const result = await pool.query(
        'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
        // Query transactions for the logged-in user
        [userId]
      );
      // Return the transactions as a JSON response
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Handle database errors
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  } else {
    // Handle unsupported HTTP methods
    // Specify allowed methods
    res.setHeader('Allow', ['GET']);
    // Return a 405 error for unsupported methods
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
