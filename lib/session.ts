import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  return user;
}

export async function requireRole(role: string) {
  const user = await requireAuth();
  if (user.role !== role) {
    throw new Error(`Requires ${role} role`);
  }
  return user;
}

export async function requireAnyRole(roles: string[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new Error(`Requires one of these roles: ${roles.join(', ')}`);
  }
  return user;
}
