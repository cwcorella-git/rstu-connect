'use client'

const ADMIN_KEY = 'rstu_admin_state';
const AUTH_KEY = 'rstu_admin_auth';
const EDITS_KEY = 'rstu_document_edits';

// Password hash (SHA-256)
// To change: run `echo -n "your-password" | sha256sum` in terminal
const PASSWORD_HASH = '5d532a96025bc1ae5ea03e724c75b75d5a5b7ce5c7c3dd9115449d3a21adc15d';

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
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
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
  return stored ? JSON.parse(stored) : { hiddenDocuments: [], deletedDocuments: [], lastModified: 0 };
}

export function saveAdminState(state: AdminState) {
  if (typeof window === 'undefined') return;

  state.lastModified = Date.now();
  localStorage.setItem(ADMIN_KEY, JSON.stringify(state));
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
    const state = JSON.parse(jsonString);
    if (state.hiddenDocuments && Array.isArray(state.hiddenDocuments)) {
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
  return stored ? JSON.parse(stored) : {};
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

  localStorage.setItem(EDITS_KEY, JSON.stringify(edits));
}

export function getDocumentEdit(documentId: string): DocumentEdit | null {
  const edits = getDocumentEdits();
  return edits[documentId] || null;
}

export function deleteDocumentEdit(documentId: string) {
  if (typeof window === 'undefined') return;

  const edits = getDocumentEdits();
  delete edits[documentId];
  localStorage.setItem(EDITS_KEY, JSON.stringify(edits));
}

export function exportDocumentEdits(): string {
  const edits = getDocumentEdits();
  return JSON.stringify(edits, null, 2);
}
