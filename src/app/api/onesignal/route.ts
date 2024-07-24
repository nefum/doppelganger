import { ONESIGNAL_API_KEY } from "@/utils/onesignal/onesignal-server.ts";
import { createClient } from "@/utils/supabase/server.ts";
import { NextResponse } from "next/server";
import { createHmac } from "node:crypto";

export const dynamic = "force-dynamic";

export interface OneSignalHashReturn {
  externalIdHash?: string;
  emailHash?: string;
  phoneHash?: string;
}

/**
 * Returns the ExternalID (Supabase UUID) and email hashes required to register a subscription with OneSignal.
 * @constructor
 */
export async function GET(): Promise<NextResponse<OneSignalHashReturn>> {
  const supabaseClient = createClient();

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {},
      {
        status: 401,
      },
    );
  }

  const { id, email, phone } = user;

  const externalIdHash = createHmac("sha256", ONESIGNAL_API_KEY)
    .update(id)
    .digest("hex");

  const emailHash = email
    ? createHmac("sha256", ONESIGNAL_API_KEY).update(email).digest("hex")
    : undefined;

  const phoneHash = phone
    ? createHmac("sha256", ONESIGNAL_API_KEY).update(phone).digest("hex")
    : undefined;

  return NextResponse.json(
    {
      externalIdHash: externalIdHash,
      emailHash: emailHash,
      phoneHash: phoneHash,
    },
    {
      status: 200,
    },
  );
}
