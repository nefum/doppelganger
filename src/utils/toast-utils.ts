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
  // URI encode the toast name
  const encodedToastTitle = encodeURIComponent(toastTitle);
  // check for a description
  const encodedToastDescription = toastDescription
    ? encodeURIComponent(toastDescription)
    : undefined;
  // client-side redirect
  window.location.href = `${pathName}?toastTitle=${encodedToastTitle}${
    encodedToastDescription
      ? `&toastDescription=${encodedToastDescription}`
      : ""
  }`;
}
