'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { LinkedPropertyGroup, generateBlocName, getLinkedGroups } from '@/lib/linkedPropertiesStorage'
import { getGroupEvents, BuildingEvent, formatEventDateTime } from '@/lib/eventStorage'
import { createProposal, getActiveProposals, voteOnProposal, getUserVote, VOTE_THRESHOLDS, canVoteOnGovernance, GovernanceProposal } from '@/lib/governanceStorage'
import { getCurrentProfile, isAdmin } from '@/lib/profileStorage'
import { EnhancedBuilding } from '@/lib/getBuildingsData'

interface AssociationDetailViewProps {
  group: LinkedPropertyGroup
  buildings: EnhancedBuilding[]
  onClose: () => void
  onOpenEventForm: () => void
}

export function AssociationDetailView({ group, buildings, onClose, onOpenEventForm }: AssociationDetailViewProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<'properties' | 'events' | 'governance'>('properties')
  const [showRenameForm, setShowRenameForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [showAllianceForm, setShowAllianceForm] = useState(false)

  const profile = getCurrentProfile()
  const isUserAdmin = isAdmin()
  const canVote = profile ? canVoteOnGovernance(group.id) : false

  // Get addresses for this association
  const blocBuildings = buildings.filter(b => group.apns.includes(b.apn))
  const addresses = blocBuildings.map(b => b.address)
  const blocName = group.name || generateBlocName(addresses)

  // Get events for this association
  const events = getGroupEvents(group.id)
  const upcomingEvents = events
    .filter(e => e.dateTime > Date.now() && e.status !== 'cancelled' && e.status !== 'completed')
    .sort((a, b) => a.dateTime - b.dateTime)
  const pastEvents = events
    .filter(e => e.dateTime <= Date.now() || e.status === 'completed' || e.status === 'cancelled')
    .sort((a, b) => b.dateTime - a.dateTime)
    .slice(0, 5)

  // Get governance proposals
  const proposals = getActiveProposals(group.id)

  // Get allied blocs
  const allGroups = getLinkedGroups()
  const alliedAssociations = allGroups.filter(g => group.alliances?.includes(g.id))

  // Handle rename proposal
  const handleProposeRename = () => {
    if (!profile || !newName.trim()) return

    createProposal('rename', group.id, {
      targetValue: newName.trim(),
      reason: `Rename association to "${newName.trim()}"`
    })

    setNewName('')
    setShowRenameForm(false)
  }

  // Handle alliance proposal
  const handleProposeAlliance = (targetGroupId: string) => {
    if (!profile) return

    const targetGroup = allGroups.find(g => g.id === targetGroupId)
    if (!targetGroup) return

    const targetAddresses = buildings.filter(b => targetGroup.apns.includes(b.apn)).map(b => b.address)
    const targetName = targetGroup.name || generateBlocName(targetAddresses)

    createProposal('alliance', group.id, {
      targetGroupId,
      reason: `Form alliance with ${targetName}`
    })

    setShowAllianceForm(false)
  }

  // Handle voting
  const handleVote = (proposalId: string, vote: 'up' | 'down') => {
    voteOnProposal(proposalId, vote)
  }

  // Get available blocs for alliance (not already allied, not self)
  const availableForAlliance = allGroups.filter(g =>
    g.id !== group.id &&
    !group.alliances?.includes(g.id) &&
    g.apns.length > 0
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{blocName}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {group.apns.length} {group.apns.length === 1 ? 'property' : 'properties'} &middot;{' '}
              {group.memberProfiles?.length || 0} {(group.memberProfiles?.length || 0) === 1 ? 'member' : 'members'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 md:hidden"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 bg-gray-100 rounded-lg p-1">
          {(['properties', 'events', 'governance'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'properties' && (
          <div className="space-y-3">
            {blocBuildings.length > 0 ? (
              blocBuildings.map((building) => (
                <div
                  key={building.apn}
                  className="p-3 bg-gray-50 rounded-lg"
                >
                  <p className="font-medium text-sm text-gray-900">{building.address}</p>
                  {building.propertyName && (
                    <p className="text-xs text-gray-500">{building.propertyName}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    {building.units && <span>{building.units} {t('mutualAid.units') || 'units'}</span>}
                    {building.owner && <span>{building.owner}</span>}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">{t('mutualAid.noPropertiesInBloc') || 'No properties in this association'}</p>
            )}

            {/* Alliances Section */}
            {alliedAssociations.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">{t('mutualAid.alliedAssociations') || 'Allied Blocs'}</h3>
                <div className="space-y-2">
                  {alliedAssociations.map((allied) => {
                    const alliedAddresses = buildings.filter(b => allied.apns.includes(b.apn)).map(b => b.address)
                    const alliedName = allied.name || generateBlocName(alliedAddresses)
                    return (
                      <div key={allied.id} className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="text-sm text-purple-800">{alliedName}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-4">
            {/* Plan Event Button */}
            {profile && (
              <button
                onClick={onOpenEventForm}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-rstu-red rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('mutualAid.planEvent') || 'Plan Event'}
              </button>
            )}

            {/* Upcoming Events */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">{t('mutualAid.upcomingEvents') || 'Upcoming Events'}</h3>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-2">
                  {upcomingEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                  {t('mutualAid.noUpcomingEvents') || 'No upcoming events'}
                </p>
              )}
            </div>

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">{t('mutualAid.recentEvents') || 'Recent Events'}</h3>
                <div className="space-y-2">
                  {pastEvents.map((event) => (
                    <EventCard key={event.id} event={event} isPast />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'governance' && (
          <div className="space-y-4">
            {/* Bookchin Principle Banner */}
            {isUserAdmin && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-amber-800">{t('governance.bookchinPrinciple') || 'Bookchin Principle'}</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      {t('governance.adminCannotVote') || 'As an admin, you facilitate governance but cannot vote on proposals.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            {profile && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRenameForm(true)}
                  className="flex-1 px-3 py-2 text-xs font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('governance.proposeRename') || 'Propose Rename'}
                </button>
                {availableForAlliance.length > 0 && (
                  <button
                    onClick={() => setShowAllianceForm(true)}
                    className="flex-1 px-3 py-2 text-xs font-medium border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    {t('governance.proposeAlliance') || 'Propose Alliance'}
                  </button>
                )}
              </div>
            )}

            {/* Rename Form */}
            {showRenameForm && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('governance.newBlocName') || 'New association name'}</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter new name..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setShowRenameForm(false)}
                    className="flex-1 px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {t('common.cancel') || 'Cancel'}
                  </button>
                  <button
                    onClick={handleProposeRename}
                    disabled={!newName.trim()}
                    className="flex-1 px-3 py-1.5 text-xs text-white bg-rstu-red rounded-lg hover:bg-red-700 disabled:bg-gray-300"
                  >
                    {t('governance.submitProposal') || 'Submit Proposal'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {t('governance.requiresVotes', { count: VOTE_THRESHOLDS.rename }) || `Requires +${VOTE_THRESHOLDS.rename} votes to pass`}
                </p>
              </div>
            )}

            {/* Alliance Form */}
            {showAllianceForm && (
              <div className="p-3 bg-purple-50 rounded-lg">
                <label className="block text-xs font-medium text-purple-900 mb-2">{t('governance.selectBlocToAlly') || 'Select Bloc to Ally With'}</label>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {availableForAlliance.map((g) => {
                    const gAddresses = buildings.filter(b => g.apns.includes(b.apn)).map(b => b.address)
                    const gName = g.name || generateBlocName(gAddresses)
                    return (
                      <button
                        key={g.id}
                        onClick={() => handleProposeAlliance(g.id)}
                        className="w-full text-left px-3 py-2 text-sm bg-white rounded-lg hover:bg-purple-100 transition-colors"
                      >
                        {gName}
                        <span className="text-xs text-gray-500 ml-2">({g.apns.length} {t('mutualAid.properties') || 'properties'})</span>
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setShowAllianceForm(false)}
                  className="w-full mt-2 px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
                <p className="text-xs text-purple-700 mt-2">
                  {t('governance.allianceRequiresVotes', { count: VOTE_THRESHOLDS.alliance }) || `Alliance requires +${VOTE_THRESHOLDS.alliance} votes from both blocs`}
                </p>
              </div>
            )}

            {/* Active Proposals */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">{t('governance.activeProposals') || 'Active Proposals'}</h3>
              {proposals.length > 0 ? (
                <div className="space-y-2">
                  {proposals.map((proposal) => (
                    <ProposalCard
                      key={proposal.id}
                      proposal={proposal}
                      canVote={canVote && !isUserAdmin}
                      onVote={handleVote}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                  {t('governance.noActiveProposals') || 'No active proposals'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Event Card Component
function EventCard({ event, isPast }: { event: BuildingEvent; isPast?: boolean }) {
  return (
    <div className={`p-3 rounded-lg border ${isPast ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'}`}>
      <div className="flex items-start justify-between">
        <div>
          <h4 className={`font-medium text-sm ${isPast ? 'text-gray-700' : 'text-blue-900'}`}>
            {event.title}
          </h4>
          <p className={`text-xs mt-0.5 ${isPast ? 'text-gray-500' : 'text-blue-700'}`}>
            {formatEventDateTime(event.dateTime)}
          </p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          event.status === 'confirmed' ? 'bg-green-100 text-green-700' :
          event.status === 'proposed' ? 'bg-yellow-100 text-yellow-700' :
          event.status === 'cancelled' ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {event.status}
        </span>
      </div>
      {event.location && (
        <p className={`text-xs mt-1 ${isPast ? 'text-gray-400' : 'text-blue-600'}`}>
          {event.location.isVirtual ? 'Virtual' : event.location.name}
        </p>
      )}
    </div>
  )
}

// Proposal Card Component
function ProposalCard({
  proposal,
  canVote,
  onVote
}: {
  proposal: GovernanceProposal
  canVote: boolean
  onVote: (id: string, vote: 'up' | 'down') => void
}) {
  const userVote = getUserVote(proposal.id)
  const netVotes = proposal.upvotes.length - proposal.downvotes.length
  const threshold = VOTE_THRESHOLDS[proposal.type]

  const getProposalLabel = () => {
    switch (proposal.type) {
      case 'rename': return `Rename to "${proposal.targetValue}"`
      case 'alliance': return 'Form Alliance'
      case 'merge': return 'Merge Blocs'
      default: return proposal.type
    }
  }

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full capitalize">
            {proposal.type}
          </span>
          <p className="font-medium text-sm text-gray-900 mt-1">{getProposalLabel()}</p>
          <p className="text-xs text-gray-500 mt-0.5">by {proposal.proposedByName}</p>
        </div>
      </div>

      {proposal.reason && (
        <p className="text-xs text-gray-600 mt-2 italic">{proposal.reason}</p>
      )}

      {/* Vote Progress */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span className={netVotes >= threshold ? 'text-green-600 font-medium' : ''}>
            {netVotes}/{threshold} votes
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${netVotes >= threshold ? 'bg-green-500' : 'bg-rstu-red'}`}
            style={{ width: `${Math.min(100, Math.max(0, (netVotes / threshold) * 100))}%` }}
          />
        </div>
      </div>

      {/* Vote Buttons */}
      {canVote && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onVote(proposal.id, 'up')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${
              userVote === 'up'
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-green-50'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            Support ({proposal.upvotes.length})
          </button>
          <button
            onClick={() => onVote(proposal.id, 'down')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${
              userVote === 'down'
                ? 'bg-red-100 text-red-700 border border-red-300'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-red-50'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Oppose ({proposal.downvotes.length})
          </button>
        </div>
      )}
    </div>
  )
}
