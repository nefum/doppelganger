import {NextRequest, NextResponse} from "next/server";

export async function GET(request: NextRequest) {
  // this will never get called directly; only by the custom server
  // it should return the url of the KasmVNC websocket server along with the required basic authentication

  return NextResponse.json({
    url: "wss://doppelganger.tail11540.ts.net:6901/websockify/",  // trailing / is important
    insecure: true, // self-signed certificate
    basicAuth: {
      username: "kasm_user",
      password: "ihopethisworks"
    }
  })
}
