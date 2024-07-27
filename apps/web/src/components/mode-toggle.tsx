"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffectiveTheme } from "@/utils/hooks/use-effective-theme.ts";
import { ReactNode } from "react";

// https://ui.shadcn.com/docs/dark-mode/next
export function ModeToggle() {
  const { setTheme, theme: chosenTheme } = useTheme();
  const theme = useEffectiveTheme();

  // we can't do absolute because it clashes with the relume dropdown menu, so it unfortunately breaks this nice animation
  let themeButtonIcon: ReactNode;
  switch (theme) {
    case "dark":
      themeButtonIcon = (
        <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      );
      break;
    case "light":
      themeButtonIcon = (
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      );
      break;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" suppressHydrationWarning>
          {themeButtonIcon}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
