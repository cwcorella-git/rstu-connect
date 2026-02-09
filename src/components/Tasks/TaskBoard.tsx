'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskType,
  getTasks,
  moveTask,
  initializeSeedTasks,
  migrateTaskDocumentSlugs,
  TASK_STATUSES,
  TASK_PRIORITIES,
  TASK_TYPES,
} from '@/lib/storage/taskStorage'
import { getSocket } from '@/lib/services/socketio'
import { getCurrentProfile } from '@/lib/storage/profileStorage'
import { TaskColumn } from './TaskColumn'
import { TaskDetail } from './TaskDetail'
import { TaskForm } from './TaskForm'

interface TaskBoardProps {
  campaignId?: string
  buildingId?: string
}

export function TaskBoard({ campaignId, buildingId }: TaskBoardProps) {
  const { t } = useLanguage()
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showMyTasks, setShowMyTasks] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('')
  const [typeFilter, setTypeFilter] = useState<TaskType | ''>('')

  const profile = getCurrentProfile()

  const loadTasks = useCallback(() => {
    let allTasks = getTasks()

    // Filter by campaign or building if provided
    if (campaignId) {
      allTasks = allTasks.filter(t => t.campaignId === campaignId)
    }
    if (buildingId) {
      allTasks = allTasks.filter(t => t.buildingId === buildingId)
    }

    // Apply additional filters
    if (showMyTasks && profile) {
      allTasks = allTasks.filter(t => t.assigneeIds.includes(profile.id))
    }
    if (priorityFilter) {
      allTasks = allTasks.filter(t => t.priority === priorityFilter)
    }
    if (typeFilter) {
      allTasks = allTasks.filter(t => t.type === typeFilter)
    }

    setTasks(allTasks)
  }, [campaignId, buildingId, showMyTasks, priorityFilter, typeFilter, profile])

  useEffect(() => {
    // Initialize seed tasks on first load
    initializeSeedTasks()
    // Migrate old document slugs to new format
    migrateTaskDocumentSlugs()
    loadTasks()

    // Listen for real-time updates
    const socket = getSocket()
    if (socket) {
      const handleTaskUpdate = () => loadTasks()
      socket.on('task:updated', handleTaskUpdate)
      socket.on('task:created', handleTaskUpdate)
      socket.on('task:deleted', handleTaskUpdate)

      return () => {
        socket.off('task:updated', handleTaskUpdate)
        socket.off('task:created', handleTaskUpdate)
        socket.off('task:deleted', handleTaskUpdate)
      }
    }
  }, [loadTasks])

  const handleDrop = (taskId: string, newStatus: TaskStatus) => {
    moveTask(taskId, newStatus)
    loadTasks()
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
  }

  const handleCloseDetail = () => {
    setSelectedTask(null)
    loadTasks()
  }

  const handleCloseForm = () => {
    setShowForm(false)
    loadTasks()
  }

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(t => t.status === status)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 border-b">
        {/* Add Task Button */}
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rstu-red text-white rounded-md text-sm font-medium hover:bg-red-700"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('tasks.addTask')}
        </button>

        {/* My Tasks Toggle */}
        {profile && (
          <button
            onClick={() => setShowMyTasks(!showMyTasks)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              showMyTasks
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
            }`}
          >
            {t('tasks.myTasks')}
          </button>
        )}

        <div className="flex-1" />

        {/* Filters */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')}
          className="px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-white"
        >
          <option value="">{t('tasks.allPriorities')}</option>
          {TASK_PRIORITIES.map(p => (
            <option key={p.value} value={p.value}>
              {t(p.labelKey)}
            </option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TaskType | '')}
          className="px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-white"
        >
          <option value="">{t('tasks.allTypes')}</option>
          {TASK_TYPES.map(tt => (
            <option key={tt.value} value={tt.value}>
              {t(tt.labelKey)}
            </option>
          ))}
        </select>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-3">
        <div className="grid grid-cols-4 gap-3 min-w-[800px] h-full">
          {TASK_STATUSES.map(status => (
            <TaskColumn
              key={status.value}
              status={status.value}
              tasks={getTasksByStatus(status.value)}
              onTaskClick={handleTaskClick}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={handleCloseDetail}
          onUpdate={loadTasks}
        />
      )}

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          campaignId={campaignId}
          buildingId={buildingId}
          onClose={handleCloseForm}
          onSave={loadTasks}
        />
      )}
    </div>
  )
}
