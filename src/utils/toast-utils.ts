// uri encoded string
type EncodedString = string;

interface ToastPrams {
  toastTitle: string;
  toastDescription?: string;
}

interface EncodedToastParams {
  encodedToastTitle: EncodedString;
  encodedToastDescription?: EncodedString;
}

export function encodeToastParams({
  toastTitle,
  toastDescription,
}: ToastPrams): EncodedToastParams {
  // URI encode the toast name
  const encodedToastTitle = encodeURIComponent(toastTitle);
  // check for a description
  const encodedToastDescription = toastDescription
    ? encodeURIComponent(toastDescription)
    : undefined;
  return { encodedToastTitle, encodedToastDescription };
}

export function encodeQueryParams({
  encodedToastTitle,
  encodedToastDescription,
}: EncodedToastParams): string {
  return `?toastTitle=${encodedToastTitle}${encodedToastDescription ? `&toastDescription=${encodedToastDescription}` : ""}`;
}

/**
 * Redirects the user (client-side) to a given URL and has a toast show up with the given message.
 * @param pathName
 * @param toastTitle The title of the toast
 * @param toastDescription The description of the toast; can be undefined
 */
export function clientSideRedirectWithToast(
  pathName: string,
  toastTitle: string,
  toastDescription?: string,
) {
  // client-side redirect
  const queryParams = encodeQueryParams(
    encodeToastParams({ toastTitle, toastDescription }),
  );
  window.location.href = `${pathName}${queryParams}`;
}

export function reloadWithToast({ toastTitle, toastDescription }: ToastPrams) {
  clientSideRedirectWithToast(
    window.location.pathname,
    toastTitle,
    toastDescription,
  );
}
