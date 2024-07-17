// you may notice that this file uses client-side supabase instead of server-side supabase, which is weird for this project
// this is because claude wrote this file and i do not care
"use client";

import { zodPassword } from "@/app/(no-layout)/(auth)/constants.ts";
import { PasswordQualityAnalysis } from "@/components/password-quality-analysis.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { createClient } from "@/utils/supabase/client.ts";
import {
  clientSideRedirectWithToast,
  clientSideReloadWithToast,
} from "@/utils/toast-utils.ts";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { LuLoader2 } from "react-icons/lu";
import { z } from "zod";
import handleDeleteAccount from "./actions.ts";

export function EmailChangeForm() {
  const supabaseClient = createClient();
  const { toast } = useToast();

  const [newEmail, setNewEmail] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");

  useEffect(() => {
    async function fetchEmail() {
      const {
        data: { user },
        error,
      } = await supabaseClient.auth.getUser();
      if (error) {
        console.error("Error fetching email:", error.message);
        return;
      }
      setCurrentEmail(user!.email ?? "example@example.com");
    }

    fetchEmail();
  }, [supabaseClient.auth]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const { success: emailValid } = await z.string().email().spa(newEmail);

    if (!emailValid) {
      console.error("Invalid email");
      toast({
        title: "Invalid Email",
        description: "The email you entered is invalid.",
      });
      return;
    }

    const { error } = await supabaseClient.auth.updateUser({ email: newEmail });

    if (error) {
      console.error("Error updating email:", error.message);
      toast({
        title: "Error Updating Email",
        description: `There was an error updating your email: ${error.message}`,
      });
    } else {
      clientSideReloadWithToast({
        toastTitle: "Email Updated",
        toastDescription:
          "Your email has been successfully updated. Please check your inbox for a verification email.",
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Email Address</CardTitle>
        <CardDescription>Change your email address</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="currentEmail">Current Email</Label>
              <Input id="currentEmail" value={currentEmail} disabled />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="newEmail">New Email</Label>
              <Input
                id="newEmail"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email"
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit}>Update Email</Button>
      </CardFooter>
    </Card>
  );
}

export function PasswordChangeForm() {
  const supabaseClient = createClient();
  const { toast } = useToast();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const { success } = await zodPassword.safeParseAsync(newPassword);
    if (!success) {
      console.error("Invalid password");
      toast({
        title: "Invalid Password",
        description: "Your password does not meet the requirements.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      console.error("New passwords do not match");
      toast({
        title: "Passwords do not match",
        description:
          "The new passwords you entered do not match. Please try again.",
      });
      return;
    }

    const { error } = await supabaseClient.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("Error updating password:", error.message);
      toast({
        title: "Error Updating Password",
        description: `There was an error updating your password: ${error.message}`,
      });
    } else {
      clientSideReloadWithToast({
        toastTitle: "Password Updated",
        toastDescription: "Your password has been successfully updated.",
      });
    }
  };

  const passwordQualityAnalysisContainerRef = useRef<HTMLDivElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const open = () => setPopoverOpen(true);
  const close = () => setPopoverOpen(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        passwordQualityAnalysisContainerRef.current &&
        !passwordQualityAnalysisContainerRef.current.contains(
          event.target as Node,
        )
      ) {
        close();
      }
    }

    function handleTabPress(event: KeyboardEvent) {
      if (event.key === "Tab") {
        close();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleTabPress);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleTabPress);
    };
  }, []);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>Change your password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div
              ref={passwordQualityAnalysisContainerRef}
              className="flex flex-col space-y-1.5"
            >
              <Label htmlFor="newPassword">New Password</Label>
              <PasswordQualityAnalysis
                password={newPassword}
                isOpen={popoverOpen}
              >
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  onFocus={open}
                />
              </PasswordQualityAnalysis>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit}>Update Password</Button>
      </CardFooter>
    </Card>
  );
}

export function DeleteAccountCard() {
  const [accountDeleting, setAccountDeleting] = useState(false);
  const { toast } = useToast();

  const statefulHandleDeleteAccount = useMemo(
    () => async () => {
      setAccountDeleting(true);
      try {
        await handleDeleteAccount();
      } catch (error: any) {
        console.error("Error deleting account:", error.message);
        toast({
          title: "Error Deleting Account",
          description: `There was an error deleting your account: ${error.message}`,
        });
      }
      clientSideRedirectWithToast(
        "/",
        "Account Deleted",
        "Your account has been successfully deleted.",
      );
      setAccountDeleting(false);
    },
    [toast],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delete Account</CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete Account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers. Deleting your
                account may take a while.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={accountDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={statefulHandleDeleteAccount}
                disabled={accountDeleting}
              >
                Delete Account
                {accountDeleting && (
                  <LuLoader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
