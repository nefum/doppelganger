import { BASE_ORIGIN } from "@/constants.ts";

export default function getStaticUrlForImageDataUrl(dataUrl: string): string {
  return `${BASE_ORIGIN}/api/render?i=${encodeURIComponent(dataUrl)}`;
}
