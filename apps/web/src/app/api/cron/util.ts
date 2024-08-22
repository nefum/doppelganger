export default function fixDateFromPrisma<T extends Date | null>(
  incomingDate: T,
): T extends null ? null : Date;
export default function fixDateFromPrisma(
  incomingDate: Date | null | string | number,
): Date | null {
  if (incomingDate === null) return null;
  return incomingDate instanceof Date ? incomingDate : new Date(incomingDate);
}
