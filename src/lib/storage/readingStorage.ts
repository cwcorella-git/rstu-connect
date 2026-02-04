import { createLogger } from '../utils/logger'

const log = createLogger('Reading')

import { safeJsonParse } from '../utils/safeStorage'

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
  defaultsApplied?: boolean;   // Track if default favorites were applied
}

const STORAGE_KEY = 'rstu_reading_state';

// Essential texts every tenant should read - these are pre-favorited for new users
// Users can unfavorite them and they won't be re-added
export const DEFAULT_FAVORITES = [
  // Core Tenant Organizing (Practical)
  'organizing-how-to-organize-a-tenants-association',
  'organizing-rent-strike-toolkit-guide',
  'housing-abolish-rent-how-tenants-can-solve-the-housing-crisis-tracy-rosenthal-leonardo',
  'housing-101-notes-on-the-la-tenants-union-commune',
  'organizing-picking-fights-seventeen-years-of-organizing-in-the-seattle-solidarity-network',
  'housing-autonomous-tenants-union-tactics-of-the-autonomous-tenants-union',

  // Foundational Theory
  'contemporary-analysis-the-leftwing-deadbeat',
  'organizing-mutual-aid-peter-kropotkin',
  'organizing-article-mutual-aid-dean-spade',
  'theory-the-conquest-of-bread-peter-kropotkin',
  'organizing-murray-bookchin-libertarian-municipalism-an-overview-a4',

  // Direct Action & Strategy
  'organizing-david-graeber-direct-action',
  'organizing-community-democracy-and-mutual-aid',
];

const DEFAULT_STATE: ReadingState = { favorites: [], progress: {}, lastDocument: '', defaultsApplied: false };

export function getReadingState(): ReadingState {
  if (typeof window === 'undefined') return DEFAULT_STATE;

  const stored = localStorage.getItem(STORAGE_KEY);
  const state = safeJsonParse<ReadingState>(stored, DEFAULT_STATE);

  // Apply default favorites for new users (only once)
  if (!state.defaultsApplied) {
    state.favorites = [...DEFAULT_FAVORITES];
    state.defaultsApplied = true;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      log.error('Failed to save defaults:', e);
    }
  }

  return state;
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
    log.error('Failed to save - storage quota may be exceeded:', e)
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
    log.error('Failed to save - storage quota may be exceeded:', e)
  }
  return !isFavorited;
}

export function getDocumentProgress(documentId: string): ReadingProgress | null {
  const state = getReadingState();
  return state.progress[documentId] || null;
}
