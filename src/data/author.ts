const DEFAULT_AVATAR = '/images/avatar.png';

type AuthorRecord = {
  name?: string;
  avatar?: string;
  reddit?: string;
  github?: string;
  bio?: string;
};

export const authors: Record<string, AuthorRecord> = {
  ColombiaFinanciera: {
    name: 'ColombiaFinanciera',
    avatar: '/images/avatar.png',
    reddit: 'https://www.reddit.com/r/ColombiaFinanciera/',
    bio: 'Proyecto comunitario para aprender finanzas personales en Colombia.',
  },
  odrakcir: {
    name: 'odrakcir',
    avatar: '/images/avatar.png',
    reddit: 'https://www.reddit.com/user/odrakcir/',
  },
};

export function getAuthor(authorId: string) {
  const normalizedId = (authorId ?? '').trim();
  const foundAuthor = normalizedId ? authors[normalizedId] : undefined;
  const fallbackName = normalizedId || 'Autor';

  return {
    ...foundAuthor,
    name: foundAuthor?.name ?? fallbackName,
    avatar: foundAuthor?.avatar ?? DEFAULT_AVATAR,
  };
}

export type Author = ReturnType<typeof getAuthor>;
