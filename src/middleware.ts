import { updateSession } from "@/utils/supabase/middleware.ts";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with or ending in:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     *
     * - kasmvnc (Kasm VNC paths; WS)
     * - jsmpeg (JSMPEG paths; WS)
     * - events (Events paths; accessed directly via a WS by the Redroid server)
     *
     * - monitoring (Sentry monitoring paths)
     *
     * - Any file extensions like .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|monitoring|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|.*kasmvnc$|.*jsmpeg$|.*events$).*)",
  ],
};
