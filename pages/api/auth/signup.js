import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    try {
      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (rows.length) return res.status(400).json({ error: 'User already exists' });

      await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, password]);
      return res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      console.error('[Signup API] Error:', error.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).json({ error: 'Method Not Allowed' });
}
