import { createLogger } from '../utils/logger'

const log = createLogger('Feedback')

import { supabase, USE_SUPABASE } from '../services/supabase'
import { createNotification } from './notificationStorage'

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
    log.error('Error reading localStorage:', e)
  }
  return { items: [], lastModified: 0 }
}

function saveLocalFeedbackState(state: LocalFeedbackState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    log.error('Error saving to localStorage:', e)
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
        log.error('Supabase insert error:', error)
        // Fall through to localStorage
      } else {
        // Notify admins
        notifyAdminsOfFeedback(data)
        return { success: true }
      }
    } catch (e) {
      log.error('Supabase error:', e)
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
    // Notify admins
    notifyAdminsOfFeedback(data)
    return { success: true }
  } catch (e) {
    log.error('localStorage error:', e)
    return {
      success: false,
      error: 'Failed to save feedback. Please try again.'
    }
  }
}

/**
 * Create admin notification for feedback submission
 */
function notifyAdminsOfFeedback(data: SubmitFeedbackData): void {
  const isFeature = data.type === 'feature'
  const notificationType = isFeature ? 'feedback_feature' : 'feedback_bug'
  const title = isFeature ? `Feature Suggestion: ${data.title}` : `Bug Report: ${data.title}`

  createNotification(
    notificationType,
    title,
    data.description,
    {
      contactEmail: data.contactEmail || null,
      page: typeof window !== 'undefined' ? window.location.pathname : null,
    }
  )
}
