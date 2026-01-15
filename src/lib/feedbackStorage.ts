import { supabase, USE_SUPABASE } from './supabase'

// Type definitions
export interface FeedbackItem {
  id: string
  type: 'feature' | 'bug'
  title: string
  description: string
  contact_email?: string | null
  user_agent?: string | null
  current_page?: string | null
  created_at: string
  status: 'submitted' | 'reviewed' | 'implemented' | 'closed'
}

export interface SubmitFeedbackData {
  type: 'feature' | 'bug'
  title: string
  description: string
  contactEmail?: string
}

export interface SubmitFeedbackResult {
  success: boolean
  error?: string
}

// localStorage fallback key
const STORAGE_KEY = 'rstu_feedback'

interface LocalFeedbackState {
  items: FeedbackItem[]
  lastModified: number
}

function getLocalFeedbackState(): LocalFeedbackState {
  if (typeof window === 'undefined') {
    return { items: [], lastModified: 0 }
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('[FeedbackStorage] Error reading localStorage:', e)
  }
  return { items: [], lastModified: 0 }
}

function saveLocalFeedbackState(state: LocalFeedbackState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('[FeedbackStorage] Error saving to localStorage:', e)
  }
}

/**
 * Submit feedback to Supabase (or localStorage fallback)
 */
export async function submitFeedback(data: SubmitFeedbackData): Promise<SubmitFeedbackResult> {
  const feedbackRecord = {
    type: data.type,
    title: data.title.trim(),
    description: data.description.trim(),
    contact_email: data.contactEmail?.trim() || null,
    user_agent: typeof window !== 'undefined' ? navigator.userAgent : null,
    current_page: typeof window !== 'undefined' ? window.location.pathname : null,
  }

  // Try Supabase first
  if (USE_SUPABASE && supabase) {
    try {
      const { error } = await supabase
        .from('feedback')
        .insert([feedbackRecord])

      if (error) {
        console.error('[FeedbackStorage] Supabase insert error:', error)
        // Fall through to localStorage
      } else {
        return { success: true }
      }
    } catch (e) {
      console.error('[FeedbackStorage] Supabase error:', e)
      // Fall through to localStorage
    }
  }

  // localStorage fallback
  try {
    const state = getLocalFeedbackState()
    const newItem: FeedbackItem = {
      id: crypto.randomUUID(),
      ...feedbackRecord,
      created_at: new Date().toISOString(),
      status: 'submitted',
    }
    state.items.push(newItem)
    state.lastModified = Date.now()
    saveLocalFeedbackState(state)
    return { success: true }
  } catch (e) {
    console.error('[FeedbackStorage] localStorage error:', e)
    return {
      success: false,
      error: 'Failed to save feedback. Please try again.'
    }
  }
}

/**
 * Get all feedback (for admin use - only works with localStorage fallback)
 * Supabase has RLS blocking reads from the app
 */
export function getAllFeedback(): FeedbackItem[] {
  const state = getLocalFeedbackState()
  return state.items.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}
