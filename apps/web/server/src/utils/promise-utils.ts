import * as Sentry from "@sentry/node";

/**
 * Resolves the promise or returns the value if the promise rejects.
 * @param promise
 * @param value
 * @param logErrors
 */
export async function resolveOrDefaultValue<T>(
  promise: Promise<T>,
  value: T,
  logErrors: boolean = true,
): Promise<T> {
  try {
    return await promise;
  } catch (e) {
    if (logErrors) {
      Sentry.captureException(e);
      console.log(
        `Failed to resolve promise, returning default value ${value}`,
        e,
      );
    }
    return value;
  }
}

/**
 * Ignores rejection and returns -1 for any number promise that rejects.
 * @param {Promise<number>} promise The promise to process.
 * @returns {Promise<number>} The resolved value or -1 if rejected.
 */
export function ignoreNumberRejection(
  promise: Promise<number>,
): Promise<number> {
  return resolveOrDefaultValue(promise, -1);
}
