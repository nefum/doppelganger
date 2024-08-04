type UriEncodedString = string;

interface PlaintextToastParams {
  title: string;
  description?: string;
}

interface EncodedToastParams {
  encodedToastTitle: UriEncodedString;
  encodedToastDescription?: UriEncodedString;
}

export function encodeToastParams({
  title,
  description,
}: PlaintextToastParams): EncodedToastParams {
  // URI encode the toast name
  const encodedToastTitle = encodeURIComponent(title);
  // check for a description
  const encodedToastDescription = description
    ? encodeURIComponent(description)
    : undefined;
  return { encodedToastTitle, encodedToastDescription };
}

export function encodeQueryParams({
  encodedToastTitle,
  encodedToastDescription,
}: EncodedToastParams): string {
  return `?toastTitle=${encodedToastTitle}${encodedToastDescription ? `&toastDescription=${encodedToastDescription}` : ""}`;
}

export function getQueryForToast(params: PlaintextToastParams): string {
  const encodedToastParams = encodeToastParams(params);
  return encodeQueryParams(encodedToastParams);
}

/**
 * Redirects the user (client-side) to a given URL and has a toast show up with the given message.
 * @param pathName
 * @param toast
 */
export function clientSideRedirectWithToast(
  pathName: string,
  toast: PlaintextToastParams,
) {
  // client-side redirect
  const queryParams = encodeQueryParams(encodeToastParams(toast));
  window.location.href = `${pathName}${queryParams}`;
}

export function clientSideReloadWithToast(toast: PlaintextToastParams) {
  clientSideRedirectWithToast(window.location.pathname, toast);
}
