interface ReadingProgress {
  documentId: string;
  scrollPosition: number;      // Pixels from top
  scrollPercent: number;       // 0-100 percentage
  lastRead: number;            // Timestamp
}

interface ReadingState {
  favorites: string[];         // Array of document IDs
  progress: Record<string, ReadingProgress>;
  lastDocument: string;        // Last opened document ID
}

const STORAGE_KEY = 'rstu_reading_state';

export function getReadingState(): ReadingState {
  if (typeof window === 'undefined') return { favorites: [], progress: {}, lastDocument: '' };

  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : { favorites: [], progress: {}, lastDocument: '' };
}

export function saveReadingProgress(documentId: string, scrollPosition: number, scrollPercent: number) {
  const state = getReadingState();
  state.progress[documentId] = {
    documentId,
    scrollPosition,
    scrollPercent,
    lastRead: Date.now()
  };
  state.lastDocument = documentId;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function toggleFavorite(documentId: string): boolean {
  const state = getReadingState();
  const isFavorited = state.favorites.includes(documentId);

  if (isFavorited) {
    state.favorites = state.favorites.filter(id => id !== documentId);
  } else {
    state.favorites.push(documentId);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return !isFavorited;
}

export function getDocumentProgress(documentId: string): ReadingProgress | null {
  const state = getReadingState();
  return state.progress[documentId] || null;
}
