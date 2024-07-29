"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { createClient } from "@/utils/supabase/client.ts";
import { User } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { LuChevronDown, LuUser } from "react-icons/lu";
import { Link } from "react-transition-progress/next";

async function getAvatarUrl(user: User): Promise<string | null> {
  if (user.user_metadata.avatar_url) {
    return user.user_metadata.avatar_url;
  } else if (user.email) {
    // Convert email to Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(user.email);
    // Hash the email using SHA-256
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    // Convert the buffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return `https://www.gravatar.com/avatar/${hashHex}`;
  } else {
    return null;
  }
}

export function LoggedInNavbarButtons({
  user,
}: Readonly<{ user: User }>): ReactNode {
  const email = user.email ?? "user@example.com";
  const firstTwoChars = email.slice(0, 2).toUpperCase();
  const supabaseClient = createClient();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  useEffect(() => {
    getAvatarUrl(user).then(setAvatarUrl);
  }, [user]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="inline-flex items-center">
          <Avatar>
            {avatarUrl && <AvatarImage src={avatarUrl} alt={email} />}
            <AvatarFallback>{firstTwoChars}</AvatarFallback>
          </Avatar>
          <LuChevronDown className="ml-1 w-4 h-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link href={"/user"}>
            <LuUser className="w-4 h-4 mr-2" />
            User Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-500"
          onClick={() => {
            supabaseClient.auth
              .signOut()
              .then(() => (window.location.href = "/login"));
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
