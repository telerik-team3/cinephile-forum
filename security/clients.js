// Signs in to the real Supabase database as one of the test accounts in .env.local.
// Every account gets its own client, so their sessions never mix.
import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

// A client that is not signed in, like a visitor.
export function anonymousClient() {
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// role is "USER_A", "USER_B", "BLOCKED" or "ADMIN".
export async function signIn(role) {
  const email = process.env[`SECURITY_${role}_EMAIL`];
  const password = process.env[`SECURITY_${role}_PASSWORD`];

  if (!email || !password) {
    throw new Error(
      `SECURITY_${role}_EMAIL and SECURITY_${role}_PASSWORD must be set in .env.local`,
    );
  }

  const client = anonymousClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error(`Could not sign in as ${role}: ${error.message}`);
  }

  return { client, userId: data.user.id };
}
