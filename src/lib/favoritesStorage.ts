import { createLogger } from './logger'

const log = createLogger('Favorites')

// Simple localStorage utility for favorite properties

const STORAGE_KEY = 'rstu-favorite-properties';

export function getFavorites(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

export function isFavorite(apn: string): boolean {
  return getFavorites().has(apn);
}

export function toggleFavorite(apn: string): boolean {
  const favorites = getFavorites();
  const isNowFavorite = !favorites.has(apn);

  if (isNowFavorite) {
    favorites.add(apn);
  } else {
    favorites.delete(apn);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favorites)));
  } catch (e) {
    log.error('Failed to save - storage quota may be exceeded:', e)
  }
  return isNowFavorite;
}
