import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { slugifyTag } from '../lib/slug';

/**
 * llms.txt — structured map of the site for AI systems.
 *
 * Generated from the blog collection at build time so it never drifts from
 * published content. Spec: https://llmstxt.org
 */
export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() ?? 'https://colombiafinanciera.com.co/').replace(/\/$/, '');

  const posts = (await getCollection('blog')).sort((a, b) => +b.data.pubDate - +a.data.pubDate);

  const categories = [
    ...new Set(posts.map((p) => p.data.category).filter((c): c is string => Boolean(c))),
  ].sort();

  const iso = (date: Date) => date.toISOString().slice(0, 10);

  const lines = [
    '# ColombiaFinanciera',
    '',
    '> Proyecto comunitario y abierto que explica finanzas personales en Colombia:',
    '> ahorro, deuda, vivienda, crédito hipotecario e inversión. El contenido se',
    '> escribe a partir de discusiones reales de la comunidad en r/ColombiaFinanciera.',
    '',
    'Idioma: español (es-CO). Ámbito: Colombia.',
    'Naturaleza del contenido: educativo e introductorio. No es asesoría financiera',
    'personalizada ni recomendación de inversión.',
    'Licencia del código: MIT. Repositorio: https://github.com/ColombiaDevs/ColombiaFinanciera',
    '',
    '## Artículos',
    '',
    ...posts.map(
      (p) =>
        `- [${p.data.title}](${base}/blog/${p.id}/): ${p.data.description} (publicado ${iso(p.data.pubDate)}${
          p.data.updatedDate ? `, actualizado ${iso(p.data.updatedDate)}` : ''
        })`
    ),
    '',
    '## Categorías',
    '',
    ...categories.map((c) => `- [${c}](${base}/blog/category/${slugifyTag(c)}/)`),
    '',
    '## Páginas',
    '',
    `- [Inicio](${base}/): punto de entrada y artículos recientes.`,
    `- [Artículos](${base}/blog/): listado completo del blog.`,
    `- [Proyecto](${base}/about/): propósito y enfoque del sitio.`,
    `- [Contribuidores](${base}/contribuidores/): cómo participar en el proyecto.`,
    `- [Herramientas](${base}/tools/): calculadoras financieras sin registro.`,
    `- [Simulador de crédito hipotecario](${base}/tools/credito-hipotecario/): estima la cuota mensual según monto, tasa y plazo.`,
    '',
    '## Opcional',
    '',
    `- [Feed RSS](${base}/rss.xml): todos los artículos.`,
    `- [Sitemap](${base}/sitemap-index.xml): mapa completo de URLs.`,
    `- [Comunidad en Reddit](https://www.reddit.com/r/ColombiaFinanciera/): discusiones fuente.`,
    `- [Canal de Telegram](https://t.me/ColombiaFinanciera): actualizaciones.`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
