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
 * Creates an aspect-ratio box that fills the parent container, but still maintains the aspect ratio.
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
        const requestedWidthPx = parseInt(requestedWidth.slice(0, -2));
        const maxWidth = parentParent.clientWidth;
        const acceptableMaxWidth = givenMaxWidth ?? maxWidth + 30; // give it a little bit of room for resizing

        if (requestedWidthPx > acceptableMaxWidth) {
          setAspectRatioWidth(`${givenMaxWidth ?? acceptableMaxWidth}px`);
          return;
        }
      }

      setAspectRatioWidth(requestedWidth);
    };
  }, [givenMaxWidth]);

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
