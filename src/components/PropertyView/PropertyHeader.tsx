'use client'

import { useState } from 'react';
import { EnhancedBuilding } from '@/lib/data/getBuildingsData';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOrganizingProgress, type RegisteredMember } from '@/hooks/useOrganizingProgress';
import { UserGroupIcon } from '@heroicons/react/24/outline';

interface PropertyHeaderProps {
  building: EnhancedBuilding;
  chatSlug: string;
  showBackButton?: boolean;
  onBack?: () => void;
  onInfoClick?: () => void;
}

export function PropertyHeader({ building, chatSlug, showBackButton, onBack, onInfoClick }: PropertyHeaderProps) {
  const { t } = useLanguage();
  const [showOrganizingDetails, setShowOrganizingDetails] = useState(false);
  const { progress, isLoading } = useOrganizingProgress(chatSlug, building.units);

  // Title is property name if available, otherwise address
  const title = building.propertyName || building.address;
  // Subtitle is address if we have a name, otherwise just unit count
  const hasName = !!building.propertyName;

  // Organizing progress helpers
  const hasProgress = progress && (progress.registeredMembers.length > 0 || progress.hasCanvassData);
  const getStatusColor = () => {
    if (!progress) return 'bg-gray-300';
    switch (progress.status) {
      case 'active': return 'bg-green-500';
      case 'emerging': return 'bg-yellow-500';
      case 'starting': return 'bg-blue-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <>
      <div className="px-3 py-2 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <button
              onClick={onBack}
              className="p-1.5 -ml-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label={t('property.backToList')}
            >
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          {/* Property info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900 truncate">
              {title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="truncate">
                {hasName && <>{building.address} &bull; </>}
                {building.units?.toLocaleString()} {building.units !== 1 ? t('buildings.units') : t('buildings.unit')}
              </span>

              {/* Organizing Progress - inline compact display */}
              {!isLoading && hasProgress && progress && (
                <button
                  onClick={() => setShowOrganizingDetails(true)}
                  className="flex items-center gap-1.5 hover:bg-gray-100 rounded px-1 -mx-1 transition-colors"
                >
                  <span className="text-gray-400">&bull;</span>
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                    <div
                      className={`h-full rounded-full ${getStatusColor()}`}
                      style={{ width: `${Math.min(progress.progressPercent, 100)}%` }}
                    />
                  </div>
                  <span className="text-gray-600 font-medium">
                    {progress.contacted}/{progress.totalUnits || '?'}
                  </span>
                  {progress.activeMembers > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium text-[10px]">
                      {progress.activeMembers} Active
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
          {/* Info icon button */}
          <button
            onClick={onInfoClick}
            className="p-1.5 -mr-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            aria-label={t('property.viewDetails')}
          >
            <svg
              className="w-4 h-4 text-gray-400 hover:text-rstu-red transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Organizing Details Modal */}
      {showOrganizingDetails && progress && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowOrganizingDetails(false)}
          />
          <div className="fixed inset-x-4 top-1/4 z-50 max-w-md mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                {t('organizing.progress') || 'Organizing Progress'}
              </h3>
              <button
                onClick={() => setShowOrganizingDetails(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>
                    {progress.contacted}/{progress.totalUnits || '?'} {t('organizing.unitsReached') || 'units reached'}
                  </span>
                  <span className="font-medium">{progress.progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getStatusColor()}`}
                    style={{ width: `${progress.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-2">
                {progress.activeMembers > 0 && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {progress.activeMembers} {t('organizing.activeMembers') || 'Active'}
                  </span>
                )}
                {progress.interested > 0 && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {progress.interested} {t('organizing.interested') || 'Interested'}
                  </span>
                )}
                {progress.followUp > 0 && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {progress.followUp} {t('organizing.followUp') || 'Follow-up'}
                  </span>
                )}
              </div>

              {/* Members */}
              {progress.registeredMembers.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                    {t('organizing.membersWithAccounts') || 'Members'} ({progress.registeredMembers.length})
                  </h4>
                  <div className="space-y-2">
                    {progress.registeredMembers.map((member: RegisteredMember) => (
                      <div key={member.id} className="flex items-center gap-2 text-sm">
                        <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700">
                          {member.nickname.charAt(0).toUpperCase()}
                        </span>
                        <span className="font-medium text-gray-900">{member.nickname}</span>
                        {member.unitNumber && (
                          <span className="text-gray-500">#{member.unitNumber}</span>
                        )}
                        {member.role !== 'tenant' && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            member.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {member.role}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
