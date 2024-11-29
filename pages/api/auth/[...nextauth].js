import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL, // Ensure this is set in your .env.local
});

export default NextAuth({
  debug: true,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const { email, password } = credentials;
      
          console.log('Authorize called with email:', email);
      
          const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
          const user = result.rows[0];
      
          console.log('Database query result:', user);
      
          if (!user) {
            console.error('No user found for email:', email);
            throw new Error('No user found');
          }
      
          if (password !== user.password) {
            console.error('Incorrect password for email:', email);
            throw new Error('Invalid credentials');
          }
      
          console.log('User authenticated successfully:', email);
          return { id: user.id, email: user.email };
        } catch (error) {
          console.error('Error during authentication:', error.message);
          throw error;
        }
      }
      
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      return session;
    },
  },
});
