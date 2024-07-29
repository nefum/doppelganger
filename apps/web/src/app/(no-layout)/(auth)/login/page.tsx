import LoginForm from "@/app/(no-layout)/(auth)/login/form.tsx";
import { DynamicSignInWithGoogleButton } from "@/components/google/signin-with-google-button.tsx";
import { Link } from "react-transition-progress/next";

export default function LoginPage() {
  return (
    <>
      <DynamicSignInWithGoogleButton text="signin_with" />
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
