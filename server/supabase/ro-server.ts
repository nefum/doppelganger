import { createServerClient } from "@supabase/ssr";
import { IncomingMessage } from "node:http";

interface Cookie {
  name: string;
  value: string;
}

// we can't use next/headers here since this is pre-next loading; so we need to do it all manually
// don't use this everywhere because we don't get the speedup that next/headers (SWC compiled) gives us
export function createClient(req: IncomingMessage) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll(): Cookie[] {
          if (!req.headers.cookie) return [];
          return req.headers.cookie.split("; ").map((cookie) => {
            const [name, value] = cookie.split("=");
            return { name, value };
          });
        },
        // we don't implement setting cookies in the custom server
      },
    },
  );
}
