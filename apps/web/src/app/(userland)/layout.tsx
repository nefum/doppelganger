import NavbarButtons from "@/app/(userland)/navbar-buttons.tsx";
import { LogoMiniHero } from "@/components/logo.tsx";
import { Footer3 } from "@/components/relume/footer-3.tsx";
import { Navbar1 } from "@/components/relume/navbar-1.tsx";
import { ReactNode } from "react";
import { BiLogoInstagram, BiLogoLinkedinSquare } from "react-icons/bi";
import { FaDiscord, FaXTwitter } from "react-icons/fa6";
import { ProgressBar } from "react-transition-progress";

export function ConfiguredNavbar() {
  return (
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
  );
}

export function ConfiguredFooter() {
  return (
    <Footer3
      footerText="© 2024 Nefum LLC. All rights reserved."
      address={{
        label: "Address:",
        value: "7 Beverly Road, Livingston NJ, US, 07039",
      }}
      contact={{
        label: "Contact:",
        phone: "+1 (732) 893-7406",
        email: "contact@nefum.com",
      }}
      columnLinks={[
        {
          links: [
            {
              title: "About Us",
              url: "/about",
            },
            {
              title: "Contact Us",
              url: "/contact",
            },
            {
              title: "Support",
              url: "/support",
            },
            {
              title: "Contact",
              url: "/contact",
            },
          ],
        },
        {
          links: [
            {
              title: "Device Types",
              url: "/types",
            },
            {
              title: "Requirements",
              url: "/tech",
            },
            {
              title: "Open Source",
              url: "/opensource",
            },
            {
              title: "Premium",
              url: "/subscribe",
            },
            {
              title: "Multiview",
              url: "/multiview",
            },
          ],
        },
      ]}
      socialMediaLinks={[
        {
          url: "https://discord.gg/k7TDVvRkSq",
          icon: <FaDiscord className="size-6" />,
        },
        {
          url: "https://www.instagram.com/pewahle/",
          icon: <BiLogoInstagram className="size-6" />,
        },
        {
          url: "https://x.com/regulad_",
          icon: <FaXTwitter className="size-6 p-0.5" />,
        },
        {
          url: "https://www.linkedin.com/in/parker-wahle/",
          icon: <BiLogoLinkedinSquare className="size-6" />,
        },
      ]}
      footerLinks={[
        {
          title: "Terms of Service",
          url: "/tos",
        },
        {
          title: "Privacy Policy",
          url: "/privacy",
        },
        {
          title: "Licenses",
          url: "/licenses",
        },
      ]}
    />
  );
}

export default function Layout({
  children,
}: Readonly<{ children: ReactNode }>): ReactNode {
  return (
    <>
      <ProgressBar className="fixed h-1 shadow-lg shadow-sky-500/20 bg-sky-500 top-0" />
      <ConfiguredNavbar />
      <div className="min-h-screen">{children}</div>
      <ConfiguredFooter />
    </>
  );
}
