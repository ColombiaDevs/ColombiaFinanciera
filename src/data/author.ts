const DEFAULT_AVATAR = '/images/avatar.png';

type AuthorRecord = {
  name?: string;
  avatar?: string;
  url?: string;
};

const authors: Record<string, AuthorRecord> = {
  ColombiaFinanciera: {
    name: 'ColombiaFinanciera',
    avatar: '/images/avatar.png',
    url: '#',
  },
  aquel: {
    name: 'aquel',
    avatar: '/images/avatar.png',
    url: '#',
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

export const author = getAuthor('ColombiaFinanciera');

export type Author = ReturnType<typeof getAuthor>;
