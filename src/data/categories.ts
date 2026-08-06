export type CategoryMeta = {
  slug: string;
  title: string;
  description: string;
};

function toSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

function toTitleFromSlug(slug: string): string {
  return slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

// Customize category SEO here
const categoryMetaBySlug: Record<string, Partial<CategoryMeta>> = {
  vivienda: {
    title: 'Vivienda',
    description:
      'Comprar, arrendar y financiar vivienda en Colombia: crédito hipotecario, costos reales y cuándo conviene cada opción.',
  },
  inversion: {
    title: 'Inversión',
    description:
      'Cómo invertir en Colombia con criterio: tipos de activo, impuestos y errores frecuentes al empezar.',
  },
  'finanzas-personales': {
    title: 'Finanzas personales',
    description:
      'Ahorro, deuda y decisiones de gasto en el día a día colombiano, explicadas de forma simple.',
  },
};

export function getCategoryMeta(slugOrName: string): CategoryMeta {
  const slug = toSlug(slugOrName);
  const custom = categoryMetaBySlug[slug] ?? {};
  const fallbackTitle = toTitleFromSlug(slug);
  return {
    slug,
    title: custom.title ?? fallbackTitle,
    description:
      custom.description ??
      `Artículos de ColombiaFinanciera sobre ${fallbackTitle.toLowerCase()} en el contexto colombiano.`,
  };
}

export function slugifyCategory(name: string): string {
  return toSlug(name);
}
