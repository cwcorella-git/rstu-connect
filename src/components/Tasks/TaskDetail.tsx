'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskType,
  updateTask,
  deleteTask,
  assignTask,
  unassignTask,
  TASK_STATUSES,
  TASK_PRIORITIES,
  TASK_TYPES,
  formatDueDate,
  isOverdue,
  isDueSoon,
} from '@/lib/storage/taskStorage'
import { getCurrentProfile, getStoredProfiles } from '@/lib/storage/profileStorage'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

interface TaskDetailProps {
  task: Task
  onClose: () => void
  onUpdate: () => void
}

export function TaskDetail({ task, onClose, onUpdate }: TaskDetailProps) {
  const { t } = useLanguage()
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)

  // Edit state
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [status, setStatus] = useState<TaskStatus>(task.status)
  const [priority, setPriority] = useState<TaskPriority>(task.priority)
  const [type, setType] = useState<TaskType>(task.type)
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  )

  const profile = getCurrentProfile()
  const profiles = getStoredProfiles()
  const overdue = isOverdue(task)
  const dueSoon = isDueSoon(task)

  const handleSave = () => {
    updateTask(task.id, {
      title,
      description,
      status,
      priority,
      type,
      dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
    })
    setIsEditing(false)
    onUpdate()
  }

  const handleDelete = () => {
    deleteTask(task.id)
    onClose()
  }

  const handleAssign = (profileId: string, profileName: string) => {
    assignTask(task.id, profileId, profileName)
    onUpdate()
  }

  const handleUnassign = (profileId: string) => {
    unassignTask(task.id, profileId)
    onUpdate()
  }

  const handleSelfAssign = () => {
    if (profile && !task.assigneeIds.includes(profile.id)) {
      assignTask(task.id, profile.id, profile.nickname)
      onUpdate()
    }
  }

  const handleSelfUnassign = () => {
    if (profile && task.assigneeIds.includes(profile.id)) {
      unassignTask(task.id, profile.id)
      onUpdate()
    }
  }

  const typeLabel = TASK_TYPES.find(tt => tt.value === task.type)?.labelKey

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? t('tasks.editTask') : t('tasks.taskDetails')}
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {isEditing ? (
              <>
                {/* Edit Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('tasks.title')}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('tasks.description')}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('tasks.status')}
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as TaskStatus)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {TASK_STATUSES.map(s => (
                        <option key={s.value} value={s.value}>
                          {t(s.labelKey)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('tasks.priority')}
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TaskPriority)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {TASK_PRIORITIES.map(p => (
                        <option key={p.value} value={p.value}>
                          {t(p.labelKey)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('tasks.type')}
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as TaskType)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {TASK_TYPES.map(tt => (
                        <option key={tt.value} value={tt.value}>
                          {t(tt.labelKey)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('tasks.dueDate')}
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* View Mode */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{task.title}</h3>
                  {task.description && (
                    <p className="mt-2 text-gray-600 whitespace-pre-wrap">{task.description}</p>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    TASK_PRIORITIES.find(p => p.value === task.priority)?.color
                  }`}>
                    {t(`tasks.${task.priority}`)}
                  </span>
                  {typeLabel && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      {t(typeLabel)}
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    task.status === 'done' ? 'bg-green-100 text-green-700' :
                    task.status === 'blocked' ? 'bg-red-100 text-red-700' :
                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {t(`tasks.${task.status === 'in_progress' ? 'inProgress' : task.status}`)}
                  </span>
                </div>

                {/* Due Date */}
                {task.dueDate && (
                  <div className={`flex items-center gap-2 text-sm ${
                    overdue ? 'text-red-600' : dueSoon ? 'text-orange-600' : 'text-gray-500'
                  }`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDueDate(task.dueDate)}</span>
                    {overdue && <span className="font-medium">({t('tasks.overdue')})</span>}
                  </div>
                )}

                {/* Campaign/Building */}
                {(task.campaignName || task.buildingName) && (
                  <div className="text-sm text-gray-500">
                    {task.campaignName && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {task.campaignName}
                      </div>
                    )}
                    {task.buildingName && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {task.buildingName}
                      </div>
                    )}
                  </div>
                )}

                {/* Document Links */}
                {task.documentLinks && task.documentLinks.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('tasks.attachedDocuments')}
                    </label>
                    <div className="space-y-2">
                      {task.documentLinks.map((doc, i) => (
                        <a
                          key={i}
                          href={`#reading/${doc.category}/${doc.slug}`}
                          onClick={(e) => {
                            e.preventDefault()
                            // Navigate to reading tab with this document
                            window.location.hash = `reading/${doc.category}/${doc.slug}`
                            onClose()
                          }}
                          className="flex items-center gap-2 p-2 bg-blue-50 hover:bg-blue-100 rounded-md text-sm text-blue-700 transition-colors"
                        >
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="font-medium">{doc.title}</span>
                          <svg className="w-3 h-3 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assignees */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t('tasks.assignees')}
                    </label>
                    <button
                      onClick={() => setShowAssignModal(true)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {t('tasks.manage')}
                    </button>
                  </div>
                  {task.assigneeNames.length === 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 italic">{t('tasks.unassigned')}</span>
                      {profile && (
                        <button
                          onClick={handleSelfAssign}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {t('tasks.assignSelf')}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {task.assigneeNames.map((name, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm"
                        >
                          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-xs font-medium text-red-700">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <span>{name}</span>
                          {profile && task.assigneeIds[i] === profile.id && (
                            <button
                              onClick={handleSelfUnassign}
                              className="ml-1 text-gray-400 hover:text-gray-600"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="text-xs text-gray-400 pt-2 border-t">
                  <div>{t('tasks.createdBy')}: {task.createdByName}</div>
                  <div>{t('tasks.createdAt')}: {new Date(task.createdAt).toLocaleString()}</div>
                  {task.completedAt && (
                    <div>{t('tasks.completedAt')}: {new Date(task.completedAt).toLocaleString()}</div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t bg-gray-50">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!title.trim()}
                  className="px-4 py-2 bg-rstu-red text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {t('common.save')}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 text-red-600 hover:text-red-800"
                >
                  {t('common.delete')}
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-rstu-red text-white rounded-md hover:bg-red-700"
                >
                  {t('common.edit')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title={t('tasks.deleteTask')}
        message={t('tasks.confirmDelete')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-900">{t('tasks.assignTask')}</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 max-h-60 overflow-y-auto">
              {profiles.map(p => {
                const isAssigned = task.assigneeIds.includes(p.id)
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-sm font-medium text-red-700">
                        {p.nickname.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm">{p.nickname}</span>
                    </div>
                    <button
                      onClick={() => isAssigned ? handleUnassign(p.id) : handleAssign(p.id, p.nickname)}
                      className={`px-3 py-1 text-xs rounded-md ${
                        isAssigned
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {isAssigned ? t('tasks.unassign') : t('tasks.assign')}
                    </button>
                  </div>
                )
              })}
              {profiles.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  {t('tasks.noProfiles')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
