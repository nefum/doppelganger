import { AspectRatio } from "@/components/ui/aspect-ratio.tsx";
import {
  ReactNode,
  RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * A utility function for Filling Aspect Ratio to allow it to set the maximum width of the inner container.
 * See src/app/(userland)/devices/(root)/device-cards/desktop-client-button.tsx for an example of how to use this.
 */
export function MaxWidthSetter({
  containerRef,
  maxWidth,
  setMaxWidth,
}: Readonly<{
  containerRef: RefObject<HTMLDivElement>;
  maxWidth: number | undefined;
  setMaxWidth: (maxWidth: number) => void;
}>): ReactNode {
  useEffect(() => {
    if (containerRef.current && maxWidth === undefined) {
      setMaxWidth(containerRef.current.clientWidth);
    }
  }, [containerRef, maxWidth, setMaxWidth]);

  return null;
}

/**
 * Creates an aspect-ratio box that fills the parent container, but still maintains the aspect ratio.
 * @param aspectRatio The aspect ratio to maintain.
 * @param children The children to render inside the aspect-ratio box.
 * @param innerContainerRef A ref to the inner container.
 * @param givenMaxWidth The maximum width to allow the inner container to be. If this is undefined, the inner container will grow all the way to the parent container's width.
 * @param className The class name to apply to the inner container.
 */
export default function FillingAspectRatio({
  aspectRatio,
  children,
  innerContainerRef,
  givenMaxWidth,
  className,
}: Readonly<{
  aspectRatio: number;
  children?: ReactNode;
  innerContainerRef: RefObject<HTMLDivElement>;
  givenMaxWidth?: number;
  className?: string;
}>): ReactNode {
  const parentRef = useRef<HTMLDivElement>(null);

  const [aspectRatioWidth, setAspectRatioWidth] = useState("100%"); // Default width

  const setAspectRatioWidthWithoutOverflow = useMemo(() => {
    return (requestedWidth: string) => {
      if (!parentRef.current) {
        return;
      }

      const parentParent = parentRef.current.parentElement!;

      if (requestedWidth.endsWith("px")) {
        // don't allow it to overflow
        const requestedWidthPx = parseFloat(requestedWidth.slice(0, -2));
        const maxWidth = parentParent.clientWidth;
        const acceptableMaxWidth = maxWidth + 30; // give it a little bit of room for resizing

        if (requestedWidthPx > acceptableMaxWidth) {
          setAspectRatioWidth(`${acceptableMaxWidth}px`);
          return;
        }
      }

      setAspectRatioWidth(requestedWidth);
    };
  }, []);

  useEffect(() => {
    if (!parentRef.current) {
      return;
    }

    const calculateWidth = () => {
      if (!parentRef.current) {
        return;
      }

      const viewportHeightPx = parentRef.current.parentElement!.clientHeight;
      const widthPx = aspectRatio * viewportHeightPx;
      return `${widthPx}px`;
    };

    const width = calculateWidth()!;
    setAspectRatioWidth(width);

    const resizeObserver = new ResizeObserver(() => {
      setAspectRatioWidthWithoutOverflow(calculateWidth()!);
    });

    resizeObserver.observe(parentRef.current!);

    return () => {
      resizeObserver.disconnect();
    };
  }, [aspectRatio, setAspectRatioWidthWithoutOverflow]);

  return (
    <div ref={parentRef} style={{ width: aspectRatioWidth }}>
      <AspectRatio
        ratio={aspectRatio}
        ref={innerContainerRef}
        className={className}
      >
        {children}
      </AspectRatio>
    </div>
  );
}
