export enum Orientation {
  LANDSCAPE,
  PORTRAIT,
  INDETERMINATE
}

/*
 * https://usehooks.com/useorientation Returns the orientation from the type output of this hook
 */
export function getOrientationFromUseOrientationOrientationType(ret: string): Orientation {
  if (ret.startsWith("landscape-")) {
    return Orientation.LANDSCAPE;
  } else if (ret.startsWith("portrait-")) {
    return Orientation.PORTRAIT;
  } else {
    return Orientation.INDETERMINATE;
  }
}

export function getOrientationFromRatio(ratio: number): Orientation {
  return ratio > 1 ? Orientation.LANDSCAPE : Orientation.PORTRAIT;
}
