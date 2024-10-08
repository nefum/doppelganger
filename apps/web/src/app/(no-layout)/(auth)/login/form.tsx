"use client";

import {
  login,
  type LoginFormState,
} from "@/app/(no-layout)/(auth)/login/actions.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { useFormState, useFormStatus } from "react-dom";
import { LuLoader2 } from "react-icons/lu";
import { Link } from "react-transition-progress/next";

const INITIAL_LOGIN_FORM_STATE = {
  message: null,
  errors: {},
} satisfies LoginFormState;

function LoginButton() {
  const isPending = useFormStatus().pending;

  return (
    <Button type="submit" className="w-full" disabled={isPending}>
      Login
      {isPending && <LuLoader2 className="ml-2 h-4 w-4 animate-spin" />}
    </Button>
  );
}

export default function LoginForm() {
  const [state, dispatch] = useFormState(login, INITIAL_LOGIN_FORM_STATE);

  return (
    <form action={dispatch} aria-describedby="overall-error">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Welcome back!</CardTitle>
          <CardDescription>
            Enter your email and password to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              name="email"
              type="email"
              id="email"
              placeholder="me@example.com"
              aria-describedby="email-error"
              required
            />
            <div aria-atomic="true" aria-live="polite" id="email-error">
              {state.errors?.email?.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              aria-describedby="password-error"
              required
            />
            <div aria-atomic="true" aria-live="polite" id="password-error">
              {state.errors?.password?.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
            </div>
          </div>
          <div aria-atomic="true" aria-live="polite" id="overall-error">
            {state.message ? (
              <p className="mt-2 text-sm text-red-500">{state.message}</p>
            ) : null}
          </div>
        </CardContent>
        <CardFooter>
          <LoginButton />
        </CardFooter>
      </Card>
    </form>
  );
}
