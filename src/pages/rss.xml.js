import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';

function mapToRSSItem(post) {
	const slug = post.slug ?? post.id;
	return {
		title: post.data.title,
		description: post.data.description,
		pubDate: post.data.pubDate,
		link: `/blog/${slug}/`,
	};
}

export async function GET(context) {
	const posts = await getCollection('blog');
	return rss({
		title: "ColombiaFinanciera",
		description: "Artículos financieros simples para aprender y conversar en comunidad.",
		site: context.site,
		items: posts.map(mapToRSSItem),
	});
}
