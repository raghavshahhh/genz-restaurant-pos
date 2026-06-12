import { getServerSession } from "next-auth";

/**
 * Get the current session for server-side protection
 * Pass your authOptions from [...nextauth]/route.ts
 */
export async function getSession(authOptions: any) {
  return await getServerSession(authOptions);
}

/**
 * Protect an API route - returns the session if authenticated, throws error otherwise
 */
export async function requireAuth(authOptions: any) {
  const session = await getSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Check if user has a specific role (for future RBAC)
 */
export async function requireRole(authOptions: any, role: string) {
  const session = await getSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  // For now, all authenticated users have access
  // In future, you can check session.user.role or similar
  return session;
}