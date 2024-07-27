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
  className,
}: Readonly<{
  aspectRatio: number;
  children?: ReactNode;
  innerContainerRef: RefObject<HTMLDivElement>;
  className?: string;
}>): ReactNode {
  const outerContainerRef = useRef<HTMLDivElement>(null);

  // returns the parent of the outer container
  const getParentElement = useMemo(
    () => () => {
      return outerContainerRef.current!.parentElement!;
    },
    [],
  );
  // the width of the parent that we must not exceed

  // in a ref object to prevent unmounting of the observers when the aspect ratio changes
  const aspectRatioRef = useRef(aspectRatio);
  // this cannot be a state, we cannot rerender and therefore unmount the observers when the width changes, circular loop
  const parentWidth = useRef<number | null>(null);
  // the aspect ratio when the parent width was updated
  const parentWidthSourceAspectRatio = useRef<number | null>(null);
  const [aspectRatioWidth, setAspectRatioWidth] = useState("100%"); // Default width

  const setAspectRatioWidthWithoutOverflow = useMemo(() => {
    return function internalSetAspectRatioWidthWithoutOverflow(
      requestedWidth: string,
    ) {
      if (!outerContainerRef.current) {
        return;
      }

      // assign into a variable to ignore any simultaneous changes
      const currentParentWidth = parentWidth.current;

      if (requestedWidth.endsWith("px") && currentParentWidth !== null) {
        // if the parent width is undefined, there isn't much we can do to compare
        const requestedWidthPx = parseFloat(requestedWidth.slice(0, -2));

        if (requestedWidthPx > currentParentWidth) {
          setAspectRatioWidth(`${currentParentWidth}px`);

          return;
        }
      }

      setAspectRatioWidth(requestedWidth);
    };
  }, []);

  useEffect(() => {
    aspectRatioRef.current = aspectRatio;
  }, [aspectRatio]);

  useEffect(() => {
    if (!outerContainerRef.current) {
      return;
    }

    // setup calculating the inside container
    function calculateWidth() {
      if (!outerContainerRef.current) {
        return;
      }

      const viewportHeightPx =
        outerContainerRef.current.parentElement!.clientHeight;
      const widthPx = aspectRatioRef.current * viewportHeightPx;
      return `${widthPx}px`;
    }

    function updateWidth() {
      setAspectRatioWidthWithoutOverflow(calculateWidth()!);
    }

    // note: the aspect ratio gets updated BEFORE the parent width gets updated here
    function updateParentWidth() {
      if (!outerContainerRef.current) {
        return;
      }

      parentWidthSourceAspectRatio.current = aspectRatioRef.current;
      parentWidth.current = getParentElement().clientWidth;

      // we can do a safe call to set the update width now
      updateWidth();
    }

    // this will only effectively run on the first render, making the parent width not changable due to resizing of the children 🥳
    updateParentWidth();

    // we need to update our internal max width when the parent's parent container changes size due to an external factor,
    // like a resizable/draggable component (multiview)
    const outerResizeObserver = new ResizeObserver(updateParentWidth);
    const innerResizeObserver = new ResizeObserver(updateWidth);

    innerResizeObserver.observe(outerContainerRef.current!);
    outerResizeObserver.observe(getParentElement());

    return () => {
      innerResizeObserver.disconnect();
      outerResizeObserver.disconnect();
    };
  }, [getParentElement, setAspectRatioWidthWithoutOverflow]);

  return (
    <div ref={outerContainerRef} style={{ width: aspectRatioWidth }}>
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
