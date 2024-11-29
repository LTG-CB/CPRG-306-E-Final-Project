import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { Pool } from 'pg';

// Create a connection pool for PostgreSQL
const pool = new Pool({
  // Database connection string from environment variables
  connectionString: process.env.POSTGRES_URL,
});

// Configure NextAuth for authentication
export default NextAuth({
  // Enable debug mode for easier debugging during development
  debug: true,
  providers: [
    CredentialsProvider({
      // Name of the authentication provider
      name: 'Credentials',
      credentials: {
        // Field for email input
        email: { label: 'Email', type: 'text' },
        // Field for password input
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const { email, password } = credentials;
          console.log('Authorize called with email:', email);

          // Query the database to find the user by email
          const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
          const user = result.rows[0];
          console.log('Database query result:', user);

          // Check if the user exists
          if (!user) {
            console.error('No user found for email:', email);
            // Return an error if no user is found
            throw new Error('No user found');
          }

          // Check if the provided password matches
          if (password !== user.password) {
            console.error('Incorrect password for email:', email);
            // Return an error for invalid credentials
            throw new Error('Invalid credentials');
          }

          console.log('User authenticated successfully:', email);
          // Return the authenticated user
          return { id: user.id, email: user.email };
        } catch (error) {
          console.error('Error during authentication:', error.message);
          // Rethrow the error for logging/debugging
          throw error;
        }
      },
    }),
  ],
  session: {
    // Use JSON Web Tokens (JWT) for session management
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user details to the JWT token
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      // Attach user details to the session object
      session.user.id = token.id;
      session.user.email = token.email;
      return session;
    },
  },
});
