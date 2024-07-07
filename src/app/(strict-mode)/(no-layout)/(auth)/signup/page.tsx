import Link from "next/link";
import SignupForm from "@/app/(strict-mode)/(no-layout)/(auth)/signup/form.tsx";

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
