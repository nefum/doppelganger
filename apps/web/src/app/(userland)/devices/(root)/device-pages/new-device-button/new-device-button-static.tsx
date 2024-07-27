import { Button, ButtonProps } from "@/components/ui/button.tsx";
import { clsx } from "clsx";
import { ReactNode } from "react";
import { RxPlus } from "react-icons/rx";

export function NewDeviceButtonStatic({
  className,
  variant,
  asChild,
  ...props
}: Readonly<{ className?: string } & ButtonProps>): ReactNode {
  return (
    <Button
      className={clsx("flex items-center gap-2", className)}
      asChild
      {...props}
    >
      <span>
        <RxPlus className="w-4 h-4" />{" "}
        {/*note: this renders a button compoennt with a plus icon, so it can't be a child of another button*/}
        Create New Device
      </span>
    </Button>
  );
}
