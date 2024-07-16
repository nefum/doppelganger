import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toTitleCase } from "@/utils/misc.ts";
import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import { headers } from "next/headers";
import UAParser from "ua-parser-js";
import packageJson from "../../../../../package.json";

const BROWSERS_CONFIG = packageJson.browserslist;

function parseVersion(versionString: string): number {
  return parseInt(versionString.split(".")[0], 10);
}

function getMinVersionForBrowser(browserName: string): number | null {
  const result = BROWSERS_CONFIG.find((config) =>
    config.toLowerCase().startsWith(browserName.toLowerCase()),
  );
  return result ? parseVersion(result.split(" ")[1]) : null;
}

export function SupportedBrowsersList() {
  return (
    <ul className="list-disc list-inside">
      {BROWSERS_CONFIG.map((browser) => (
        <li key={browser.split(" ")[0]}>{toTitleCase(browser)}</li>
      ))}
    </ul>
  );
}

export default function BrowserCheckAlert() {
  const headersList = headers();
  const userAgent = headersList.get("user-agent") || "";

  const parser = new UAParser(userAgent);
  const browserInfo = parser.getResult().browser;

  let browserCodeName = browserInfo.name;

  if (browserInfo.name === "Mobile Safari") {
    browserCodeName = "Safari";
  }

  const minVersion = getMinVersionForBrowser(browserCodeName ?? "Unknown");
  const isBrowserCompatible =
    minVersion !== null &&
    parseVersion(browserInfo.version ?? "0.0.1") >= minVersion;

  return (
    <Alert variant={isBrowserCompatible ? "default" : "destructive"}>
      {isBrowserCompatible ? (
        <CheckCircledIcon className="h-4 w-4" />
      ) : (
        <CrossCircledIcon className="h-4 w-4" />
      )}
      <AlertTitle>Browser Compatibility Check</AlertTitle>
      <AlertDescription>
        {isBrowserCompatible
          ? `Your browser (${browserInfo.name} ${browserInfo.version}) is compatible.`
          : `Your browser (${browserInfo.name} ${browserInfo.version}) needs an update.`}
      </AlertDescription>
    </Alert>
  );
}
