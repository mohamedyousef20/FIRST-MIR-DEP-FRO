import { getServerSession as originalGetServerSession } from 'next-auth';
import { authOptions } from './app/api/auth/[...nextauth]/route';

export const getServerSession = () => {
  return originalGetServerSession(authOptions);
};

export const getCurrentUser = async () => {
  const session = await getServerSession();
  return session?.user || null;
};

export const requireAuth = async () => {
  const session = await getServerSession();
  if (!session) {
    throw new Error('Not authenticated');
  }
  return session.user;
};

export const requireRole = async (requiredRole: 'admin' | 'seller' | 'user' | 'driver') => {
  const user = await requireAuth();
  
  if (user.role !== requiredRole) {
    throw new Error(`Insufficient permissions. Required role: ${requiredRole}`);
  }
  
  return user;
};
