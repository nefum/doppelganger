"use client";

import {
  login,
  type LoginFormState,
} from "@/app/(strict-mode)/(no-layout)/(auth)/login/actions.ts";
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
import Link from "next/link";
import { useFormState } from "react-dom";

const INITIAL_LOGIN_FORM_STATE = {
  message: null,
  errors: {},
} satisfies LoginFormState;

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
                href="#"
                className="text-sm font-medium text-primary hover:underline"
                prefetch={false}
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
          <Button type="submit" className="w-full">
            Login
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
