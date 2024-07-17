import { ReactNode } from "react";
// @ts-ignore -- this file is generated
import licensesJson from "./licenses.json";

export default function Licenses(): ReactNode {
  return (
    <ul className="shadcn-ul">
      {Object.entries(licensesJson).map(([name, license]) => {
        const licenses = license.licenses;
        if (licenses === "UNLICENSED") {
          // ignore our own package
          return;
        }
        return (
          <li key={name}>
            {name}: {licenses}
          </li>
        );
      })}
    </ul>
  );
}
