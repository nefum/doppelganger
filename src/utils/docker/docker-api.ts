import Docker from "dockerode";

interface GlobalThisExtension {
  ______dockerApiClient: Docker | undefined;
}

// we do this the same way as we do prisma's global as to not create the client
// multiple times

declare const globalThis: GlobalThisExtension & { [p: string]: any };

if (!globalThis.______dockerApiClient) {
  globalThis.______dockerApiClient = new Docker();
}

const dockerApiClient = globalThis.______dockerApiClient;

export default dockerApiClient;
