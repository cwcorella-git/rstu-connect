'use client'

const ADMIN_KEY = 'rstu_admin_state';

export interface AdminState {
  hiddenDocuments: string[]; // Array of document IDs to hide
  lastModified: number;
}

export function getAdminState(): AdminState {
  if (typeof window === 'undefined') return { hiddenDocuments: [], lastModified: 0 };

  const stored = localStorage.getItem(ADMIN_KEY);
  return stored ? JSON.parse(stored) : { hiddenDocuments: [], lastModified: 0 };
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
