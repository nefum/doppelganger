"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import styles from "./fill.module.css";

import { getSnapshotUrlOfDevice } from "@/app/(no-layout)/devices/[id]/snapshot/path.ts";

// https://stackoverflow.com/questions/14142378/how-can-i-fill-a-div-with-an-image-while-keeping-it-proportional for filling
export const PARENT_DIV_CLASSES = clsx(
  "rounded-lg object-cover aspect-[2/4] relative bg-gray-200",
  styles.fill,
);

export function DeviceCardSnapshotClient(props: {
  deviceName: string;
  id: string;
}) {
  // interesting problem: sometimes the image loads so fast that the onload event never fires,
  // leading to the loading screen never disappearing. so we wait for the component to mount before we start loading
  const [startLoading, setStartLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setStartLoading(true);
  }, []);

  return (
    <>
      <div
        className={clsx(PARENT_DIV_CLASSES, {
          "animate-pulse": !loaded,
        })}
      >
        {startLoading && (
          // eslint-disable-next-line @next/next/no-img-element -- we NEVER want to cache this, this is an API endpoint
          <img
            className={clsx("bg-black min-h-[100%] min-w-[100%]", {
              "opacity-0": !loaded,
            })}
            alt={`${props.deviceName} snapshot`}
            src={getSnapshotUrlOfDevice(props.id)}
            onLoad={() => setLoaded(true)}
          />
        )}
      </div>
    </>
  );
}
