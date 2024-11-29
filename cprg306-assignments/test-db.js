import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

(async () => {
  try {
    const email = 'dbuser@example.com';
    const password = 'securepassword';

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      console.log('No user found with this email');
    } else {
      const isValid = password === user.password; // Plaintext comparison
      if (isValid) {
        console.log('Login successful:', user);
      } else {
        console.log('Incorrect password');
      }
    }
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    pool.end();
  }
})();
