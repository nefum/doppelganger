"use client";

import { useEffectiveTheme } from "@/utils/hooks/use-effective-theme.ts";

/**
 * A component that renders either a dark or light component depending on the current theme.
 * @constructor
 */
export default function DarkLightComponent<T extends JSX.Element>({
  dark,
  light,
}: Readonly<{ dark: T; light: T }>): T {
  const theme = useEffectiveTheme(); // ssr safe

  switch (theme) {
    case "dark":
      return dark;
    default:
    case "light":
      return light;
  }
}
