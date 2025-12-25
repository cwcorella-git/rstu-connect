'use client'

import { useState, useEffect } from 'react'
import {
  getOrCreateDMThread,
  createGroupThread,
  type DirectMessageThread,
} from '@/lib/directMessageStorage'
import { getCurrentProfile, getProfile, type UserProfile } from '@/lib/profileStorage'
import { getLinkedGroups, type LinkedPropertyGroup } from '@/lib/linkedPropertiesStorage'

interface NewMessageModalProps {
  onClose: () => void
  onThreadCreated: (thread: DirectMessageThread) => void
}

interface ContactOption {
  id: string
  name: string
  role: string
  source: string
}

export function NewMessageModal({ onClose, onThreadCreated }: NewMessageModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [contacts, setContacts] = useState<ContactOption[]>([])
  const [selectedContacts, setSelectedContacts] = useState<ContactOption[]>([])
  const [isGroup, setIsGroup] = useState(false)
  const [groupName, setGroupName] = useState('')

  const profile = getCurrentProfile()

  // Load contacts from blocs and building connections
  useEffect(() => {
    if (!profile) return

    const allContacts: ContactOption[] = []
    const seenIds = new Set<string>()

    // Get members from blocs
    const groups = getLinkedGroups()
    groups.forEach(group => {
      if (group.memberProfiles) {
        group.memberProfiles.forEach(memberId => {
          if (memberId !== profile.id && !seenIds.has(memberId)) {
            seenIds.add(memberId)
            // Try to get profile info
            const memberProfile = getProfile(memberId)
            if (memberProfile) {
              allContacts.push({
                id: memberId,
                name: memberProfile.nickname,
                role: memberProfile.role,
                source: group.name || 'Bloc member',
              })
            }
          }
        })
      }
    })

    // Sort by name
    allContacts.sort((a, b) => a.name.localeCompare(b.name))
    setContacts(allContacts)
  }, [profile])

  const filteredContacts = searchQuery
    ? contacts.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.source.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : contacts

  const handleSelectContact = (contact: ContactOption) => {
    if (selectedContacts.find(c => c.id === contact.id)) {
      setSelectedContacts(prev => prev.filter(c => c.id !== contact.id))
    } else {
      setSelectedContacts(prev => [...prev, contact])
    }
  }

  const handleStartConversation = () => {
    if (!profile || selectedContacts.length === 0) return

    let thread: DirectMessageThread | null = null

    if (selectedContacts.length === 1 && !isGroup) {
      // 1:1 DM
      thread = getOrCreateDMThread(
        selectedContacts[0].id,
        selectedContacts[0].name
      )
    } else {
      // Group chat
      thread = createGroupThread(
        selectedContacts.map(c => c.id),
        selectedContacts.map(c => c.name),
        groupName || undefined
      )
    }

    if (thread) {
      onThreadCreated(thread)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700'
      case 'organizer': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="font-semibold text-gray-900">New Message</h3>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Selected Contacts */}
          {selectedContacts.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-500">
                  To: ({selectedContacts.length})
                </p>
                {selectedContacts.length > 1 && (
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={isGroup}
                      onChange={(e) => setIsGroup(e.target.checked)}
                      className="h-3 w-3 text-rstu-red border-gray-300 rounded"
                    />
                    <span className="text-gray-600">Create group</span>
                  </label>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedContacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => handleSelectContact(contact)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-rstu-red text-white rounded-full hover:bg-red-700"
                  >
                    {contact.name}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ))}
              </div>

              {/* Group Name */}
              {isGroup && selectedContacts.length > 1 && (
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Group name (optional)"
                  className="w-full mt-2 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                />
              )}
            </div>
          )}

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rstu-red focus:border-transparent"
            />
          </div>

          {/* Contact List */}
          {filteredContacts.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm text-gray-500">
                {contacts.length === 0
                  ? 'No contacts found. Join a bloc to connect with other members.'
                  : 'No matching contacts found.'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredContacts.map(contact => {
                const isSelected = selectedContacts.some(c => c.id === contact.id)
                return (
                  <button
                    key={contact.id}
                    onClick={() => handleSelectContact(contact)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition text-left ${
                      isSelected ? 'bg-red-50 border border-red-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {contact.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{contact.source}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(contact.role)}`}>
                      {contact.role}
                    </span>
                    {isSelected && (
                      <svg className="w-5 h-5 text-rstu-red" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleStartConversation}
            disabled={selectedContacts.length === 0}
            className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition ${
              selectedContacts.length > 0
                ? 'bg-rstu-red text-white hover:bg-red-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {selectedContacts.length === 0
              ? 'Select a contact'
              : selectedContacts.length === 1
              ? 'Start Conversation'
              : `Start ${isGroup ? 'Group' : 'Conversation'}`}
          </button>
        </div>
      </div>
    </div>
  )
}
