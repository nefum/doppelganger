// we use dotenv-expand to allow passing through environment variables through runtime;
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import { existsSync } from "node:fs";

export function loadEnvironment(): void {
  const envPath = "./.env.local";
  if (existsSync(envPath)) {
    console.log("loading environment variables from", envPath);
    expand(
      config({
        path: envPath,
      }),
    );
  }
}
