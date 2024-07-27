import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type ThemeTypes = "dark" | "light";

export function useEffectiveTheme(): ThemeTypes {
  const { theme: chosenThemeRaw } = useTheme();
  const chosenTheme = chosenThemeRaw as "dark" | "light" | "system" | undefined;
  const defaultTheme =
    ((chosenTheme === "system" ? "light" : chosenTheme) as ThemeTypes &
      undefined) ?? "light"; // "dark" | "light"

  const [effectiveTheme, setEffectiveTheme] =
    useState<ThemeTypes>(defaultTheme);
  useEffect(() => {
    const systemIsDarkMode = matchMedia("(prefers-color-scheme: dark)");
    if (chosenTheme === "system") {
      setEffectiveTheme(systemIsDarkMode.matches ? "dark" : "light");
    } else {
      setEffectiveTheme(defaultTheme);
    }
  }, [chosenTheme, defaultTheme]);

  return effectiveTheme;
}
