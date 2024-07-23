import { useEffect, useRef } from "react";

export default function MaxWidthHardlimiter({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Function to set the width of the container
    const setWidth = () => {
      if (ref.current && ref.current.parentElement) {
        const width = ref.current.parentElement.clientWidth;
        ref.current.style.maxWidth = `${width}px`;
      }
    };

    // Initialize the width on mount
    setWidth();

    // Setup Resize Observer to adjust width on parent resize
    const resizeObserver = new ResizeObserver(() => {
      setWidth();
    });

    if (ref.current && ref.current.parentElement) {
      resizeObserver.observe(ref.current.parentElement);
    }

    // Cleanup function to disconnect the Resize Observer on unmount
    return () => {
      resizeObserver.disconnect();
    };
  }, []); // Empty dependency array ensures this effect runs only on mount and unmount

  return <div ref={ref}>{children}</div>;
}
