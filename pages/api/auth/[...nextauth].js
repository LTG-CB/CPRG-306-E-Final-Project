import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize({ email, password }) {
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = rows[0];
        if (user && user.password === password) return { id: user.id, email: user.email };
        throw new Error('Invalid credentials');
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Attach the user ID
        token.email = user.email; // Attach the user email
      }
      console.log('[NextAuth] JWT Callback - After:', token);
      return token;
    },
    async session({ session, token }) {
      session.user = {
        email: token.email,
        id: token.id, // Ensure user ID is added to the session
      };
      console.log('[NextAuth] Session Callback - After:', session);
      return session;
    },
  },
});
