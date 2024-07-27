// https://nextjs.org/docs/app/building-your-application/configuring/mdx
import type { MDXComponents } from "mdx/types";
import Link from "next/link";

const classesForTypes = {
  h1: "shadcn-h1 shadcn-h-spaced",
  h2: "shadcn-h2 shadcn-h-spaced",
  h3: "shadcn-h3 shadcn-h-spaced",
  h4: "shadcn-h4 shadcn-h-spaced",
  p: "shadcn-p",
  blockquote: "shadcn-blockquote",
  table: "shadcn-table",
  "table tr": "shadcn-tr",
  "table > tbody th": "shadcn-th",
  "table > thead th": "shadcn-th-head",
  ul: "shadcn-ul",
  code: "shadcn-code",
  // p: "shadcn-lead",
  // div: "shadcn-large",
  small: "shadcn-small",
  // p: "shadcn-muted",
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => <h1 className={classesForTypes.h1}>{children}</h1>,
    h2: ({ children }) => <h2 className={classesForTypes.h2}>{children}</h2>,
    h3: ({ children }) => <h3 className={classesForTypes.h3}>{children}</h3>,
    h4: ({ children }) => <h4 className={classesForTypes.h4}>{children}</h4>,
    p: ({ children }) => <p className={classesForTypes.p}>{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className={classesForTypes.blockquote}>{children}</blockquote>
    ),
    table: ({ children }) => (
      <table className={classesForTypes.table}>{children}</table>
    ),
    ul: ({ children }) => <ul className={classesForTypes.ul}>{children}</ul>,
    code: ({ children }) => (
      <code className={classesForTypes.code}>{children}</code>
    ),
    small: ({ children }) => (
      <small className={classesForTypes.small}>{children}</small>
    ),
    a: ({ children, href, ...props }) => (
      <Link href={href!} className="shadcn-link" {...props}>
        {children}
      </Link>
    ),
    ...components,
  };
}
