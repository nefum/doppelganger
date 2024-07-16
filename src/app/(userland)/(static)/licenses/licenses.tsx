// @ts-ignore -- this file is generated
import { ReactNode } from "react";
import licensesJson from "./licenses.json";

export default function Licenses(): ReactNode {
  return (
    <ul className="shadcn-ul">
      {Object.entries(licensesJson).map(([name, license]) => (
        <li key={name}>
          {name}: {license.licenses}
        </li>
      ))}
    </ul>
  );
}
