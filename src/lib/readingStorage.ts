import { safeJsonParse } from './safeStorage'

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
const DEFAULT_STATE: ReadingState = { favorites: [], progress: {}, lastDocument: '' };

export function getReadingState(): ReadingState {
  if (typeof window === 'undefined') return DEFAULT_STATE;

  const stored = localStorage.getItem(STORAGE_KEY);
  return safeJsonParse<ReadingState>(stored, DEFAULT_STATE);
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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('[ReadingStorage] Failed to save - storage quota may be exceeded:', e)
  }
}

export function toggleFavorite(documentId: string): boolean {
  const state = getReadingState();
  const isFavorited = state.favorites.includes(documentId);

  if (isFavorited) {
    state.favorites = state.favorites.filter(id => id !== documentId);
  } else {
    state.favorites.push(documentId);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('[ReadingStorage] Failed to save - storage quota may be exceeded:', e)
  }
  return !isFavorited;
}

export function getDocumentProgress(documentId: string): ReadingProgress | null {
  const state = getReadingState();
  return state.progress[documentId] || null;
}
