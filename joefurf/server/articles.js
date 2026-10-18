import { join } from "node:path";
import { config } from "./config.js";

// Articles stay as markdown files (public/articles/<date>.md, copied to dist/articles at build).
// The server only needs to know a slug is real and what its title is.
const SLUG = /^\d{4}-\d{2}-\d{2}$/;
const dirs = [join(import.meta.dir, "..", "public", "articles"), join(config.distDir, "articles")];
const cache = new Map();

export async function findArticle(slug) {
  if (typeof slug !== "string" || !SLUG.test(slug)) return null;
  if (cache.has(slug)) return cache.get(slug);
  for (const dir of dirs) {
    const file = Bun.file(join(dir, `${slug}.md`));
    if (await file.exists()) {
      const text = await file.text();
      const title = text.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? slug;
      const article = { slug, title };
      cache.set(slug, article);
      return article;
    }
  }
  return null;
}
