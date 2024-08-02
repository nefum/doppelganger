// @ts-check

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SITE_URL = "https://doppelgangerhq.com";

const STATIC_PATHS = [
  { loc: "/", changefreq: "weekly", priority: 1 },
  { loc: "/about", changefreq: "monthly", priority: 0.8 },
  { loc: "/multiview", changefreq: "monthly", priority: 0.8 },
  { loc: "/contact", changefreq: "yearly", priority: 0.5 },
  { loc: "/licenses", changefreq: "weekly", priority: 0.2 },
  { loc: "/opensource", changefreq: "monthly", priority: 0.6 },
  { loc: "/privacy", changefreq: "yearly", priority: 0.3 },
  { loc: "/subscribe", changefreq: "monthly", priority: 0.9 },
  { loc: "/support", changefreq: "monthly", priority: 0.7 },
  { loc: "/tech", changefreq: "yearly", priority: 0.6 },
  { loc: "/tos", changefreq: "yearly", priority: 0.3 },
  { loc: "/types", changefreq: "monthly", priority: 0.7 },
];

const BLOG_POSTS = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, ".contentlayer/generated/Post/_index.json"),
    "utf8",
  ),
);

/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  exclude: ["/api/*"],
  generateIndexSitemap: false,
  additionalPaths: async (config) => {
    const staticPaths = STATIC_PATHS.map((path) => ({
      loc: path.loc,
      changefreq: path.changefreq,
      priority: path.priority,
      lastmod: new Date().toISOString(),
    }));

    const blogPaths = BLOG_POSTS.map((post) => ({
      loc: `/blog/${post.slug}`,
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(post.date).toISOString(),
    }));

    return [...staticPaths, ...blogPaths];
  },
};

export default config;
