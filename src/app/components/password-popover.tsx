"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import { type ReactNode, useState } from "react";
import { FaCheck, FaXmark } from "react-icons/fa6";

export default function PasswordPopover({
  password: passwordAttempt,
  children,
}: {
  password: string;
  children: ReactNode;
}): ReactNode {
  let passwordLengthRangeBars: ReactNode;
  const passwordLength = passwordAttempt.length;
  if (passwordLength >= 12) {
    passwordLengthRangeBars = (
      <>
        <div className="h-1 bg-green-400 dark:bg-green-500" />
        <div className="h-1 bg-green-400 dark:bg-green-500" />
        <div className="h-1 bg-green-400 dark:bg-green-500" />
        <div className="h-1 bg-green-400 dark:bg-green-500" />
      </>
    );
  } else if (passwordLength >= 8) {
    passwordLengthRangeBars = (
      <>
        <div className="h-1 bg-green-400 dark:bg-green-500" />
        <div className="h-1 bg-green-400 dark:bg-green-500" />
        <div className="h-1 bg-green-400 dark:bg-green-500" />
        <div className="h-1 bg-gray-200 dark:bg-gray-600" />
      </>
    );
  } else if (passwordLength >= 6) {
    passwordLengthRangeBars = (
      <>
        <div className="h-1 bg-orange-300 dark:bg-orange-400" />
        <div className="h-1 bg-orange-300 dark:bg-orange-400" />
        <div className="h-1 bg-gray-200 dark:bg-gray-600" />
        <div className="h-1 bg-gray-200 dark:bg-gray-600" />
      </>
    );
  } else if (passwordLength >= 1) {
    passwordLengthRangeBars = (
      <>
        <div className="h-1 bg-red-400 dark:bg-red-500" />
        <div className="h-1 bg-gray-200 dark:bg-gray-600" />
        <div className="h-1 bg-gray-200 dark:bg-gray-600" />
        <div className="h-1 bg-gray-200 dark:bg-gray-600" />
      </>
    );
  } else {
    passwordLengthRangeBars = (
      <>
        <div className="h-1 bg-gray-200 dark:bg-gray-600" />
        <div className="h-1 bg-gray-200 dark:bg-gray-600" />
        <div className="h-1 bg-gray-200 dark:bg-gray-600" />
        <div className="h-1 bg-gray-200 dark:bg-gray-600" />
      </>
    );
  }

  const passwordHasUpperCase = /[A-Z]/.test(passwordAttempt);
  const passwordHasLowerCase = /[a-z]/.test(passwordAttempt);
  const passwordHasNumber = /[0-9]/.test(passwordAttempt);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  function open() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        asChild
        onClick={(e) => {
          e.preventDefault();
        }}
        onMouseEnter={open}
        onMouseLeave={close}
      >
        {children}
      </PopoverTrigger>
      <PopoverContent onMouseEnter={open} onMouseLeave={close}>
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
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}
