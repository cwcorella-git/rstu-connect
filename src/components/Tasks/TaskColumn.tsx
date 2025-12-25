'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Task, TaskStatus, TASK_STATUSES } from '@/lib/taskStorage'
import { TaskCard } from './TaskCard'

interface TaskColumnProps {
  status: TaskStatus
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onDrop: (taskId: string, newStatus: TaskStatus) => void
}

export function TaskColumn({ status, tasks, onTaskClick, onDrop }: TaskColumnProps) {
  const { t } = useLanguage()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const statusConfig = TASK_STATUSES.find(s => s.value === status)
  const statusLabel = statusConfig ? t(statusConfig.labelKey) : status

  const getStatusColor = () => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 border-gray-300'
      case 'in_progress':
        return 'bg-blue-50 border-blue-300'
      case 'blocked':
        return 'bg-red-50 border-red-300'
      case 'done':
        return 'bg-green-50 border-green-300'
      default:
        return 'bg-gray-100 border-gray-300'
    }
  }

  const getHeaderColor = () => {
    switch (status) {
      case 'todo':
        return 'bg-gray-200 text-gray-700'
      case 'in_progress':
        return 'bg-blue-200 text-blue-800'
      case 'blocked':
        return 'bg-red-200 text-red-800'
      case 'done':
        return 'bg-green-200 text-green-800'
      default:
        return 'bg-gray-200 text-gray-700'
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) {
      onDrop(taskId, status)
    }
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
  }

  return (
    <div
      className={`flex flex-col rounded-lg border-2 ${getStatusColor()} ${
        isDragOver ? 'ring-2 ring-blue-400' : ''
      } transition-all`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div
        className={`flex items-center justify-between px-3 py-2 rounded-t-md cursor-pointer ${getHeaderColor()}`}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{statusLabel}</span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/50 text-xs font-medium">
            {tasks.length}
          </span>
        </div>
        <button className="p-1 hover:bg-white/30 rounded">
          <svg
            className={`w-4 h-4 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Task List */}
      {!isCollapsed && (
        <div className="flex-1 p-2 space-y-2 min-h-[100px] max-h-[calc(100vh-300px)] overflow-y-auto">
          {tasks.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm italic">
              {t('tasks.noTasks')}
            </div>
          ) : (
            tasks.map(task => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                className="cursor-grab active:cursor-grabbing"
              >
                <TaskCard task={task} onClick={() => onTaskClick(task)} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
