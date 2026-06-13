import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { headers, cookies } from "next/headers";

export async function checkAuth() {
  try {
    // Build a minimal request-like object from Next.js headers/cookies
    // getToken works reliably on Vercel (uses JWT, not session DB)
    const cookieStore = await cookies();
    const headersList = await headers();
    
    const token = await getToken({
      req: {
        headers: Object.fromEntries(headersList.entries()),
        cookies: Object.fromEntries(
          cookieStore.getAll().map(c => [c.name, c.value])
        ),
      } as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return {
        error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        session: null
      };
    }

    // Return a session-like object from the JWT token
    const session = {
      user: {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        role: token.role as string,
      }
    };

    return { error: null, session };
  } catch (error) {
    console.error("Auth check error:", error);
    return {
      error: NextResponse.json({ error: "Auth check failed" }, { status: 401 }),
      session: null
    };
  }
}
