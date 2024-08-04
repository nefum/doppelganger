import {
  DeleteAccountCard,
  EmailChangeForm,
  PasswordChangeForm,
  SubscriptionChangeForm,
} from "@/app/(userland)/user/forms.tsx";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Settings",
};

export default function AccountPage() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      <SubscriptionChangeForm />
      <EmailChangeForm />
      <PasswordChangeForm />
      <DeleteAccountCard />
    </div>
  );
}
