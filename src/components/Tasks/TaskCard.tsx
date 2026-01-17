'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  Task,
  TaskStatus,
  isOverdue,
  isDueSoon,
  formatDueDate,
  getPriorityColor,
  TASK_TYPES,
  TASK_STATUSES,
} from '@/lib/taskStorage'

interface TaskCardProps {
  task: Task
  onClick: () => void
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void
}

// Get status icon for move buttons
function getStatusIcon(status: TaskStatus): string {
  switch (status) {
    case 'todo': return '○'
    case 'in_progress': return '◐'
    case 'blocked': return '⊘'
    case 'done': return '●'
    default: return '○'
  }
}

// Get status color for buttons
function getStatusButtonColor(status: TaskStatus): string {
  switch (status) {
    case 'todo': return 'bg-gray-100 hover:bg-gray-200 text-gray-700'
    case 'in_progress': return 'bg-blue-100 hover:bg-blue-200 text-blue-700'
    case 'blocked': return 'bg-red-100 hover:bg-red-200 text-red-700'
    case 'done': return 'bg-green-100 hover:bg-green-200 text-green-700'
    default: return 'bg-gray-100 hover:bg-gray-200 text-gray-700'
  }
}

export function TaskCard({ task, onClick, onStatusChange }: TaskCardProps) {
  const { t } = useLanguage()
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  const overdue = isOverdue(task)
  const dueSoon = isDueSoon(task)
  const priorityColor = getPriorityColor(task.priority)
  const typeLabel = TASK_TYPES.find(tt => tt.value === task.type)?.labelKey

  // Get available status transitions (exclude current)
  const availableStatuses = TASK_STATUSES.filter(s => s.value !== task.status)

  const handleStatusChange = (e: React.MouseEvent, newStatus: TaskStatus) => {
    e.stopPropagation()
    if (onStatusChange) {
      onStatusChange(task.id, newStatus)
    }
    setShowStatusMenu(false)
  }

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowStatusMenu(!showStatusMenu)
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-shadow relative group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2">
          {task.title}
        </h4>
        <span className={`px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${priorityColor}`}>
          {t(`tasks.${task.priority}`)}
        </span>
      </div>

      {/* Type badge */}
      {typeLabel && (
        <div className="mb-2">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            {t(typeLabel)}
          </span>
        </div>
      )}

      {/* Campaign/Building link */}
      {(task.campaignName || task.buildingName) && (
        <div className="text-xs text-gray-500 mb-2 truncate">
          {task.campaignName && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {task.campaignName}
            </span>
          )}
          {task.buildingName && !task.campaignName && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {task.buildingName}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Assignees */}
        <div className="flex -space-x-2">
          {task.assigneeNames.slice(0, 3).map((name, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full bg-red-100 border-2 border-white flex items-center justify-center text-xs font-medium text-red-700"
              title={name}
            >
              {name.charAt(0).toUpperCase()}
            </div>
          ))}
          {task.assigneeNames.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
              +{task.assigneeNames.length - 3}
            </div>
          )}
          {task.assigneeNames.length === 0 && (
            <div className="text-xs text-gray-400 italic">Unassigned</div>
          )}
        </div>

        {/* Due date */}
        {task.dueDate && (
          <div className={`text-xs flex items-center gap-1 ${
            overdue ? 'text-red-600 font-medium' :
            dueSoon ? 'text-orange-600' :
            'text-gray-500'
          }`}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDueDate(task.dueDate)}
            {overdue && <span className="ml-1">({t('tasks.overdue')})</span>}
          </div>
        )}
      </div>

      {/* Touch-friendly status change button - visible on mobile, hover on desktop */}
      {onStatusChange && (
        <div className="absolute top-2 right-2">
          <button
            onClick={handleToggleMenu}
            className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600
                       opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100
                       transition-opacity min-w-[32px] min-h-[32px] flex items-center justify-center"
            title={t('tasks.changeStatus') || 'Change status'}
            aria-label={t('tasks.changeStatus') || 'Change status'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </button>

          {/* Status change menu */}
          {showStatusMenu && (
            <>
              {/* Backdrop to close menu */}
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => { e.stopPropagation(); setShowStatusMenu(false); }}
              />

              {/* Menu */}
              <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px]">
                <div className="px-2 py-1 text-xs text-gray-500 font-medium border-b border-gray-100">
                  {t('tasks.moveTo') || 'Move to'}
                </div>
                {availableStatuses.map(status => (
                  <button
                    key={status.value}
                    onClick={(e) => handleStatusChange(e, status.value)}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2
                               ${getStatusButtonColor(status.value)} transition-colors`}
                  >
                    <span className="text-base">{getStatusIcon(status.value)}</span>
                    <span>{t(status.labelKey)}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
