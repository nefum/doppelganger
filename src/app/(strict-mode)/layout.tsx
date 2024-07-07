import { ReactNode, StrictMode } from "react";

export default function Layout({
  children,
}: Readonly<{ children: ReactNode }>): ReactNode {
  return <StrictMode>{children}</StrictMode>;
}
