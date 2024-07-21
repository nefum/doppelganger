import { deviceApiEndpoint } from "%/endpoint-regex.ts";
import { RangeType } from "@/utils/types/range-type.ts";
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";

export const dynamic = "force-dynamic"; // force dynamic

const NUM_PROXIES = 5;
const GATEWAY_DOCKER_PORT = "172.18.0.1"; // 172.18.0.1 is the IP address of the docker network gateway, 18 is a typical subnet and is used for prod

// this is deterministic and will always return the same number for the same id, any change in the id will result in a different number
function getProxyNumberForId(id: string): RangeType<1, typeof NUM_PROXIES> {
  const hash = createHash("sha256").update(id).digest("hex");
  // convert the hash to a number
  return ((parseInt(hash, 16) % NUM_PROXIES) + 1) as RangeType<
    1,
    typeof NUM_PROXIES
  >; // fits
}

function portOptions(): number[] {
  // create proxies going up from 1055 with NUM_PROXIES
  return Array.from({ length: NUM_PROXIES }, (_, i) => 1055 + i);
}

function proxyStringFor(proxyOriginNoProtocol: string): string {
  return `SOCKS5 ${proxyOriginNoProtocol}; SOCKS ${proxyOriginNoProtocol}`;
}

function getProxyOriginNoProtocolForPort(proxyPort: number): string {
  return `${GATEWAY_DOCKER_PORT}:${proxyPort}`;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  // impl: we cannot return anything to the user that suggests if a device with this id exists or not
  // everything has to be deterministic!!

  const id = req.nextUrl.pathname.match(deviceApiEndpoint)![1];
  const proxyNum = getProxyNumberForId(id);
  const firstChoicePort = 1055 - 1 + proxyNum; // 1055, 1056, 1057, 1058, 1059
  const ports = portOptions();
  // get rid of the first choice
  delete ports[ports.indexOf(firstChoicePort)];

  let proxyString = proxyStringFor(
    getProxyOriginNoProtocolForPort(firstChoicePort),
  );

  for (const port of ports) {
    if (!port) {
      continue;
    }
    proxyString += `; ${proxyStringFor(getProxyOriginNoProtocolForPort(port))}`;
  }

  return new NextResponse(
    `function FindProxyForURL(url, host) {return "${proxyString}; DIRECT";}`,
    {
      headers: {
        "Content-Type": "application/x-ns-proxy-autoconfig",
      },
    },
  );
}
