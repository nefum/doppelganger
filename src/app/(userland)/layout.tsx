import NavbarButtons from "@/app/(userland)/navbar-buttons.tsx";
import { LogoMiniHero } from "@/components/logo.tsx";
import { Footer3 } from "@/components/relume/footer-3.tsx";
import { Navbar1 } from "@/components/relume/navbar-1.tsx";
import { ReactNode } from "react";

export default function Layout({
  children,
}: Readonly<{ children: ReactNode }>): ReactNode {
  return (
    <>
      <Navbar1
        logo={<LogoMiniHero />}
        navLinks={[
          {
            url: "/devices",
            title: "My Devices",
          },
          {
            url: "/about",
            title: "About Us",
          },
          {
            url: "/subscribe",
            title: "Premium",
          },
        ]}
        buttons={<NavbarButtons />}
      />
      <div className="min-h-screen">{children}</div>
      <Footer3 />
    </>
  );
}
