// image sources:
// - https://github.com/remote-android/redroid-doc
// - https://github.com/abing7k/redroid-script

import allRedroidImagesJson from "./redroid-images.json";

export interface RedroidImage {
  name: string;
  description: string;
  imageName: string;
  usable: boolean; // if an image is allowed to be deployed
  premium: boolean; // if a paid membership is required to use the image
}

const allRedroidImages: RedroidImage[] = allRedroidImagesJson;

// get the first one in the list that meets criteria
export const defaultRedroidImage = allRedroidImages
  .toReversed()
  .find((image) => image.usable && !image.premium)!;

export default allRedroidImages;
