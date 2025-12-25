'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  TaskPriority,
  TaskType,
  createTask,
  TASK_PRIORITIES,
  TASK_TYPES,
} from '@/lib/taskStorage'
import { getCurrentProfile } from '@/lib/profileStorage'
import { getAllCampaigns, Campaign } from '@/lib/campaignStorage'

interface TaskFormProps {
  campaignId?: string
  buildingId?: string
  buildingName?: string
  onClose: () => void
  onSave: () => void
}

export function TaskForm({ campaignId, buildingId, buildingName, onClose, onSave }: TaskFormProps) {
  const { t } = useLanguage()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [type, setType] = useState<TaskType>('other')
  const [dueDate, setDueDate] = useState('')
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaignId || '')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  const profile = getCurrentProfile()

  useEffect(() => {
    setCampaigns(getAllCampaigns())
  }, [])

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !profile) return

    createTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      type,
      campaignId: selectedCampaignId || undefined,
      campaignName: selectedCampaign?.name,
      buildingId: buildingId,
      buildingName: buildingName,
      dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
      createdBy: profile.id,
      createdByName: profile.nickname,
    })

    onSave()
    onClose()
  }

  if (!profile) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-sm">
          <p className="text-gray-600">{t('tasks.loginRequired')}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 rounded-md"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{t('tasks.newTask')}</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('tasks.title')} *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('tasks.titlePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rstu-red/50"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('tasks.description')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('tasks.descriptionPlaceholder')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rstu-red/50"
            />
          </div>

          {/* Type and Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('tasks.type')}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rstu-red/50"
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
                {t('tasks.priority')}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rstu-red/50"
              >
                {TASK_PRIORITIES.map(p => (
                  <option key={p.value} value={p.value}>
                    {t(p.labelKey)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('tasks.dueDate')}
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rstu-red/50"
            />
          </div>

          {/* Campaign Link */}
          {!campaignId && campaigns.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('tasks.linkToCampaign')}
              </label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rstu-red/50"
              >
                <option value="">{t('tasks.noCampaign')}</option>
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Pre-linked context */}
          {(campaignId || buildingId) && (
            <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-600">
              {campaignId && selectedCampaign && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>{t('tasks.linkedToCampaign')}: {selectedCampaign.name}</span>
                </div>
              )}
              {buildingId && buildingName && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>{t('tasks.linkedToBuilding')}: {buildingName}</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 bg-rstu-red text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {t('tasks.createTask')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
