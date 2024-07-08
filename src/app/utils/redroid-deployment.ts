/**
 * This file contains utilities that are used to automate the deployment of the backend redroid containers that clients connect to.
 * Principally, the workflow for this file includes:
 * - Generating the view for a docker-compose file
 * - Generating the docker-compose file from a view
 * - Deploying the docker-compose file
 */
import { CUID } from "@/app/utils/docker-image-formatting.ts";

/**
 * For the docker-compose.yml file at ./template/docker-compose.yml
 */
export interface DockerComposeMoustacheView {
  redroidImage: string; // includes both the image name and the tag
  redroidImageDigest: string; // sha256 hash of the image, used for pinning the image

  redroidImageAndDigestSlugified: string; //

  id: CUID;
}
