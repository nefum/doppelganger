"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";

// Step 1: Create a React context for the nonce
const NonceContext = createContext<string | undefined>(undefined);

// Step 2: Generate a nonce
function generateNonce(): string {
  return btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))),
  );
}

// Step 3: Provide the nonce to the context
export function NonceProvider({
  children,
}: Readonly<{ children?: ReactNode }>): ReactNode {
  const nonce = useMemo(() => generateNonce(), []); // Generate the nonce only once
  return (
    <NonceContext.Provider value={nonce}>{children}</NonceContext.Provider>
  );
}

// Step 4: Create a hook to easily access the nonce from any component
export const useNonce = () => {
  const context = useContext(NonceContext);
  if (context === undefined) {
    throw new Error("useNonce must be used within a NonceProvider");
  }
  return context;
};
