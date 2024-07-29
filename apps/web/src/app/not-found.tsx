// implementation note: i would like for this file to be in src/app/(userland)/(contained)/not-found.tsx, but next.js does not yet support having a not found element inside of () directories and inheriting their layouts

import {
  ConfiguredFooter,
  ConfiguredNavbar,
} from "@/app/(userland)/layout.tsx";
import { Button } from "@/components/ui/button.tsx";
import { LuArrowRight } from "react-icons/lu";
import { Link } from "react-transition-progress/next";

export default function NotFound() {
  return (
    <>
      <ConfiguredNavbar />
      <div className="container min-h-screen py-2">
        <h1 className="shadcn-h1 shadcn-h-spaced">Page not found</h1>
        <p className="shadcn-p">
          The page you were looking for does not exist.
        </p>
        <p className="shadcn-p">Please check the URL or try again later.</p>
        <div className="mt-2">
          <Button asChild>
            <Link href="/">
              Home <LuArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      <ConfiguredFooter />
    </>
  );
}
