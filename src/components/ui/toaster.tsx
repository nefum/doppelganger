"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function Toaster() {
  const { toasts, toast } = useToast();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.has("toastTitle")) {
      // url unencode the toast name
      const toastTitle = decodeURIComponent(searchParams.get("toastTitle")!);
      // check for a description
      const toastDescription = searchParams.has("toastDescription")
        ? decodeURIComponent(searchParams.get("toastDescription")!)
        : undefined;
      toast({
        title: toastTitle,
        description: toastDescription,
      });

      // client-side deletion of the search params
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("toastTitle");
      newSearchParams.delete("toastDescription");
      history.replaceState(
        {},
        "",
        `${location.pathname}${newSearchParams.toString() ? "?" : ""}${newSearchParams.toString()}`,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run once; we modify the search params
  }, []);

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
