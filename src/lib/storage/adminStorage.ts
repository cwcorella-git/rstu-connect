'use client'
import { createLogger } from '../utils/logger'

const log = createLogger('Admin')

import { isAdmin as checkProfileAdmin, getCurrentProfile } from './profileStorage'
import { safeJsonParse } from '../utils/safeStorage'
import {
  USE_SUPABASE,
  getDocumentAdminState as getDbAdminState,
  setDocumentHidden as setDbHidden,
  setDocumentDeleted as setDbDeleted,
  getDocumentEdits as getDbEdits,
  saveDocumentEdit as saveDbEdit,
  deleteDocumentEdit as deleteDbEdit
} from '../services/supabase'

const ADMIN_KEY = 'rstu_admin_state';
const AUTH_KEY = 'rstu_admin_auth';
const EDITS_KEY = 'rstu_document_edits';

// Legacy password hash (SHA-256) - DEPRECATED
// New admins should use profile-based auth via invite codes
// Set NEXT_PUBLIC_LEGACY_ADMIN_HASH to enable legacy auth (not recommended)
const PASSWORD_HASH = process.env.NEXT_PUBLIC_LEGACY_ADMIN_HASH || '';

export interface AdminState {
  hiddenDocuments: string[]; // Array of document IDs to hide
  deletedDocuments: string[]; // Array of document IDs permanently deleted
  lastModified: number;
}

export interface DocumentEdit {
  documentId: string;
  title: string;
  content: string;
  editedAt: number;
}

export interface AdminAuth {
  authenticated: boolean;
  expiresAt: number; // Session expires after 24 hours
}

// Authentication functions
export function checkAdminAuth(): boolean {
  if (typeof window === 'undefined') return false;

  // Primary: Check if user has admin role via profile system
  if (checkProfileAdmin()) {
    return true;
  }

  // Fallback: Check legacy password-based auth (for backwards compatibility)
  const stored = localStorage.getItem(AUTH_KEY);
  if (!stored) return false;

  try {
    const auth: AdminAuth = JSON.parse(stored);
    if (auth.authenticated && auth.expiresAt > Date.now()) {
      return true;
    }
  } catch {
    return false;
  }

  // Clear expired auth
  localStorage.removeItem(AUTH_KEY);
  return false;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Legacy auth disabled if no password hash configured
  if (!PASSWORD_HASH) {
    log.warn('Legacy password auth is disabled. Use profile-based auth instead.');
    return false;
  }

  // Hash the input password
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  if (hashHex === PASSWORD_HASH) {
    // Set auth with 24 hour expiration
    const auth: AdminAuth = {
      authenticated: true,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000)
    };
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    } catch (e) {
      log.error('Failed to save auth - storage quota may be exceeded:', e)
    }
    return true;
  }

  return false;
}

export function logoutAdmin() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_KEY);
}

// Admin state functions
export function getAdminState(): AdminState {
  if (typeof window === 'undefined') return { hiddenDocuments: [], deletedDocuments: [], lastModified: 0 };

  const stored = localStorage.getItem(ADMIN_KEY);
  if (!stored) return { hiddenDocuments: [], deletedDocuments: [], lastModified: 0 };

  try {
    const parsed = JSON.parse(stored);
    // Ensure backwards compatibility - add missing properties
    return {
      hiddenDocuments: parsed.hiddenDocuments || [],
      deletedDocuments: parsed.deletedDocuments || [],
      lastModified: parsed.lastModified || 0
    };
  } catch {
    return { hiddenDocuments: [], deletedDocuments: [], lastModified: 0 };
  }
}

export function saveAdminState(state: AdminState) {
  if (typeof window === 'undefined') return;

  state.lastModified = Date.now();
  try {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(state));
  } catch (e) {
    log.error('Failed to save state - storage quota may be exceeded:', e)
  }
}

export function toggleDocumentVisibility(documentId: string): boolean {
  const state = getAdminState();
  const isHidden = state.hiddenDocuments.includes(documentId);

  if (isHidden) {
    state.hiddenDocuments = state.hiddenDocuments.filter(id => id !== documentId);
  } else {
    state.hiddenDocuments.push(documentId);
  }

  saveAdminState(state);
  return !isHidden;
}

export function deleteDocument(documentId: string): boolean {
  const state = getAdminState();

  if (!state.deletedDocuments.includes(documentId)) {
    state.deletedDocuments.push(documentId);
    // Also remove from hidden list if present
    state.hiddenDocuments = state.hiddenDocuments.filter(id => id !== documentId);
    saveAdminState(state);
    return true;
  }

  return false;
}

export function restoreDocument(documentId: string): boolean {
  const state = getAdminState();

  if (state.deletedDocuments.includes(documentId)) {
    state.deletedDocuments = state.deletedDocuments.filter(id => id !== documentId);
    saveAdminState(state);
    return true;
  }

  return false;
}

export function exportAdminState(): string {
  const state = getAdminState();
  return JSON.stringify(state, null, 2);
}

export function importAdminState(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed && typeof parsed === 'object') {
      // Ensure all required properties exist with defaults
      const state: AdminState = {
        hiddenDocuments: Array.isArray(parsed.hiddenDocuments) ? parsed.hiddenDocuments : [],
        deletedDocuments: Array.isArray(parsed.deletedDocuments) ? parsed.deletedDocuments : [],
        lastModified: parsed.lastModified || Date.now()
      };
      saveAdminState(state);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Document editing functions
export function getDocumentEdits(): Record<string, DocumentEdit> {
  if (typeof window === 'undefined') return {};

  const stored = localStorage.getItem(EDITS_KEY);
  return safeJsonParse<Record<string, DocumentEdit>>(stored, {});
}

export function saveDocumentEdit(documentId: string, title: string, content: string) {
  if (typeof window === 'undefined') return;

  const edits = getDocumentEdits();
  edits[documentId] = {
    documentId,
    title,
    content,
    editedAt: Date.now()
  };

  try {
    localStorage.setItem(EDITS_KEY, JSON.stringify(edits));
  } catch (e) {
    log.error('Failed to save edit - storage quota may be exceeded:', e)
  }
}

export function getDocumentEdit(documentId: string): DocumentEdit | null {
  const edits = getDocumentEdits();
  return edits[documentId] || null;
}

export function deleteDocumentEdit(documentId: string) {
  if (typeof window === 'undefined') return;

  const edits = getDocumentEdits();
  delete edits[documentId];
  try {
    localStorage.setItem(EDITS_KEY, JSON.stringify(edits));
  } catch (e) {
    log.error('Failed to save after delete - storage quota may be exceeded:', e)
  }
}

export function exportDocumentEdits(): string {
  const edits = getDocumentEdits();
  return JSON.stringify(edits, null, 2);
}

// ============================================
// Async Database-Synced Functions
// ============================================

/**
 * Sync admin state from database on app load
 * Merges database state with localStorage
 */
export async function syncAdminStateFromDatabase(): Promise<AdminState> {
  const localState = getAdminState()

  if (!USE_SUPABASE) {
    return localState
  }

  try {
    const dbState = await getDbAdminState()

    // Merge database state with local state (database takes priority)
    const mergedState: AdminState = {
      hiddenDocuments: Array.from(new Set([...localState.hiddenDocuments, ...dbState.hidden])),
      deletedDocuments: Array.from(new Set([...localState.deletedDocuments, ...dbState.deleted])),
      lastModified: Date.now()
    }

    // Update localStorage with merged state
    saveAdminState(mergedState)
    return mergedState
  } catch (error) {
    log.error('Failed to sync from database:', error)
    return localState
  }
}

/**
 * Sync document edits from database on app load
 * Merges database edits with localStorage
 */
export async function syncDocumentEditsFromDatabase(): Promise<Record<string, DocumentEdit>> {
  const localEdits = getDocumentEdits()

  if (!USE_SUPABASE) {
    return localEdits
  }

  try {
    const dbEdits = await getDbEdits()

    // Merge database edits with local (database takes priority for same document)
    const mergedEdits: Record<string, DocumentEdit> = { ...localEdits }

    dbEdits.forEach((edit, docId) => {
      mergedEdits[docId] = {
        documentId: docId,
        title: edit.title,
        content: edit.content || '',
        editedAt: Date.now()
      }
    })

    // Update localStorage with merged edits
    try {
      localStorage.setItem(EDITS_KEY, JSON.stringify(mergedEdits))
    } catch (e) {
      log.error('Failed to save merged edits:', e)
    }

    return mergedEdits
  } catch (error) {
    log.error('Failed to sync edits from database:', error)
    return localEdits
  }
}

/**
 * Toggle document visibility and sync to database
 */
export async function toggleDocumentVisibilityAsync(documentId: string): Promise<boolean> {
  const state = getAdminState()
  const isHidden = state.hiddenDocuments.includes(documentId)
  const newHiddenState = !isHidden

  // Update localStorage first
  if (isHidden) {
    state.hiddenDocuments = state.hiddenDocuments.filter(id => id !== documentId)
  } else {
    state.hiddenDocuments.push(documentId)
  }
  saveAdminState(state)

  // Sync to database
  if (USE_SUPABASE) {
    const profile = getCurrentProfile()
    const adminId = profile?.id || 'unknown'
    await setDbHidden(documentId, newHiddenState, adminId)
  }

  return newHiddenState
}

/**
 * Delete document and sync to database
 */
export async function deleteDocumentAsync(documentId: string): Promise<boolean> {
  const state = getAdminState()

  if (state.deletedDocuments.includes(documentId)) {
    return false
  }

  // Update localStorage
  state.deletedDocuments.push(documentId)
  state.hiddenDocuments = state.hiddenDocuments.filter(id => id !== documentId)
  saveAdminState(state)

  // Sync to database
  if (USE_SUPABASE) {
    const profile = getCurrentProfile()
    const adminId = profile?.id || 'unknown'
    await setDbDeleted(documentId, true, adminId)
    // Also clear hidden status in database
    await setDbHidden(documentId, false, adminId)
  }

  return true
}

/**
 * Restore document and sync to database
 */
export async function restoreDocumentAsync(documentId: string): Promise<boolean> {
  const state = getAdminState()

  if (!state.deletedDocuments.includes(documentId)) {
    return false
  }

  // Update localStorage
  state.deletedDocuments = state.deletedDocuments.filter(id => id !== documentId)
  saveAdminState(state)

  // Sync to database
  if (USE_SUPABASE) {
    const profile = getCurrentProfile()
    const adminId = profile?.id || 'unknown'
    await setDbDeleted(documentId, false, adminId)
  }

  return true
}

/**
 * Save document edit and sync to database
 */
export async function saveDocumentEditAsync(documentId: string, title: string, content: string): Promise<void> {
  // Save to localStorage
  saveDocumentEdit(documentId, title, content)

  // Sync to database
  if (USE_SUPABASE) {
    const profile = getCurrentProfile()
    const adminId = profile?.id || 'unknown'
    await saveDbEdit(documentId, title, content, adminId)
  }
}

/**
 * Delete document edit and sync to database
 */
export async function deleteDocumentEditAsync(documentId: string): Promise<void> {
  // Delete from localStorage
  deleteDocumentEdit(documentId)

  // Delete from database
  if (USE_SUPABASE) {
    await deleteDbEdit(documentId)
  }
}

// ============================================
// Featured Documents Functions
// ============================================

const FEATURED_KEY = 'rstu_featured_documents'

/**
 * Get all featured document IDs from localStorage
 */
export function getFeaturedDocuments(): string[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(FEATURED_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Toggle featured status for a document (localStorage only)
 */
export function toggleDocumentFeatured(documentId: string): boolean {
  if (typeof window === 'undefined') return false

  try {
    const featured = getFeaturedDocuments()
    const isFeatured = featured.includes(documentId)

    if (isFeatured) {
      // Remove from featured
      const updated = featured.filter(id => id !== documentId)
      localStorage.setItem(FEATURED_KEY, JSON.stringify(updated))
      return false
    } else {
      // Add to featured
      featured.push(documentId)
      localStorage.setItem(FEATURED_KEY, JSON.stringify(featured))
      return true
    }
  } catch (e) {
    log.error('Failed to toggle featured document:', e)
    return false
  }
}

/**
 * Toggle featured status for a document and sync to database
 */
export async function toggleDocumentFeaturedAsync(documentId: string): Promise<boolean> {
  // Update localStorage
  const isFeatured = toggleDocumentFeatured(documentId)

  // Sync to database if enabled
  if (USE_SUPABASE) {
    try {
      const profile = getCurrentProfile()
      const adminId = profile?.id || 'unknown'

      // Note: This requires the Supabase table to be created
      // For now, we'll just sync to localStorage
      // If Supabase is set up, the actual sync can be implemented in supabase.ts
    } catch (e) {
      log.error('Failed to sync featured document to database:', e)
    }
  }

  return isFeatured
}
