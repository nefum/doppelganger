import { LoggedInNavbarButtons } from "@/app/(userland)/logged-in-navbar-buttons.tsx";
import { ModeToggle } from "@/components/mode-toggle.tsx";
import { Button } from "@/components/ui/button.tsx";
import { createClient } from "@/utils/supabase/server.ts";
import Link from "next/link";
import { ReactNode } from "react";

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
