import { JSXElementConstructor, PropsWithChildren, ReactNode } from "react";

type ProviderWithProps<P> = [JSXElementConstructor<PropsWithChildren<P>>, P?];

interface ProviderComposerProps {
  providers: Array<ProviderWithProps<any>>;
  children: ReactNode;
}

// adapted from https://stackoverflow.com/questions/51504506/too-many-react-context-providers
export default function ProviderComposer({
  providers = [],
  children,
}: ProviderComposerProps) {
  return (
    <>
      {providers.reduceRight((acc, [Comp, props = {}]) => {
        return <Comp {...props}>{acc}</Comp>;
      }, children)}
    </>
  );
}
