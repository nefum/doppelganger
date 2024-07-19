import { Button } from "@/components/ui/button.tsx";

type Props = {
  heading: string | JSX.Element;
  description: string;
  buttons: JSX.Element;
  image: JSX.Element;
};

export type Header1Props = React.ComponentPropsWithoutRef<"section"> &
  Partial<Props>;

export const Header1 = (props: Header1Props) => {
  const { heading, description, buttons, image } = {
    ...Header1Defaults,
    ...props,
  } as Props;
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="grid grid-cols-1 gap-x-20 gap-y-12 md:gap-y-16 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="mb-5 text-6xl font-bold md:mb-6 md:text-9xl lg:text-10xl">
              {heading}
            </h1>
            <p className="md:text-md">{description}</p>
            <div className="mt-6 flex gap-x-4 md:mt-8">{buttons}</div>
          </div>
          <div className={"md:max-h-[750px] lg:h-[750px] overflow-hidden"}>
            {image} {/*w-full object-cover*/}
          </div>
        </div>
      </div>
    </section>
  );
};

export const Header1Defaults: Header1Props = {
  heading: "Medium length hero heading goes here",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
  buttons: <Button>Test</Button>,
  image: (
    // eslint-disable-next-line @next/next/no-img-element -- example
    <img
      src={"https://relume-assets.s3.amazonaws.com/placeholder-image.svg"}
      alt={"Placeholder"}
      className={"w-full object-cover"}
    />
  ),
};

Header1.displayName = "Header1";
