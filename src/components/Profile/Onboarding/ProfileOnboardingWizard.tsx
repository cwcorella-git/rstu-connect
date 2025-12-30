'use client';

import { useEffect, useState, useCallback } from 'react';
import { createProfileAsync, getCurrentProfile } from '@/lib/profileStorage';
import type { EnhancedBuilding } from '@/lib/getBuildingsData';
import { useLanguage } from '@/contexts/LanguageContext';
import type { OnboardingFormData, OnboardingStep } from './types';
import {
  getNextStep,
  getPreviousStep,
  canProceedFromStep,
  getInviteCodeFromUrl,
  clearInviteFromUrl,
  clearWizardDraft,
  saveWizardDraft,
  loadWizardDraft,
  getStepIndex,
  TOTAL_WIZARD_STEPS,
} from './utils';
import { WizardHeader } from './WizardHeader';
import { WizardFooter } from './WizardFooter';
import { StepWelcome } from './steps/StepWelcome';
import { StepIdentity } from './steps/StepIdentity';
import { StepBuilding } from './steps/StepBuilding';
import { StepHousehold } from './steps/StepHousehold';
import { StepReview } from './steps/StepReview';

interface ProfileOnboardingWizardProps {
  buildings: EnhancedBuilding[];
  onProfileCreated?: (profile: any) => void;
  onCancel?: () => void;
}

export function ProfileOnboardingWizard({
  buildings,
  onProfileCreated,
  onCancel,
}: ProfileOnboardingWizardProps) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [formData, setFormData] = useState<OnboardingFormData>({
    nickname: '',
    email: '',
  });
  const [completedSteps, setCompletedSteps] = useState<Set<OnboardingStep>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileCreated, setProfileCreated] = useState(false);

  // Validation state for email and invite
  const [emailValidation, setEmailValidation] = useState({
    available: false,
    error: null as string | null,
  });
  const [inviteValidation, setInviteValidation] = useState({
    valid: false,
    error: null as string | null,
  });

  // Initialize from URL invite code or resume draft
  useEffect(() => {
    const inviteFromUrl = getInviteCodeFromUrl();
    if (inviteFromUrl) {
      setFormData((prev) => ({
        ...prev,
        inviteCode: inviteFromUrl,
      }));
    }

    // Try to resume from draft
    const draft = loadWizardDraft();
    if (draft) {
      setCurrentStep(draft.currentStep);
      setFormData(draft.formData);
    }
  }, []);

  // Auto-save draft on step/data change (but not during creation)
  useEffect(() => {
    if (!profileCreated && currentStep !== 'welcome') {
      saveWizardDraft(currentStep, formData);
    }
  }, [currentStep, formData, profileCreated]);

  // Determine if we can proceed from current step
  const canProceed = canProceedFromStep(currentStep, formData, {
    emailAvailable: emailValidation.available,
    emailError: emailValidation.error || undefined,
    inviteValid: inviteValidation.valid,
    inviteError: inviteValidation.error || undefined,
  });

  // Handle next button
  const handleNext = useCallback(() => {
    if (!canProceed) return;

    // Mark current step as completed
    setCompletedSteps((prev) => new Set([...prev, currentStep]));

    // Move to next step
    const nextStep = getNextStep(currentStep);
    setCurrentStep(nextStep);
    setError(null);
  }, [currentStep, canProceed]);

  // Handle back button
  const handleBack = useCallback(() => {
    const prevStep = getPreviousStep(currentStep);
    setCurrentStep(prevStep);
    setError(null);
  }, [currentStep]);

  // Handle skip button (for optional steps)
  const handleSkip = useCallback(() => {
    // Mark as completed and skip to next
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    const nextStep = getNextStep(currentStep);
    setCurrentStep(nextStep);
    setError(null);
  }, [currentStep]);

  // Handle profile creation (from review step)
  const handleCreateProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const profile = await createProfileAsync({
        nickname: formData.nickname,
        email: formData.email,
        buildingId: formData.buildingId,
        unitNumber: formData.unitNumber,
        rentAmount: formData.rentAmount,
        occupants: formData.occupants,
        hasChildren: formData.hasChildren,
        hasPets: formData.hasPets,
        moveInDate: formData.moveInDate,
        inviteCode: formData.inviteCode,
      });

      if (profile) {
        setProfileCreated(true);
        clearWizardDraft();
        clearInviteFromUrl();

        // Call callback if provided
        if (onProfileCreated) {
          onProfileCreated(profile);
        }

        // Auto-close after brief delay to show success
        setTimeout(() => {
          if (onCancel) {
            onCancel();
          }
        }, 1500);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create profile';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [formData, onProfileCreated, onCancel]);

  // Handle close/cancel
  const handleClose = useCallback(() => {
    if (currentStep !== 'welcome' && !profileCreated) {
      const confirmed = window.confirm(
        'Your profile is not saved yet. Are you sure you want to close?'
      );
      if (!confirmed) return;
    }
    if (onCancel) {
      onCancel();
    }
  }, [currentStep, profileCreated, onCancel]);

  // Render current step
  const renderCurrentStep = () => {
    const stepProps = {
      formData,
      onFormDataChange: setFormData,
      onEmailValidation: setEmailValidation,
      onInviteValidation: setInviteValidation,
    };

    switch (currentStep) {
      case 'welcome':
        return <StepWelcome {...stepProps} />;
      case 'identity':
        return <StepIdentity {...stepProps} emailValidation={emailValidation} />;
      case 'building':
        return <StepBuilding {...stepProps} buildings={buildings} />;
      case 'household':
        return <StepHousehold {...stepProps} />;
      case 'review':
        return (
          <StepReview
            {...stepProps}
            buildings={buildings}
            onCreateProfile={handleCreateProfile}
            isLoading={isLoading}
            profileCreated={profileCreated}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col md:items-center md:justify-center md:bg-black/50 md:p-4">
      {/* Mobile: Full screen | Desktop: Modal */}
      <div className="flex flex-col h-full w-full md:max-w-lg md:max-h-[90vh] md:rounded-lg md:shadow-2xl bg-white">
        {/* Header with progress bar */}
        <WizardHeader
          currentStep={currentStep}
          stepIndex={getStepIndex(currentStep)}
          totalSteps={TOTAL_WIZARD_STEPS}
          onClose={handleClose}
        />

        {/* Error alert */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Main content - scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          {renderCurrentStep()}
        </div>

        {/* Footer with navigation */}
        <WizardFooter
          currentStep={currentStep}
          canProceed={canProceed}
          isLoading={isLoading}
          onNext={handleNext}
          onBack={handleBack}
          onSkip={handleSkip}
          profileCreated={profileCreated}
        />
      </div>
    </div>
  );
}
