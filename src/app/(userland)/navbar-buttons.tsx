import { ModeToggle } from "@/components/mode-toggle.tsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { createClient } from "@/utils/supabase/server.ts";
import { User } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { createHash } from "node:crypto";
import { ReactNode } from "react";
import { LuChevronDown, LuUser } from "react-icons/lu";

function LoggedOutNavbarButtons(): ReactNode {
  return (
    <>
      <Button variant="secondary" asChild>
        <Link href={"/login"}>Login</Link>
      </Button>
      <Button variant="default" asChild>
        <Link href={"/signup"}>Sign Up</Link>
      </Button>
    </>
  );
}

function LoggedInNavbarButtons({ user }: Readonly<{ user: User }>): ReactNode {
  const email = user.email ?? "user@example.com";
  const firstTwoChars = email.slice(0, 2).toUpperCase();

  let avatarUrl: string | null;
  if (user.user_metadata.avatar_url) {
    avatarUrl = user.user_metadata.avatar_url;
  } else if (user.email) {
    // get gravatar email
    const email = user.email;
    const hash = createHash("sha256").update(email).digest("hex");
    avatarUrl = `https://www.gravatar.com/avatar/${hash}`;
  } else {
    avatarUrl = null;
  }

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
        <DropdownMenuItem className="text-red-500">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default async function NavbarButtons() {
  const supabaseClient = createClient();
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  let userButtons: ReactNode;
  if (user) {
    userButtons = <LoggedInNavbarButtons user={user} />;
  } else {
    userButtons = <LoggedOutNavbarButtons />;
  }

  return (
    <>
      {userButtons}
      <ModeToggle />
    </>
  );
}
