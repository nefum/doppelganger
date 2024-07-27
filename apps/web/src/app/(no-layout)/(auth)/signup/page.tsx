import SignupForm from "@/app/(no-layout)/(auth)/signup/form.tsx";
import { DynamicSignInWithGoogleButton } from "@/components/google/signin-with-google-button.tsx";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <DynamicSignInWithGoogleButton text="signup_with" />
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
