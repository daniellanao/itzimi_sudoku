import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // During build/prerender, env vars might not be available
    // Use placeholder values to allow build to complete
    // Runtime will fail if env vars are actually missing, which is expected
    return createClient(
      'https://placeholder.supabase.co',
      'placeholder-key'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Lazy initialization - only create client when first accessed
function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient();
  }
  return supabaseClient;
}

// Export the client with lazy initialization using Proxy
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = client[prop as keyof SupabaseClient];
    // Bind functions to maintain 'this' context
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
