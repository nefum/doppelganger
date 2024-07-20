import allRedroidImages from "%/device-info/redroid-images.ts";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { ReactNode } from "react";
import { FaAndroid } from "react-icons/fa6";
import { LuCrown } from "react-icons/lu";

function PremiumButton() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex place-items-center">
          <LuCrown className="mr-1 h-4 w-4" />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        A premium plan is required to use this image.
      </TooltipContent>
    </Tooltip>
  );
}

export default function DeviceTypes(): ReactNode {
  return (
    <ul className="shadcn-ul">
      {allRedroidImages
        .filter((redroidImage) => redroidImage.usable)
        .map((redroidImage) => (
          <li key={redroidImage.imageName}>
            <div className="inline-flex">
              <div className="flex items-center mr-2">
                <div>
                  <FaAndroid className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h4 className="shadcn-h4 inline-flex">
                  {redroidImage.premium && <PremiumButton />}
                  {redroidImage.name}
                </h4>
                <p>{redroidImage.description}</p>
              </div>
            </div>
          </li>
        ))}
    </ul>
  );
}
