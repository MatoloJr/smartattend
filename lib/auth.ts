import { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import User from '@/models/User';
import { connectToDatabase } from './db';

// Extend the User type to include additional fields
declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
    name: string;
    institutionId: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      institutionId: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password');
        }

        await connectToDatabase();
        
        // Find user by email
        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        
        if (!user || !user.isActive) {
          throw new Error('Invalid credentials or account disabled');
        }

        // Check password
        const isMatch = await user.comparePassword(credentials.password);
        if (!isMatch) {
          throw new Error('Invalid credentials');
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          institutionId: user.institutionId.toString(),
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.institutionId = user.institutionId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.institutionId = token.institutionId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
  debug: process.env.NODE_ENV === 'development',
};

export const getServerAuthSession = () => {
  return getServerSession(authOptions);
};
