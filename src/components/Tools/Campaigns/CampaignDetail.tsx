'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Campaign, CampaignStage, CampaignOutcome } from '@/lib/campaignStorage'
import { Task, getTasksByCampaign, deleteTask } from '@/lib/taskStorage'
import { TaskCard } from '@/components/Tasks/TaskCard'
import { TaskDetail } from '@/components/Tasks/TaskDetail'
import { TaskForm } from '@/components/Tasks/TaskForm'
import {
  updateCampaign,
  deleteCampaign,
  addCampaignDemand,
  updateCampaignDemand,
  removeCampaignDemand,
  addCampaignNote,
  removeCampaignNote,
  getStageLabel,
  getStageColor,
  getOutcomeLabel,
  getOutcomeColor,
  getCampaignProgress,
  getDaysInCampaign,
  formatCampaignDate,
  CAMPAIGN_STAGES,
  CAMPAIGN_OUTCOMES,
} from '@/lib/campaignStorage'
import { getCurrentProfile } from '@/lib/profileStorage'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'

interface CampaignDetailProps {
  campaign: Campaign
  buildings: EnhancedBuilding[]
  onUpdate: () => void
  onDelete: () => void
  onSelectBuilding: (chatSlug: string) => void
}

export function CampaignDetail({
  campaign,
  buildings,
  onUpdate,
  onDelete,
  onSelectBuilding,
}: CampaignDetailProps) {
  const [showAddDemand, setShowAddDemand] = useState(false)
  const [newDemandText, setNewDemandText] = useState('')
  const [showAddNote, setShowAddNote] = useState(false)
  const [newNoteText, setNewNoteText] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingNextAction, setEditingNextAction] = useState(false)
  const [nextActionText, setNextActionText] = useState(campaign.nextAction || '')
  const [nextActionDate, setNextActionDate] = useState(campaign.nextActionDate || '')

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showTaskForm, setShowTaskForm] = useState(false)

  const profile = getCurrentProfile()

  // Load tasks linked to this campaign
  const loadTasks = useCallback(() => {
    setTasks(getTasksByCampaign(campaign.id))
  }, [campaign.id])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])
  const progress = getCampaignProgress(campaign.stage)
  const daysActive = getDaysInCampaign(campaign)

  const handleStageChange = (newStage: CampaignStage) => {
    updateCampaign(campaign.id, { stage: newStage })
    onUpdate()
  }

  const handleOutcomeChange = (newOutcome: CampaignOutcome) => {
    updateCampaign(campaign.id, { outcome: newOutcome })
    onUpdate()
  }

  const handleAddDemand = () => {
    if (!newDemandText.trim()) return
    addCampaignDemand(campaign.id, newDemandText.trim())
    setNewDemandText('')
    setShowAddDemand(false)
    onUpdate()
  }

  const handleAddNote = () => {
    if (!newNoteText.trim() || !profile) return
    addCampaignNote(campaign.id, profile.nickname, newNoteText.trim())
    setNewNoteText('')
    setShowAddNote(false)
    onUpdate()
  }

  const handleSaveNextAction = () => {
    updateCampaign(campaign.id, {
      nextAction: nextActionText.trim() || undefined,
      nextActionDate: nextActionDate || undefined,
    })
    setEditingNextAction(false)
    onUpdate()
  }

  const handleDelete = () => {
    deleteCampaign(campaign.id)
    onDelete()
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStageColor(campaign.stage)}`}>
                {getStageLabel(campaign.stage)}
              </span>
              {campaign.stage === 'resolved' && (
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getOutcomeColor(campaign.outcome)}`}>
                  {getOutcomeLabel(campaign.outcome)}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-gray-900">{campaign.name}</h2>
            <p className="text-sm text-gray-500">{campaign.landlordName}</p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-gray-400 hover:text-red-600"
            title="Delete campaign"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        {campaign.stage !== 'resolved' && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-rstu-red rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Quick stats */}
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          <span>Started {formatCampaignDate(campaign.startDate)}</span>
          <span>{daysActive} days</span>
          <span>{campaign.demands.length} demands</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Stage Selector */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Stage</h3>
          <div className="flex flex-wrap gap-2">
            {CAMPAIGN_STAGES.map((stage) => (
              <button
                key={stage.key}
                onClick={() => handleStageChange(stage.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  campaign.stage === stage.key
                    ? getStageColor(stage.key)
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={stage.description}
              >
                {stage.label}
              </button>
            ))}
          </div>
        </div>

        {/* Outcome Selector (for resolved) */}
        {campaign.stage === 'resolved' && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Outcome</h3>
            <div className="flex flex-wrap gap-2">
              {CAMPAIGN_OUTCOMES.map((outcome) => (
                <button
                  key={outcome.key}
                  onClick={() => handleOutcomeChange(outcome.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    campaign.outcome === outcome.key
                      ? getOutcomeColor(outcome.key)
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {outcome.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Buildings */}
        {campaign.buildingChatSlugs.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Buildings</h3>
            <div className="space-y-1">
              {campaign.buildingChatSlugs.map((slug) => (
                <button
                  key={slug}
                  onClick={() => onSelectBuilding(slug)}
                  className="w-full text-left px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                >
                  <span className="truncate">{slug.replace('rstu-', '').replace(/-/g, ' ')}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Next Action */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Next Action</h3>
            {!editingNextAction && (
              <button
                onClick={() => setEditingNextAction(true)}
                className="text-xs text-rstu-red hover:underline"
              >
                Edit
              </button>
            )}
          </div>
          {editingNextAction ? (
            <div className="space-y-2">
              <input
                type="text"
                value={nextActionText}
                onChange={(e) => setNextActionText(e.target.value)}
                placeholder="What's the next step?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  value={nextActionDate}
                  onChange={(e) => setNextActionDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <button
                  onClick={handleSaveNextAction}
                  className="px-4 py-2 bg-rstu-red text-white rounded-md text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingNextAction(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : campaign.nextAction ? (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
              <p className="text-sm text-orange-800 font-medium">{campaign.nextAction}</p>
              {campaign.nextActionDate && (
                <p className="text-xs text-orange-600 mt-1">
                  Due: {formatCampaignDate(campaign.nextActionDate)}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No next action set</p>
          )}
        </div>

        {/* Demands */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">
              Demands ({campaign.demands.length})
            </h3>
            <button
              onClick={() => setShowAddDemand(true)}
              className="text-xs text-rstu-red hover:underline"
            >
              + Add
            </button>
          </div>
          {showAddDemand && (
            <div className="mb-3 space-y-2">
              <textarea
                value={newDemandText}
                onChange={(e) => setNewDemandText(e.target.value)}
                placeholder="Enter demand..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddDemand}
                  className="px-4 py-2 bg-rstu-red text-white rounded-md text-sm"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddDemand(false)
                    setNewDemandText('')
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {campaign.demands.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No demands added yet</p>
          ) : (
            <div className="space-y-2">
              {campaign.demands.map((demand) => (
                <div
                  key={demand.id}
                  className="p-3 bg-gray-50 rounded-md flex items-start justify-between gap-2"
                >
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{demand.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <select
                        value={demand.status}
                        onChange={(e) => {
                          updateCampaignDemand(campaign.id, demand.id, {
                            status: e.target.value as typeof demand.status,
                          })
                          onUpdate()
                        }}
                        className="text-xs border border-gray-300 rounded px-2 py-0.5"
                      >
                        <option value="proposed">Proposed</option>
                        <option value="approved">Approved</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                        <option value="compromised">Compromised</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      removeCampaignDemand(campaign.id, demand.id)
                      onUpdate()
                    }}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">
              Notes ({campaign.notes.length})
            </h3>
            <button
              onClick={() => setShowAddNote(true)}
              className="text-xs text-rstu-red hover:underline"
            >
              + Add
            </button>
          </div>
          {showAddNote && (
            <div className="mb-3 space-y-2">
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-rstu-red text-white rounded-md text-sm"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddNote(false)
                    setNewNoteText('')
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {campaign.notes.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No notes yet</p>
          ) : (
            <div className="space-y-2">
              {campaign.notes.map((note) => (
                <div key={note.id} className="p-3 bg-gray-50 rounded-md">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <span className="font-medium">{note.author}</span>
                        <span>{formatCampaignDate(note.date)}</span>
                      </div>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.text}</p>
                    </div>
                    <button
                      onClick={() => {
                        removeCampaignNote(campaign.id, note.id)
                        onUpdate()
                      }}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">
              Tasks ({tasks.length})
            </h3>
            <button
              onClick={() => setShowTaskForm(true)}
              className="text-xs text-rstu-red hover:underline"
            >
              + Add
            </button>
          </div>
          {tasks.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No tasks linked to this campaign</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => setSelectedTask(task)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Campaign"
        message={`Delete "${campaign.name}"? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => {
            setSelectedTask(null)
            loadTasks()
          }}
          onUpdate={loadTasks}
        />
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          campaignId={campaign.id}
          onClose={() => setShowTaskForm(false)}
          onSave={loadTasks}
        />
      )}
    </div>
  )
}
