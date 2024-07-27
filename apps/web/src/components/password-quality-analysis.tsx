import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import type { ReactNode } from "react";
import { FaCheck, FaXmark } from "react-icons/fa6";

function getPasswordBars(passwordLength: number): React.ReactNode {
  if (passwordLength >= 12) {
    return (
      <>
        <div className="h-1 bg-green-400 dark:bg-green-500" />
        <div className="h-1 bg-green-400 dark:bg-green-500" />
        <div className="h-1 bg-green-400 dark:bg-green-500" />
        <div className="h-1 bg-green-400 dark:bg-green-500" />
      </>
    );
  } else if (passwordLength >= 8) {
    return (
      <>
        <div className="h-1 bg-green-400 dark:bg-green-500" />
        <div className="h-1 bg-green-400 dark:bg-green-500" />
        <div className="h-1 bg-green-400 dark:bg-green-500" />
        <div className="h-1 bg-gray-200 dark:bg-gray-600" />
      </>
    );
  } else if (passwordLength >= 6) {
    return (
      <>
        <div className="h-1 bg-orange-300 dark:bg-orange-400" />
        <div className="h-1 bg-orange-300 dark:bg-orange-400" />
        <div className="h-1 bg-gray-200 dark:bg-gray-600" />
        <div className="h-1 bg-gray-200 dark:bg-gray-600" />
      </>
    );
  } else if (passwordLength >= 1) {
    return (
      <>
        <div className="h-1 bg-red-400 dark:bg-red-500" />
        <div className="h-1 bg-gray-200 dark:bg-gray-600" />
        <div className="h-1 bg-gray-200 dark:bg-gray-600" />
        <div className="h-1 bg-gray-200 dark:bg-gray-600" />
      </>
    );
  } else {
    return (
      <>
        <div className="h-1 bg-gray-200 dark:bg-gray-600" />
        <div className="h-1 bg-gray-200 dark:bg-gray-600" />
        <div className="h-1 bg-gray-200 dark:bg-gray-600" />
        <div className="h-1 bg-gray-200 dark:bg-gray-600" />
      </>
    );
  }
}

export function PasswordQualityAnalysis({
  password: passwordAttempt,
  children,
  isOpen,
}: {
  password: string;
  children: ReactNode;
  isOpen: boolean;
}): ReactNode {
  const passwordLengthRangeBars = getPasswordBars(passwordAttempt.length);

  const passwordHasUpperCase = /[A-Z]/.test(passwordAttempt);
  const passwordHasLowerCase = /[a-z]/.test(passwordAttempt);
  const passwordHasNumber = /[0-9]/.test(passwordAttempt);
  const passwordHasSpecialCharacter =
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(passwordAttempt);

  return (
    <Popover open={isOpen} onOpenChange={(_: boolean) => {}}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2 p-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Must have at least 6 characters!
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {passwordLengthRangeBars}
          </div>
          <p>Your password needs...</p>
          <ul>
            <li className="mb-1 flex items-center">
              {passwordHasUpperCase ? <FaCheck /> : <FaXmark />}
              Upper case letters
            </li>
            <li className="mb-1 flex items-center">
              {passwordHasLowerCase ? <FaCheck /> : <FaXmark />}
              Lower case letters
            </li>
            <li className="mb-1 flex items-center">
              {passwordHasNumber ? <FaCheck /> : <FaXmark />}
              Numbers
            </li>
            <li className="mb-1 flex items-center">
              {passwordHasSpecialCharacter ? <FaCheck /> : <FaXmark />}
              Special characters
            </li>
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}
