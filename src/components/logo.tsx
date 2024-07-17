import { clsx } from "clsx";
import Image from "next/image";
import Link from "next/link";

function LogoIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <Image
      src="/logo.svg"
      alt="Doppelganger Logo"
      width={100}
      height={100}
      className={clsx(className, "dark-mode-invert")}
    />
  );
}

export function LogoMiniHero(): JSX.Element {
  return (
    <Link href={"/"} className="inline-flex items-center">
      <LogoIcon className="h-7 w-auto" />
      <span className="shadcn-h3 ml-1">Doppelganger</span>
    </Link>
  );
}

export function LogoBigHero({
  className,
}: Readonly<{ className?: string }>): JSX.Element {
  return (
    <div className={className}>
      <LogoIcon className="h-12 w-auto" />
      <h1 className="shadcn-h1 ml-1">Doppelganger</h1>
    </div>
  );
}
