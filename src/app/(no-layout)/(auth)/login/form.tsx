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

export default function LoginForm() {
  return (
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
          <Input id="email" type="email" placeholder="m@example.com" required />
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
          <Input id="password" type="password" required />
        </div>
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full">
          Login
        </Button>
      </CardFooter>
    </Card>
  );
}
