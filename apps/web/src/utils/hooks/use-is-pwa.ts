import { useEffect, useState } from "react";

export const checkPWA = () => {
  // For iOS Safari
  // @ts-expect-error -- not present on types
  if (window.navigator.standalone) {
    return true;
  }
  // For other browsers
  if (window.matchMedia("(display-mode: standalone)").matches) {
    return true;
  }
  // Not running as PWA
  return false;
};

function useIsPWA() {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    setIsPWA(checkPWA());
  }, []);

  return isPWA;
}

export default useIsPWA;
