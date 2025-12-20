'use client'

import { useState, useEffect } from 'react';
import type { EnhancedBuilding } from '@/lib/getBuildingsData';
import { deleteLinkedGroup, updateLinkedGroup, type LinkedPropertyGroup } from '@/lib/linkedPropertiesStorage';
import { canAccessTools } from '@/lib/profileStorage';

interface LinkedGroupCardProps {
  group: LinkedPropertyGroup;
  buildings: EnhancedBuilding[];
  isSelected: boolean;
  isFavorite?: boolean;
  onClick: () => void;
  onUnlink?: () => void;
}

export function LinkedGroupCard({
  group,
  buildings,
  isSelected,
  isFavorite = false,
  onClick,
  onUnlink,
}: LinkedGroupCardProps) {
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);

  useEffect(() => {
    setIsOrganizer(canAccessTools());
  }, []);

  // Calculate units - sum for different buildings, max for same building (avoid double counting)
  const totalUnits = group.isSameBuilding
    ? Math.max(...buildings.map(b => b.units || 0))
    : buildings.reduce((sum, b) => sum + (b.units || 0), 0);
  const propertyCount = buildings.length;

  // Get first property's short address for display
  const primaryAddress = buildings[0]?.address.split(',')[0] || 'Unknown';

  const handleUnlink = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteLinkedGroup(group.id);
    onUnlink?.();
  };

  const handleEditStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditName(group.name);
  };

  const handleEditSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editName.trim()) {
      updateLinkedGroup(group.id, { name: editName.trim() });
    }
    setIsEditing(false);
  };

  const handleEditCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditName(group.name);
  };

  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full p-4 text-left transition-colors relative ${
          isSelected
            ? 'bg-red-50 border-l-4 border-rstu-red'
            : group.isSameBuilding
              ? 'border-l-4 border-blue-400 hover:bg-blue-50'
              : 'border-l-4 border-orange-400 hover:bg-orange-50'
        }`}
      >
        {/* Favorite star (if any property in group is favorited) */}
        {isFavorite && (
          <span className="absolute top-2 right-2 text-yellow-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </span>
        )}

        {/* Header with chain icon and name */}
        <div className="flex items-center gap-2">
          {/* Chain link icon */}
          <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>

          {/* Group name - editable for organizers */}
          {isEditing ? (
            <div className="flex-1 flex gap-2" onClick={e => e.stopPropagation()}>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="flex-1 px-2 py-0.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-rstu-red"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') handleEditSave(e as unknown as React.MouseEvent);
                  if (e.key === 'Escape') handleEditCancel(e as unknown as React.MouseEvent);
                }}
              />
              <button
                onClick={handleEditSave}
                className="px-2 py-0.5 text-xs bg-rstu-red text-white rounded hover:bg-red-700"
              >
                Save
              </button>
            </div>
          ) : (
            <span className="font-medium text-gray-900 text-sm truncate" title={group.name}>
              {group.name}
            </span>
          )}

          {/* Property count badge */}
          <span className={`ml-auto flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${
            group.isSameBuilding
              ? 'bg-blue-100 text-blue-700'
              : 'bg-orange-100 text-orange-700'
          }`}>
            {group.isSameBuilding ? `${propertyCount} merged` : `${propertyCount} linked`}
          </span>
        </div>

        {/* Stats row */}
        <div className="text-xs text-gray-500 mt-1.5 flex items-center gap-3">
          <span>{totalUnits} total units</span>
          <span className="text-gray-300">|</span>
          <span className="truncate">{primaryAddress}</span>
        </div>

        {/* Organizer actions */}
        {isOrganizer && !isEditing && (
          <div className="flex gap-2 mt-2 flex-wrap">
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateLinkedGroup(group.id, { isSameBuilding: !group.isSameBuilding });
                onUnlink?.(); // Trigger refresh
              }}
              className={`text-xs flex items-center gap-1 ${
                group.isSameBuilding
                  ? 'text-blue-500 hover:text-blue-700'
                  : 'text-gray-400 hover:text-blue-600'
              }`}
              title={group.isSameBuilding ? 'Currently merged (same building)' : 'Currently linked (different buildings)'}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              {group.isSameBuilding ? 'Merged' : 'Merge'}
            </button>
            <button
              onClick={handleEditStart}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Rename
            </button>
            <button
              onClick={handleUnlink}
              className="text-xs text-gray-400 hover:text-red-600 flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Unlink
            </button>
          </div>
        )}
      </button>
    </li>
  );
}
