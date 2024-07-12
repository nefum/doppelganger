/**
 * @jest-environment node
 */

import { createDockerTemplateFromView } from "@/utils/docker/docker-compose-moustache-formatting.ts";
import { SampleDeviceSpecs } from "@/utils/redroid/device-specs.ts";
import { defaultRedroidImage } from "@/utils/redroid/redroid-images.ts";
import { stringify as stringifyYaml, parse as yamlParse } from "yaml";
import { createView } from "./deployment.ts";

describe("createView", () => {
  it("should create a valid DockerComposeMoustacheView with explicit settings", async () => {
    const fps = 30;
    const specs: SampleDeviceSpecs = {
      name: "",
      dpi: 160,
      width: 720,
      height: 1280,
    };
    const view = await createView(defaultRedroidImage, fps, specs);

    expect(view).toBeDefined();
    expect(view.id).toBeDefined();
    expect(view.redroidImage).toContain(defaultRedroidImage.imageName);
    expect(view.baseDir).toBeDefined();
    expect(view.externalNetworkName).toBeDefined();
    expect(view.redroidImageDataBasePath).toBeDefined();
    expect(view.redroidFps).toEqual(fps);
    expect(view.redroidDpi).toEqual(specs.dpi);
    expect(view.redroidWidth).toEqual(specs.width);
    expect(view.redroidHeight).toEqual(specs.height);
  }, 60_000); // needs time to fetch the digest

  it("should create a view that can create a valid YAML file", async () => {
    const fps = 30;
    const specs: SampleDeviceSpecs = {
      name: "",
      dpi: 160,
      width: 720,
      height: 1280,
    };
    const view = await createView(defaultRedroidImage, fps, specs);
    const yaml = await createDockerTemplateFromView(view);
    const parsedYaml = yamlParse(yaml);
    const stringifiedYaml = stringifyYaml(parsedYaml);
    console.log(stringifiedYaml);
  }, 60_000); // needs time to fetch the digest
});
