'use client'

import { getSocket } from './socketio'
import { safeJsonParse } from './safeStorage'
import { sanitizeText, sanitizeRichText } from './sanitize'

// ============================================================================
// Types
// ============================================================================

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export type TaskType =
  | 'outreach_phone'
  | 'outreach_door'
  | 'outreach_flyer'
  | 'event_planning'
  | 'event_logistics'
  | 'legal_research'
  | 'media_press'
  | 'admin_paperwork'
  | 'meeting_prep'
  | 'follow_up'
  | 'other'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  type: TaskType
  assigneeIds: string[]
  assigneeNames: string[]
  campaignId?: string
  campaignName?: string
  buildingId?: string
  buildingName?: string
  dueDate?: number
  createdBy: string
  createdByName: string
  createdAt: number
  updatedAt: number
  completedAt?: number
}

export interface TaskFilters {
  status?: TaskStatus
  priority?: TaskPriority
  type?: TaskType
  assigneeId?: string
  campaignId?: string
  buildingId?: string
}

export const TASK_TYPES: { value: TaskType; labelKey: string }[] = [
  { value: 'outreach_phone', labelKey: 'tasks.outreachPhone' },
  { value: 'outreach_door', labelKey: 'tasks.outreachDoor' },
  { value: 'outreach_flyer', labelKey: 'tasks.outreachFlyer' },
  { value: 'event_planning', labelKey: 'tasks.eventPlanning' },
  { value: 'event_logistics', labelKey: 'tasks.eventLogistics' },
  { value: 'legal_research', labelKey: 'tasks.legalResearch' },
  { value: 'media_press', labelKey: 'tasks.mediaPress' },
  { value: 'admin_paperwork', labelKey: 'tasks.adminPaperwork' },
  { value: 'meeting_prep', labelKey: 'tasks.meetingPrep' },
  { value: 'follow_up', labelKey: 'tasks.followUp' },
  { value: 'other', labelKey: 'tasks.other' },
]

export const TASK_PRIORITIES: { value: TaskPriority; labelKey: string; color: string }[] = [
  { value: 'low', labelKey: 'tasks.low', color: 'bg-gray-100 text-gray-600' },
  { value: 'medium', labelKey: 'tasks.medium', color: 'bg-blue-100 text-blue-700' },
  { value: 'high', labelKey: 'tasks.high', color: 'bg-orange-100 text-orange-700' },
  { value: 'urgent', labelKey: 'tasks.urgent', color: 'bg-red-100 text-red-700' },
]

export const TASK_STATUSES: { value: TaskStatus; labelKey: string }[] = [
  { value: 'todo', labelKey: 'tasks.todo' },
  { value: 'in_progress', labelKey: 'tasks.inProgress' },
  { value: 'blocked', labelKey: 'tasks.blocked' },
  { value: 'done', labelKey: 'tasks.done' },
]

// ============================================================================
// Local Storage
// ============================================================================

const TASKS_KEY = 'rstu-tasks'

function generateId(): string {
  let shortId: string
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    shortId = crypto.randomUUID().split('-')[0]
  } else if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(4)
    crypto.getRandomValues(bytes)
    shortId = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  } else {
    throw new Error('Crypto API not available')
  }
  return `task-${Date.now()}-${shortId}`
}

// ============================================================================
// Task Functions
// ============================================================================

export function getTasks(): Task[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(TASKS_KEY)
  return safeJsonParse<Task[]>(stored, [])
}

export function getTask(id: string): Task | null {
  const tasks = getTasks()
  return tasks.find(t => t.id === id) || null
}

export function getTasksByStatus(status: TaskStatus): Task[] {
  return getTasks().filter(t => t.status === status)
}

export function getTasksByAssignee(profileId: string): Task[] {
  return getTasks().filter(t => t.assigneeIds.includes(profileId))
}

export function getTasksByCampaign(campaignId: string): Task[] {
  return getTasks().filter(t => t.campaignId === campaignId)
}

export function getTasksByBuilding(buildingId: string): Task[] {
  return getTasks().filter(t => t.buildingId === buildingId)
}

export function getFilteredTasks(filters: TaskFilters): Task[] {
  let tasks = getTasks()

  if (filters.status) {
    tasks = tasks.filter(t => t.status === filters.status)
  }
  if (filters.priority) {
    tasks = tasks.filter(t => t.priority === filters.priority)
  }
  if (filters.type) {
    tasks = tasks.filter(t => t.type === filters.type)
  }
  if (filters.assigneeId) {
    tasks = tasks.filter(t => t.assigneeIds.includes(filters.assigneeId!))
  }
  if (filters.campaignId) {
    tasks = tasks.filter(t => t.campaignId === filters.campaignId)
  }
  if (filters.buildingId) {
    tasks = tasks.filter(t => t.buildingId === filters.buildingId)
  }

  return tasks
}

export function saveTask(task: Task): void {
  if (typeof window === 'undefined') return

  const tasks = getTasks()
  const index = tasks.findIndex(t => t.id === task.id)

  if (index >= 0) {
    tasks[index] = task
  } else {
    tasks.push(task)
  }

  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))

  // Sync to server
  const socket = getSocket()
  if (socket) {
    socket.emit('task:save', { task })
  }
}

export function createTask(data: {
  title: string
  description?: string
  priority?: TaskPriority
  type?: TaskType
  campaignId?: string
  campaignName?: string
  buildingId?: string
  buildingName?: string
  dueDate?: number
  createdBy: string
  createdByName: string
}): Task {
  const task: Task = {
    id: generateId(),
    title: sanitizeText(data.title),
    description: sanitizeRichText(data.description || ''),
    status: 'todo',
    priority: data.priority || 'medium',
    type: data.type || 'other',
    assigneeIds: [],
    assigneeNames: [],
    campaignId: data.campaignId,
    campaignName: data.campaignName ? sanitizeText(data.campaignName) : undefined,
    buildingId: data.buildingId,
    buildingName: data.buildingName ? sanitizeText(data.buildingName) : undefined,
    dueDate: data.dueDate,
    createdBy: data.createdBy,
    createdByName: sanitizeText(data.createdByName),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  saveTask(task)
  return task
}

export function updateTask(taskId: string, updates: Partial<Task>): Task | null {
  const task = getTask(taskId)
  if (!task) return null

  const updated: Task = {
    ...task,
    ...updates,
    updatedAt: Date.now(),
  }

  // Set completedAt if just completed
  if (updates.status === 'done' && !task.completedAt) {
    updated.completedAt = Date.now()
  }

  saveTask(updated)
  return updated
}

export function moveTask(taskId: string, newStatus: TaskStatus): Task | null {
  return updateTask(taskId, { status: newStatus })
}

export function assignTask(taskId: string, profileId: string, profileName: string): Task | null {
  const task = getTask(taskId)
  if (!task) return null

  if (task.assigneeIds.includes(profileId)) return task

  const updated: Task = {
    ...task,
    assigneeIds: [...task.assigneeIds, profileId],
    assigneeNames: [...task.assigneeNames, profileName],
    updatedAt: Date.now(),
  }

  saveTask(updated)

  // Sync to server
  const socket = getSocket()
  if (socket) {
    socket.emit('task:assign', { taskId, profileId, profileName, assign: true })
  }

  return updated
}

export function unassignTask(taskId: string, profileId: string): Task | null {
  const task = getTask(taskId)
  if (!task) return null

  const idx = task.assigneeIds.indexOf(profileId)
  if (idx < 0) return task

  const updated: Task = {
    ...task,
    assigneeIds: task.assigneeIds.filter((_, i) => i !== idx),
    assigneeNames: task.assigneeNames.filter((_, i) => i !== idx),
    updatedAt: Date.now(),
  }

  saveTask(updated)

  // Sync to server
  const socket = getSocket()
  if (socket) {
    socket.emit('task:assign', { taskId, profileId, profileName: '', assign: false })
  }

  return updated
}

export function deleteTask(taskId: string): void {
  if (typeof window === 'undefined') return

  const tasks = getTasks().filter(t => t.id !== taskId)
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))

  // Sync to server
  const socket = getSocket()
  if (socket) {
    socket.emit('task:delete', { taskId })
  }
}

// ============================================================================
// Socket.io Sync Helpers
// ============================================================================

export function syncTasksFromServer(tasks: Task[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
}

export function updateTaskFromServer(task: Task): void {
  if (typeof window === 'undefined') return

  const tasks = getTasks()
  const index = tasks.findIndex(t => t.id === task.id)

  if (index >= 0) {
    tasks[index] = task
  } else {
    tasks.push(task)
  }

  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
}

export function removeTaskFromServer(taskId: string): void {
  if (typeof window === 'undefined') return
  const tasks = getTasks().filter(t => t.id !== taskId)
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
}

// ============================================================================
// Date Helpers
// ============================================================================

export function isOverdue(task: Task): boolean {
  if (!task.dueDate) return false
  if (task.status === 'done') return false
  return task.dueDate < Date.now()
}

export function isDueSoon(task: Task): boolean {
  if (!task.dueDate) return false
  if (task.status === 'done') return false
  const threeDays = 3 * 24 * 60 * 60 * 1000
  return task.dueDate < Date.now() + threeDays && task.dueDate >= Date.now()
}

export function formatDueDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === now.toDateString()) {
    return 'Today'
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow'
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function getPriorityColor(priority: TaskPriority): string {
  const p = TASK_PRIORITIES.find(p => p.value === priority)
  return p?.color || 'bg-gray-100 text-gray-600'
}
