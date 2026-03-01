'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { getLinkedGroups, deleteLinkedGroup, updateLinkedGroup, type LinkedPropertyGroup } from '@/lib/storage/linkedPropertiesStorage'
import type { EnhancedBuilding } from '@/lib/data/getBuildingsData'

interface LinkedPropertiesListProps {
  buildings: EnhancedBuilding[]
  onSelectBuilding?: (building: EnhancedBuilding) => void
}

export function LinkedPropertiesList({ buildings, onSelectBuilding }: LinkedPropertiesListProps) {
  const { t } = useLanguage()
  const [groups, setGroups] = useState<LinkedPropertyGroup[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    setGroups(getLinkedGroups())
  }, [])

  const handleDelete = (id: string) => {
    if (confirm(t('tools.deleteGroupMsg') || 'Delete this linked group?')) {
      deleteLinkedGroup(id)
      setGroups(getLinkedGroups())
    }
  }

  const handleEdit = (group: LinkedPropertyGroup) => {
    setEditingId(group.id)
    setEditName(group.name)
  }

  const handleSave = (id: string) => {
    if (editName.trim()) {
      updateLinkedGroup(id, { name: editName.trim() })
      setGroups(getLinkedGroups())
    }
    setEditingId(null)
    setEditName('')
  }

  const getBuildingForApn = (apn: string) => buildings.find(b => b.apn === apn)

  if (groups.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <p className="text-sm">{t('tools.noLinkedGroups') || 'No linked property groups yet.'}</p>
        <p className="text-xs mt-1 text-gray-400">
          {t('tools.linkHelp') || 'Ctrl+click properties on the map or list, then press L to link them.'}
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {groups.map(group => (
        <div key={group.id} className="p-4">
          <div className="flex items-start justify-between gap-2">
            {editingId === group.id ? (
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-rstu-red"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSave(group.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                />
                <button
                  onClick={() => handleSave(group.id)}
                  className="px-2 py-1 text-xs bg-rstu-red text-white rounded hover:bg-red-700"
                >
                  {t('common.save') || 'Save'}
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-gray-900 flex items-center gap-1">
                    <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    {group.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {group.apns.length} {t('tools.propertiesLinked') || 'properties linked'}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(group)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title={t('tools.rename') || 'Rename'}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(group.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title={t('common.delete') || 'Delete'}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* List linked properties */}
          <ul className="mt-2 space-y-1">
            {group.apns.map(apn => {
              const building = getBuildingForApn(apn)
              if (!building) return null
              return (
                <li key={apn}>
                  <button
                    onClick={() => onSelectBuilding?.(building)}
                    className="w-full text-left px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 rounded flex justify-between items-center"
                  >
                    <span className="truncate">{building.address.split(',')[0]}</span>
                    <span className="text-gray-400 ml-2">{building.units} units</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
