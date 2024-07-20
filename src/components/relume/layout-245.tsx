import { Button } from "@relume_io/relume-ui";
import { RxChevronRight } from "react-icons/rx";

type SectionProps = {
  icon: JSX.Element;
  heading: string;
  description: string;
};

type Props = {
  tagline: string;
  heading: string;
  description: string;
  sections: SectionProps[];
  buttons: JSX.Element;
};

export type Layout245Props = React.ComponentPropsWithoutRef<"section"> &
  Partial<Props>;

export const Layout245 = (props: Layout245Props) => {
  const {
    tagline,
    heading,
    description,
    sections = [],
    buttons,
  } = { ...Layout245Defaults, ...props };
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container flex flex-col items-start">
        <div className="mb-12 grid grid-cols-1 items-start justify-between gap-5 md:mb-18 md:grid-cols-2 md:gap-x-12 md:gap-y-8 lg:mb-20 lg:gap-x-20">
          <div>
            <p className="mb-3 font-semibold md:mb-4">{tagline}</p>
            <h2 className="text-5xl font-bold md:text-7xl lg:text-8xl">
              {heading}
            </h2>
          </div>
          <p className="md:text-md">{description}</p>
        </div>
        <div className="grid grid-cols-1 items-start gap-y-12 md:grid-cols-3 md:gap-x-8 md:gap-y-16 lg:gap-x-12">
          {sections.map((section, index) => (
            <div key={index}>
              <div className="mb-5 md:mb-6">{section.icon}</div>
              <h3 className="mb-5 text-2xl font-bold md:mb-6 md:text-3xl md:leading-[1.3] lg:text-4xl">
                {section.heading}
              </h3>
              <p>{section.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex items-center gap-4 md:mt-14 lg:mt-16">
          {buttons}
        </div>
      </div>
    </section>
  );
};

export const Layout245Defaults: Layout245Props = {
  tagline: "Tagline",
  heading: "Medium length section heading goes here",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
  sections: [
    {
      icon: (
        // eslint-disable-next-line @next/next/no-img-element -- demo only
        <img
          src="https://relume-assets.s3.amazonaws.com/relume-icon.svg"
          alt="Relume logo 1"
        />
      ),
      heading: "Medium length section heading goes here",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
    },
    {
      icon: (
        // eslint-disable-next-line @next/next/no-img-element -- demo only
        <img
          src="https://relume-assets.s3.amazonaws.com/relume-icon.svg"
          alt="Relume logo 1"
        />
      ),
      heading: "Medium length section heading goes here",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
    },
    {
      icon: (
        // eslint-disable-next-line @next/next/no-img-element -- demo only
        <img
          src="https://relume-assets.s3.amazonaws.com/relume-icon.svg"
          alt="Relume logo 1"
        />
      ),
      heading: "Medium length section heading goes here",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
    },
  ],
  buttons: (
    <>
      <Button variant="primary">Button</Button>
      <Button
        variant="link"
        size="link"
        iconRight={<RxChevronRight className="size-6" />}
      >
        Button
      </Button>
    </>
  ),
};

Layout245.displayName = "Layout245";
