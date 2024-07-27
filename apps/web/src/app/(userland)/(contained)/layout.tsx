import { ReactNode } from "react";

export default function Layout({
  children,
}: Readonly<{ children: ReactNode }>): ReactNode {
  return <div className="container mx-auto px-4 py-12">{children}</div>;
}
