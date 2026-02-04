import type { ComponentType } from 'react'
import {
  ShoppingCartIcon,
  HomeIcon,
  ScaleIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  BuildingLibraryIcon,
  MegaphoneIcon,
  HeartIcon,
  HandRaisedIcon,
  SparklesIcon,
  FaceSmileIcon,
  PhoneIcon,
  UserGroupIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  TruckIcon,
  PuzzlePieceIcon,
  FlagIcon,
  LockOpenIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'
import type { ExternalResourceCategory, ResourceGroupId } from './storage/organizationStorage'

type IconComponent = ComponentType<{ className?: string }>

const CATEGORY_ICON_MAP: Record<ExternalResourceCategory, IconComponent> = {
  food: ShoppingCartIcon,
  shelter: HomeIcon,
  legal_aid: ScaleIcon,
  housing_services: KeyIcon,
  emergency_aid: ExclamationTriangleIcon,
  government: BuildingLibraryIcon,
  advocacy: MegaphoneIcon,
  health_services: HeartIcon,
  mutual_aid: HandRaisedIcon,
  faith: SparklesIcon,
  pet_services: FaceSmileIcon,
  crisis_mental_health: PhoneIcon,
  senior_services: UserGroupIcon,
  employment_training: BriefcaseIcon,
  childcare: AcademicCapIcon,
  transportation: TruckIcon,
  disability_services: PuzzlePieceIcon,
  lgbtq_services: FlagIcon,
  reentry_services: LockOpenIcon,
  other: ClipboardDocumentListIcon,
}

const GROUP_ICON_MAP: Record<ResourceGroupId, IconComponent> = {
  emergency: ExclamationTriangleIcon,
  housing: HomeIcon,
  legal: ScaleIcon,
  health: HeartIcon,
  specialized: PuzzlePieceIcon,
  employment: BriefcaseIcon,
  government: BuildingLibraryIcon,
  community: UserGroupIcon,
}

export function getCategoryIcon(category: string): IconComponent {
  return CATEGORY_ICON_MAP[category as ExternalResourceCategory] || ClipboardDocumentListIcon
}

export function getGroupIcon(groupId: string): IconComponent {
  return GROUP_ICON_MAP[groupId as ResourceGroupId] || ClipboardDocumentListIcon
}
