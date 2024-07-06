import { login, signup } from "../actions.ts";
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
import Link from "next/link";
import { Button } from "@/components/ui/button.tsx";
import LoginForm from "@/app/(no-layout)/(auth)/login/form.tsx";

export default function LoginPage() {
  return (
    <>
      <LoginForm />
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-primary hover:underline"
          prefetch={false}
        >
          Sign up
        </Link>
      </div>
    </>
  );
}
