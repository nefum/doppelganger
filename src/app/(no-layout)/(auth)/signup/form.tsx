"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import Link from "next/link";
import { Button } from "@/components/ui/button.tsx";

export default function SignupForm() {
  return (
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
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input id="confirm-password" type="password" required />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" />
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
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full">
          Sign Up
        </Button>
      </CardFooter>
    </Card>
  );
}
