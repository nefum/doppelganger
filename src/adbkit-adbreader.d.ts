declare module "adbkit-apkreader" {
  MANIFEST = "AndroidManifest.xml";

  function open(file: string): Promise<ApkReader>;

  class ApkReader {
    readContent(path: string): Promise<Buffer>;

    readManifest(): Promise<ManifestObject>;

    readXml(path: string): Promise<XmlNode>;

    usingFileStream<T>(
      path: string,
      action: (stream: NodeJS.ReadableStream) => Promise<T>,
    ): Promise<T>;
  }

  interface ManifestObject {
    versionCode: number;
    versionName: string;
    package: string;
    usesPermissions: { name: string }[];
    permissions: any[];
    permissionTrees: any[];
    permissionGroups: any[];
    instrumentation: any;
    usesSdk: {
      minSdkVersion: number;
      targetSdkVersion: number;
    };
    usesConfiguration: any;
    usesFeatures: any[];
    supportsScreens: any;
    compatibleScreens: any[];
    supportsGlTextures: any[];
    application: {
      theme: string;
      label: string;
      icon: string;
      debuggable: boolean;
      allowBackup: boolean;
      activities: Activity[];
      activityAliases: any[];
      launcherActivities: Activity[];
      services: any[];
      receivers: any[];
      providers: any[];
      usesLibraries: any[];
    };
  }

  interface Activity {
    label: string;
    name: string;
    intentFilters: IntentFilter[];
    metaData: any[];
  }

  interface IntentFilter {
    actions: { name: string }[];
    categories: { name: string }[];
    data: any[];
  }

  interface XmlNode {
    namespaceURI: string | null;
    nodeType: 1 | 2 | 4;
    nodeName: string;
    attributes?: XmlAttribute[];
    childNodes?: XmlNode[];
    name?: string;
    value?: any;
    typedValue?: TypedValue;
    data?: string;
  }

  interface XmlAttribute {
    name: string;
    value: any;
    typedValue?: TypedValue;
  }

  interface TypedValue {
    value: null | string | boolean | number | object;
    type: string;
    rawType: number;
  }
}
