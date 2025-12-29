/**
 * Task Reminder System
 * Tracks action item deadlines, generates reminders, and auto-creates follow-up tasks
 */

import type { BuildingEvent, ActionItem } from './eventStorage'

export interface ReminderRecord {
  actionItemId: string
  buildingChatSlug: string
  eventId: string
  reminderSentAt: number
  dueDate: number
  status: 'pending' | 'reminded' | 'overdue' | 'completed'
}

export interface FollowUpTask {
  id: string
  sourceActionItemId: string
  description: string
  dueDate: number
  createdAt: number
  completed: boolean
}

const STORAGE_KEY = 'rstu_task_reminders'
const FOLLOW_UP_KEY = 'rstu_follow_up_tasks'
const REMINDER_ADVANCE_HOURS = 24 // Send reminder 1 day before due date

/**
 * Get all stored reminder records
 */
export function getAllReminders(): ReminderRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error reading reminders:', error)
    return []
  }
}

/**
 * Check if a reminder should be sent for an action item
 * Returns true if reminder hasn't been sent AND due date is within 24 hours
 */
export function shouldSendReminder(actionItem: ActionItem): boolean {
  if (!actionItem.dueDate || actionItem.completed) return false

  const now = Date.now()
  const hoursUntilDue = (actionItem.dueDate - now) / (1000 * 60 * 60)
  const hasBeenReminded = getAllReminders().some(r =>
    r.actionItemId === actionItem.id && r.status === 'reminded'
  )

  // Send reminder if between 24 and 0 hours until due date
  return hoursUntilDue > 0 && hoursUntilDue <= REMINDER_ADVANCE_HOURS && !hasBeenReminded
}

/**
 * Record that a reminder was sent
 */
export function recordReminderSent(
  actionItemId: string,
  buildingChatSlug: string,
  eventId: string,
  dueDate: number
): void {
  if (typeof window === 'undefined') return

  const reminders = getAllReminders()
  const reminder: ReminderRecord = {
    actionItemId,
    buildingChatSlug,
    eventId,
    reminderSentAt: Date.now(),
    dueDate,
    status: 'reminded'
  }

  reminders.push(reminder)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders))
}

/**
 * Mark a reminder as completed
 */
export function markReminderCompleted(actionItemId: string): void {
  if (typeof window === 'undefined') return

  const reminders = getAllReminders()
  const reminder = reminders.find(r => r.actionItemId === actionItemId)

  if (reminder) {
    reminder.status = 'completed'
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders))
  }
}

/**
 * Mark a reminder as overdue (past due date)
 */
export function markReminderOverdue(actionItemId: string): void {
  if (typeof window === 'undefined') return

  const reminders = getAllReminders()
  const reminder = reminders.find(r => r.actionItemId === actionItemId)

  if (reminder && reminder.status === 'reminded') {
    reminder.status = 'overdue'
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders))
  }
}

/**
 * Get overdue action items across all events
 */
export function getOverdueItems(event: BuildingEvent): ActionItem[] {
  const now = Date.now()

  return event.notes?.actionItems.filter(item =>
    !item.completed &&
    item.dueDate &&
    item.dueDate < now
  ) || []
}

/**
 * Get action items due within next 24 hours
 */
export function getUpcomingItems(event: BuildingEvent): ActionItem[] {
  const now = Date.now()
  const oneDayMs = 24 * 60 * 60 * 1000

  return event.notes?.actionItems.filter(item =>
    !item.completed &&
    item.dueDate &&
    item.dueDate > now &&
    item.dueDate <= now + oneDayMs
  ) || []
}

/**
 * Get all follow-up tasks
 */
export function getAllFollowUpTasks(): FollowUpTask[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(FOLLOW_UP_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error reading follow-up tasks:', error)
    return []
  }
}

/**
 * Create a follow-up task from a completed action item
 */
export function createFollowUpTask(
  sourceActionItemId: string,
  description: string,
  dueDateOffset: number = 7 * 24 * 60 * 60 * 1000 // 7 days by default
): FollowUpTask {
  if (typeof window === 'undefined') return {} as FollowUpTask

  const followUp: FollowUpTask = {
    id: `follow-up-${Date.now()}`,
    sourceActionItemId,
    description,
    dueDate: Date.now() + dueDateOffset,
    createdAt: Date.now(),
    completed: false
  }

  const tasks = getAllFollowUpTasks()
  tasks.push(followUp)
  localStorage.setItem(FOLLOW_UP_KEY, JSON.stringify(tasks))

  return followUp
}

/**
 * Mark a follow-up task as completed
 */
export function completeFollowUpTask(taskId: string): void {
  if (typeof window === 'undefined') return

  const tasks = getAllFollowUpTasks()
  const task = tasks.find(t => t.id === taskId)

  if (task) {
    task.completed = true
    localStorage.setItem(FOLLOW_UP_KEY, JSON.stringify(tasks))
  }
}

/**
 * Get pending follow-up tasks
 */
export function getPendingFollowUpTasks(): FollowUpTask[] {
  return getAllFollowUpTasks().filter(t => !t.completed)
}

/**
 * Get follow-up tasks for a specific source action item
 */
export function getFollowUpTasksFor(sourceActionItemId: string): FollowUpTask[] {
  return getAllFollowUpTasks().filter(t => t.sourceActionItemId === sourceActionItemId)
}

/**
 * Format due date for display
 */
export function formatDueDate(dueDate: number): string {
  return new Date(dueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Get relative time display (e.g., "in 2 days", "2 days overdue")
 */
export function getRelativeTime(dueDate: number): string {
  const now = Date.now()
  const diff = dueDate - now
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (diff >= 0) {
    if (days > 0) return `in ${days}d`
    if (hours > 0) return `in ${hours}h`
    return 'due soon'
  } else {
    const overdueDays = Math.abs(days)
    const overdueHours = Math.abs(hours)
    if (overdueDays > 0) return `${overdueDays}d overdue`
    if (overdueHours > 0) return `${overdueHours}h overdue`
    return 'overdue'
  }
}

/**
 * Export reminders for debugging/admin
 */
export function exportReminders(): string {
  const reminders = getAllReminders()
  const followUps = getAllFollowUpTasks()
  return JSON.stringify({ reminders, followUps }, null, 2)
}

/**
 * Clear all reminders (for testing/reset)
 */
export function clearAllReminders(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(FOLLOW_UP_KEY)
}
