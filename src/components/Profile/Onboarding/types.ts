export type OnboardingStep = 'welcome' | 'identity' | 'building' | 'household' | 'review';

export interface OnboardingFormData {
  inviteCode?: string;
  nickname: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  buildingId?: string;
  buildingAddress?: string;
  unitNumber?: string;
  rentAmount?: number;
  occupants?: number;
  hasChildren?: boolean;
  hasPets?: boolean;
  moveInDate?: string;
}

export interface ValidatePasswordResult {
  valid: boolean;
  error?: string;
}

export interface ValidateEmailResult {
  available: boolean;
  error?: string;
  registeredTo?: string;
}

export interface ValidateInviteResult {
  valid: boolean;
  reason: string;
  createdBy?: string;
  createdByRole?: string;
  grantRole?: string;
}
