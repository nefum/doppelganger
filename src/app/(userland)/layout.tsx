import NavbarButtons from "@/app/(userland)/navbar-buttons.tsx";
import { LogoMiniHero } from "@/components/logo.tsx";
import { Footer3 } from "@/components/relume/footer-3.tsx";
import { Navbar1 } from "@/components/relume/navbar-1.tsx";
import { ReactNode } from "react";
import {
  BiLogoFacebookCircle,
  BiLogoInstagram,
  BiLogoLinkedinSquare,
} from "react-icons/bi";
import { FaXTwitter } from "react-icons/fa6";

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
      <Footer3
        footerText="© 2024 Nefum LLC. All rights reserved."
        address={{
          label: "Address:",
          value: "7 Beverly Road, Livingston NJ, US, 07039",
        }}
        contact={{
          label: "Contact:",
          phone: "+1 (732) 893-7406",
          email: "doppelganger@regulad.xyz",
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
                title: "Premium",
                url: "/subscribe",
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
                title: "Contact",
                url: "/contact",
              },
            ],
          },
        ]}
        socialMediaLinks={[
          {
            url: "https://www.facebook.com/regulad00/",
            icon: <BiLogoFacebookCircle className="size-6" />,
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
    </>
  );
}
