import { LoggedInNavbarButtons } from "@/app/(userland)/logged-in-navbar-buttons.tsx";
import { ModeToggle } from "@/components/mode-toggle.tsx";
import { Button } from "@/components/ui/button.tsx";
import { createClient } from "@/utils/supabase/server.ts";
import { ReactNode } from "react";
import { Link } from "react-transition-progress/next";

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
