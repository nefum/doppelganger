"use client";

import {
  signup,
  type SignupFormState,
} from "@/app/(no-layout)/(auth)/signup/actions.ts";
import PasswordPopover from "@/components/password-popover.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import Link from "next/link";
import { useState } from "react";
import { useFormState } from "react-dom";

const initialState = { message: null, errors: {} } satisfies SignupFormState;

export default function SignupForm() {
  const [state, dispatch] = useFormState(signup, initialState);
  const [enteredPassword, setEnteredPassword] = useState("");

  return (
    <form action={dispatch} aria-describedby="overall-error">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
          <CardDescription>
            Enter your details to create an account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              name="email"
              id="email"
              type="email"
              aria-describedby="email-error"
              placeholder="me@example.com"
              required
            />
          </div>
          <div aria-atomic="true" aria-live="polite" id="email-error">
            {state.errors?.email?.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
          </div>
          <PasswordPopover password={enteredPassword}>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                name="password"
                id="password"
                aria-describedby="password-error"
                type="password"
                required
                onChange={(e) => {
                  setEnteredPassword(e.target.value);
                }}
              />
            </div>
          </PasswordPopover>
          <div aria-atomic="true" aria-live="polite" id="password-error">
            {state.errors?.password?.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              name="password2"
              id="confirm-password"
              aria-describedby="password2-error"
              type="password"
              required
            />
          </div>
          <div aria-atomic="true" aria-live="polite" id="password2-error">
            {state.errors?.password2?.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" name="terms" aria-describedby="terms-error" />
            <Label htmlFor="terms" className="text-sm font-medium">
              I agree to the{" "}
              <Link
                href="#"
                className="text-primary hover:underline"
                prefetch={false}
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="#"
                className="text-primary hover:underline"
                prefetch={false}
              >
                Privacy Policy
              </Link>
            </Label>
          </div>
          <div aria-atomic="true" aria-live="polite" id="terms-error">
            {state.errors?.terms?.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
          </div>
          <div aria-atomic="true" aria-live="polite" id="overall-error">
            {state.message ? (
              <p className="mt-2 text-sm text-red-500">{state.message}</p>
            ) : null}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
