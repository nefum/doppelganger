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
import SignupForm from "@/app/(no-layout)/(auth)/signup/form.tsx";

export default function Page() {
  return (
    <>
      <SignupForm />
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
          prefetch={false}
        >
          Log in
        </Link>
      </div>
    </>
  );
}
