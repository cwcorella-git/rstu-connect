import { OnboardingFormData, OnboardingStep, ValidateEmailResult } from './types';

/**
 * Get the next step in the wizard sequence
 */
export function getNextStep(currentStep: OnboardingStep): OnboardingStep {
  const steps: OnboardingStep[] = ['welcome', 'identity', 'building', 'household', 'review'];
  const currentIndex = steps.indexOf(currentStep);
  if (currentIndex < steps.length - 1) {
    return steps[currentIndex + 1];
  }
  return 'review'; // Last step
}

/**
 * Get the previous step in the wizard sequence
 */
export function getPreviousStep(currentStep: OnboardingStep): OnboardingStep {
  const steps: OnboardingStep[] = ['welcome', 'identity', 'building', 'household', 'review'];
  const currentIndex = steps.indexOf(currentStep);
  if (currentIndex > 0) {
    return steps[currentIndex - 1];
  }
  return 'welcome'; // First step
}

/**
 * Get step title for display
 */
export function getStepTitle(step: OnboardingStep): string {
  const titles: Record<OnboardingStep, string> = {
    welcome: 'Welcome to RSTU',
    identity: 'Your Identity',
    building: 'Your Building',
    household: 'Your Household',
    review: 'Review Profile',
  };
  return titles[step];
}

/**
 * Get step description
 */
export function getStepDescription(step: OnboardingStep): string {
  const descriptions: Record<OnboardingStep, string> = {
    welcome: 'Join your building community',
    identity: 'Choose how you appear',
    building: 'Find your property',
    household: 'Optional household info',
    review: 'Confirm your information',
  };
  return descriptions[step];
}

/**
 * Get step index for progress bar (1-based for display)
 */
export function getStepIndex(step: OnboardingStep): number {
  const steps: OnboardingStep[] = ['welcome', 'identity', 'building', 'household', 'review'];
  return steps.indexOf(step) + 1;
}

/**
 * Total number of steps in wizard
 */
export const TOTAL_WIZARD_STEPS = 5;

/**
 * Validate email format (basic check)
 */
export function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Determine if current step can proceed to next
 * Different validation rules for each step
 */
export function canProceedFromStep(
  step: OnboardingStep,
  formData: OnboardingFormData,
  validation: {
    emailAvailable?: boolean;
    emailError?: string;
    inviteValid?: boolean;
    inviteError?: string;
  }
): boolean {
  switch (step) {
    case 'welcome':
      // Welcome step requires valid invite code
      return validation.inviteValid === true;

    case 'identity':
      // Both nickname and email required, email must be available (unique)
      return (
        formData.nickname.length >= 2 &&
        formData.email.length > 0 &&
        validateEmailFormat(formData.email) &&
        validation.emailAvailable === true
      );

    case 'building':
      // Building is optional, can always proceed
      return true;

    case 'household':
      // Household is optional, can always proceed
      return true;

    case 'review':
      // Review step: can proceed (create profile) if all required fields are valid
      return (
        validation.inviteValid === true &&
        formData.nickname.length >= 2 &&
        formData.email.length > 0 &&
        validateEmailFormat(formData.email) &&
        validation.emailAvailable === true
      );

    default:
      return false;
  }
}

/**
 * Get error message for invalid field
 */
export function getFieldError(
  field: string,
  value: any,
  validation: Record<string, any>
): string | null {
  if (field === 'nickname') {
    if (!value || value.length === 0) {
      return 'Nickname is required';
    }
    if (value.length < 2) {
      return 'Nickname must be at least 2 characters';
    }
    if (value.length > 30) {
      return 'Nickname must be 30 characters or less';
    }
  }

  if (field === 'email') {
    if (!value || value.length === 0) {
      return 'Email is required';
    }
    if (!validateEmailFormat(value)) {
      return 'Please enter a valid email address';
    }
    if (validation.emailError) {
      return validation.emailError;
    }
  }

  return null;
}

/**
 * Sanitize invite code (uppercase, alphanumeric + hyphens only)
 */
export function sanitizeInviteCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9-]/g, '');
}

/**
 * Parse URL parameters for invite code
 */
export function getInviteCodeFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('invite');
}

/**
 * Clear invite code from URL without affecting other parameters
 */
export function clearInviteFromUrl(): void {
  if (typeof window === 'undefined') return;
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.delete('invite');
  const newUrl = urlParams.toString() ? `${window.location.pathname}?${urlParams.toString()}` : window.location.pathname;
  window.history.replaceState({}, '', newUrl);
}

/**
 * Save wizard progress to localStorage
 */
export function saveWizardDraft(currentStep: OnboardingStep, formData: OnboardingFormData): void {
  const draft = {
    currentStep,
    formData,
    timestamp: Date.now(),
  };
  localStorage.setItem('rstu_onboarding_draft', JSON.stringify(draft));
}

/**
 * Load wizard progress from localStorage if recent (< 24 hours)
 */
export function loadWizardDraft(): { currentStep: OnboardingStep; formData: OnboardingFormData } | null {
  const draft = localStorage.getItem('rstu_onboarding_draft');
  if (!draft) return null;

  try {
    const data = JSON.parse(draft);
    const age = Date.now() - data.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (age < maxAge && data.currentStep && data.formData) {
      return {
        currentStep: data.currentStep as OnboardingStep,
        formData: data.formData as OnboardingFormData,
      };
    }
  } catch (err) {
    // Ignore parse errors
  }

  return null;
}

/**
 * Clear wizard draft from localStorage
 */
export function clearWizardDraft(): void {
  localStorage.removeItem('rstu_onboarding_draft');
}
