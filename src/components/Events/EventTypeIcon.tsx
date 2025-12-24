'use client'

import { type EventType } from '@/lib/eventStorage'
import {
  CalendarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  MegaphoneIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  TagIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline'

interface EventTypeIconProps {
  type: EventType
  className?: string
}

const iconMap: Record<EventType, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  custom: PencilSquareIcon,
  meeting: CalendarIcon,
  committee: UserGroupIcon,
  workshop: AcademicCapIcon,
  action: MegaphoneIcon,
  intake: ClipboardDocumentListIcon,
  social: SparklesIcon,
  other: TagIcon,
}

export function EventTypeIcon({ type, className = 'w-5 h-5' }: EventTypeIconProps) {
  const Icon = iconMap[type] || TagIcon
  return <Icon className={className} />
}

// Color classes for each event type
export function getEventTypeColor(type: EventType): string {
  const colors: Record<EventType, string> = {
    custom: 'text-gray-600',
    meeting: 'text-blue-600',
    committee: 'text-purple-600',
    workshop: 'text-amber-600',
    action: 'text-red-600',
    intake: 'text-green-600',
    social: 'text-pink-500',
    other: 'text-gray-500',
  }
  return colors[type]
}

// Background color classes for each event type
export function getEventTypeBgColor(type: EventType): string {
  const colors: Record<EventType, string> = {
    custom: 'bg-gray-100',
    meeting: 'bg-blue-100',
    committee: 'bg-purple-100',
    workshop: 'bg-amber-100',
    action: 'bg-red-100',
    intake: 'bg-green-100',
    social: 'bg-pink-100',
    other: 'bg-gray-100',
  }
  return colors[type]
}
