export interface FavoriteMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  sessionId: string;
  sessionTitle: string;
  tags?: string[];
  note?: string;
}

const FAVORITES_KEY = 'hagopai_favorites';

export const saveFavorites = (favorites: FavoriteMessage[]) => {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.warn('Could not save favorites:', error);
  }
};

export const loadFavorites = (): FavoriteMessage[] => {
  try {
    const saved = localStorage.getItem(FAVORITES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((fav: any) => ({
        ...fav,
        timestamp: new Date(fav.timestamp)
      }));
    }
  } catch (error) {
    console.warn('Could not load favorites:', error);
  }
  return [];
};

export const addToFavorites = (
  messageId: string,
  content: string,
  isUser: boolean,
  timestamp: Date,
  sessionId: string,
  sessionTitle: string,
  tags: string[] = []
): FavoriteMessage[] => {
  const favorites = loadFavorites();
  
  // Check if already favorited
  if (favorites.find(f => f.id === messageId)) {
    return favorites;
  }
  
  const newFavorite: FavoriteMessage = {
    id: messageId,
    content,
    isUser,
    timestamp,
    sessionId,
    sessionTitle,
    tags
  };
  
  const updatedFavorites = [newFavorite, ...favorites];
  saveFavorites(updatedFavorites);
  return updatedFavorites;
};

export const removeFromFavorites = (messageId: string): FavoriteMessage[] => {
  const favorites = loadFavorites();
  const updatedFavorites = favorites.filter(f => f.id !== messageId);
  saveFavorites(updatedFavorites);
  return updatedFavorites;
};

export const isFavorited = (messageId: string): boolean => {
  const favorites = loadFavorites();
  return favorites.some(f => f.id === messageId);
};

export const updateFavoriteNote = (messageId: string, note: string): FavoriteMessage[] => {
  const favorites = loadFavorites();
  const updatedFavorites = favorites.map(f => 
    f.id === messageId ? { ...f, note } : f
  );
  saveFavorites(updatedFavorites);
  return updatedFavorites;
};

export const addFavoriteTags = (messageId: string, tags: string[]): FavoriteMessage[] => {
  const favorites = loadFavorites();
  const updatedFavorites = favorites.map(f => 
    f.id === messageId ? { ...f, tags: [...(f.tags || []), ...tags] } : f
  );
  saveFavorites(updatedFavorites);
  return updatedFavorites;
};

export const searchFavorites = (query: string): FavoriteMessage[] => {
  const favorites = loadFavorites();
  const lowercaseQuery = query.toLowerCase();
  
  return favorites.filter(f => 
    f.content.toLowerCase().includes(lowercaseQuery) ||
    f.sessionTitle.toLowerCase().includes(lowercaseQuery) ||
    f.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    f.note?.toLowerCase().includes(lowercaseQuery)
  );
};
