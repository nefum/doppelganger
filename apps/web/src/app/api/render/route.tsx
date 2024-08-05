import imageSize from "image-size";
import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
): Promise<NextResponse | ImageResponse> {
  const i = req.nextUrl.searchParams.get("i");
  if (!i) {
    return NextResponse.json({ error: "missing i" }, { status: 400 });
  }
  // make sure that i is an image, like data:image/png;base64,....
  if (!i.startsWith("data:image/")) {
    return NextResponse.json({ error: "i is not an image" }, { status: 400 });
  }
  // turn the image into a uint8array
  const base64 = i.split(",")[1];
  const buffer = Buffer.from(base64, "base64");
  const dimensions = imageSize(buffer);
  if (!dimensions) {
    return NextResponse.json(
      { error: "could not get image dimensions" },
      { status: 400 },
    );
  }
  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={i} alt="image" />
    ),
    {
      width: dimensions.width,
      height: dimensions.height,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        Pragma: "no-cache",
      },
    },
  );
}
