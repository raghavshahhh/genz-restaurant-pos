import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-config";
import { NextResponse } from "next/server";

export async function checkAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null
    };
  }
  
  return { error: null, session };
}
