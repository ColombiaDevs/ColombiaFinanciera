import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { slugifyCategory } from '../../../../src/data/categories';

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
  const categories = [...new Set(posts.map((p) => p.data.category).filter(Boolean))];
  return categories.map((c) => ({ params: { category: slugifyCategory(c) } }));
}

export async function GET(context) {
  const { category } = context.params;
  const posts = (await getCollection('blog')).filter((p) => slugifyCategory(p.data.category || '') === category);
  return rss({
    title: `Category: ${category}`,
    description: `Latest posts in ${category}`,
    site: context.site,
    items: posts.map(mapToRSSItem),
  });
}


