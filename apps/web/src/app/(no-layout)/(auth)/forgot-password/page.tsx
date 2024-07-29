import ForgotPasswordForm from "@/app/(no-layout)/(auth)/forgot-password/form.tsx";
import { Link } from "react-transition-progress/next";

export default function Page() {
  return (
    <>
      <ForgotPasswordForm />
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
