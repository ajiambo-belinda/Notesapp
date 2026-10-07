export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  favourite: boolean;
  deletedAt: string | null;
};

export type Theme = 'light' | 'dark';

export type View = 'all' | 'favourites' | 'trash';