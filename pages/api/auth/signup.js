// Import the Pool class from the pg library for PostgreSQL connection pooling
import { Pool } from 'pg';

// Create a new connection pool to the database using the connection string from the environment variables
const pool = new Pool({
    // Connection string to the PostgreSQL database
  connectionString: process.env.POSTGRES_URL,
});

// Define the API route handler
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Extract email and password from the request body
    const { email, password } = req.body;

    // Basic validation to ensure both email and password are provided
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' }); // Respond with a 400 Bad Request error
    }

    try {
      // Check if a user with the same email already exists in the database
      const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]); // Query the database with the provided email
      if (userExists.rows.length > 0) {
        // If the query returns any rows, the email is already registered
        // Respond with a 400 Bad Request error
        return res.status(400).json({ error: 'User already exists' });
      }

      // Insert the new user into the database with the provided email and password
      await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, password]);

      // Respond with a 201 Created status and a success message
      return res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      // Log the error and respond with a 500 Internal Server Error
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    // If the request method is not POST, respond with a 405 Method Not Allowed error
    // Specify allowed methods in the response headers
    res.setHeader('Allow', ['POST']);
    // Respond with an error message
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
