import { useMDXComponents } from "@/mdx-components.tsx";
import { allPosts } from "contentlayer/generated";
import { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";

type PostParams = { slug: string };

export async function generateStaticParams(): Promise<PostParams[]> {
  return allPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: PostParams;
}): Promise<Metadata> {
  const post = allPosts.find((post) => post.slug === params.slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt,
    authors: post.author ? [{ name: post.author }] : undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function PostPage({ params }: { params: PostParams }) {
  const post = allPosts.find((post) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  const MDXContentComponents = useMDXComponents({});

  return (
    <article className="mx-auto max-w-2xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <time dateTime={post.date} className="text-sm text-gray-600">
          {new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        {post.author && (
          <p className="text-sm text-gray-600">by {post.author}</p>
        )}
      </div>
      <div className="prose prose-lg">
        <MDXRemote source={post.body.raw} components={MDXContentComponents} />
      </div>
    </article>
  );
}
