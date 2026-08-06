// @ts-check

import fs from 'node:fs';
import path from 'node:path';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

const BLOG_DIR = './src/content/blog';

/**
 * Last modification date per blog URL, read straight from frontmatter so the
 * sitemap advertises real content dates instead of the build timestamp.
 * @returns {Record<string, string>} map of `/blog/<slug>/` -> ISO date
 */
function blogLastmod() {
  /** @type {Record<string, string>} */
  const map = {};
  if (!fs.existsSync(BLOG_DIR)) return map;

  for (const file of fs.readdirSync(BLOG_DIR)) {
    if (!/\.(md|mdx)$/.test(file)) continue;
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
    const frontmatter = raw.split(/^---\s*$/m)[1] ?? '';
    const updated = frontmatter.match(/^updatedDate:\s*["']?([0-9-]+)/m);
    const published = frontmatter.match(/^pubDate:\s*["']?([0-9-]+)/m);
    const date = (updated ?? published)?.[1];
    if (!date) continue;
    map[`/blog/${file.replace(/\.(md|mdx)$/, '')}/`] = new Date(date).toISOString();
  }
  return map;
}

const lastmodByPath = blogLastmod();

// https://astro.build/config
export default defineConfig({
  site: 'https://colombiafinanciera.com.co',
  integrations: [
    mdx(),
    sitemap({
      serialize(item) {
        const { pathname } = new URL(item.url);
        const lastmod = lastmodByPath[pathname];
        if (lastmod) item.lastmod = lastmod;
        return item;
      },
    }),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
