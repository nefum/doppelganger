import LoginForm from "@/app/(no-layout)/(auth)/login/form.tsx";
import Link from "next/link";

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