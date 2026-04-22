import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { slugifyTag } from '../../../../src/lib/slug';

function mapToRSSItem(post) {
  const slug = post.slug ?? post.id;
  return {
    title: post.data.title,
    description: post.data.description,
    pubDate: post.data.pubDate,
    link: `/blog/${slug}/`,
  };
}

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  const tags = [...new Set(posts.flatMap((p) => p.data.tags || []))];
  return tags.map((t) => ({ params: { tag: slugifyTag(t) } }));
}

export async function GET(context) {
  const { tag } = context.params;
  const posts = (await getCollection('blog')).filter((p) =>
    (p.data.tags || []).some((t) => slugifyTag(t) === tag)
  );
  return rss({
    title: `Tag: ${tag}`,
    description: `Latest posts tagged ${tag}`,
    site: context.site,
    items: posts.map(mapToRSSItem),
  });
}


