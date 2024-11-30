import { getServerSession } from 'next-auth/next';
import authOptions from '../auth/[...nextauth]';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { email } = session.user;

  if (req.method === 'POST') {
    try {
      const { amount, category, description } = req.body;

      if (!amount || !category) {
        return res.status(400).json({ error: 'Amount and category are required' });
      }

      const result = await pool.query(
        `INSERT INTO transactions (user_id, amount, category, description)
         VALUES ((SELECT id FROM users WHERE email = $1), $2, $3, $4)
         RETURNING *`,
        [email, amount, category, description]
      );

      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('[Transactions API] Error adding transaction:', error);
      return res.status(500).json({ error: 'Failed to add transaction' });
    }
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query('SELECT * FROM transactions WHERE user_id = (SELECT id FROM users WHERE email = $1)', [email]);
      return res.status(200).json(rows);
    } catch (error) {
      console.error('[Transactions API] Error fetching transactions:', error);
      return res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { transactionId, category, amount, description } = req.body;
  
      if (!transactionId || !category || !amount) {
        return res.status(400).json({ error: 'Transaction ID, category, and amount are required' });
      }
  
      const result = await pool.query(
        `UPDATE transactions
         SET category = $1, amount = $2, description = $3
         WHERE id = $4 AND user_id = (SELECT id FROM users WHERE email = $5)
         RETURNING *`,
        [category, amount, description || null, transactionId, email]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Transaction not found or not authorized to edit' });
      }
  
      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('[Transactions API] Error updating transaction:', error);
      return res.status(500).json({ error: 'Failed to update transaction' });
    }
  }
  
  if (req.method === 'DELETE') {
    const { transactionId } = req.query; // Get the transaction ID
    console.log('[Transactions API] Incoming DELETE request');
    console.log('[Transactions API] Transaction ID:', transactionId);
  
    try {
      const result = await pool.query(
        'DELETE FROM transactions WHERE id = $1 AND user_id = (SELECT id FROM users WHERE email = $2) RETURNING *',
        [transactionId, email]
      );
  
      if (result.rowCount === 0) {
        console.log('[Transactions API] No matching transaction found or not authorized');
        return res.status(404).json({ error: 'Transaction not found or not authorized to delete' });
      }
  
      console.log('[Transactions API] Transaction deleted successfully');
      return res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
      console.error('[Transactions API] Error deleting transaction:', error);
      return res.status(500).json({ error: 'Failed to delete transaction' });
    }
  }
  

  res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
  res.status(405).json({ error: 'Method Not Allowed' });
}
