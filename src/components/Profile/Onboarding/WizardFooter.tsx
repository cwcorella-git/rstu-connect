'use client';

import type { OnboardingStep } from './types';

interface WizardFooterProps {
  currentStep: OnboardingStep;
  canProceed: boolean;
  isLoading: boolean;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  profileCreated: boolean;
}

export function WizardFooter({
  currentStep,
  canProceed,
  isLoading,
  onNext,
  onBack,
  onSkip,
  profileCreated,
}: WizardFooterProps) {
  // Determine button labels
  const isLastStep = currentStep === 'review';
  const isFirstStep = currentStep === 'welcome';
  const isOptionalStep = currentStep === 'building' || currentStep === 'household';
  const nextButtonLabel = isLastStep ? 'Create Profile' : 'Continue';

  // Show success state
  if (profileCreated) {
    return (
      <div className="flex-shrink-0 border-t border-gray-200 p-4 sm:p-6 bg-white">
        <div className="text-center py-4">
          <svg className="w-12 h-12 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-lg font-semibold text-gray-900">Profile Created!</p>
          <p className="text-sm text-gray-600 mt-1">Redirecting you now...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 border-t border-gray-200 p-4 sm:p-6 bg-white space-y-3 sm:space-y-0">
      {/* Main buttons row */}
      <div className="flex gap-2 sm:gap-3">
        {/* Back button - hidden on first step */}
        {!isFirstStep && (
          <button
            onClick={onBack}
            disabled={isLoading}
            className="flex-1 py-3 sm:py-4 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
            aria-label="Go back to previous step"
          >
            <span className="hidden sm:inline">← Back</span>
            <span className="sm:hidden">Back</span>
          </button>
        )}

        {/* Next/Create button */}
        <button
          onClick={onNext}
          disabled={!canProceed || isLoading}
          className={`flex-1 py-3 sm:py-4 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base ${
            canProceed && !isLoading
              ? 'bg-rstu-red text-white hover:bg-red-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
          aria-label={isLastStep ? 'Create your profile' : 'Go to next step'}
        >
          {isLoading && (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating...
            </span>
          )}
          {!isLoading && (
            <span className="flex items-center justify-center gap-1">
              {nextButtonLabel}
              <span className="hidden sm:inline">→</span>
            </span>
          )}
        </button>
      </div>

      {/* Skip button - only for optional steps */}
      {isOptionalStep && (
        <button
          onClick={onSkip}
          disabled={isLoading}
          className="w-full py-2 sm:py-3 text-gray-500 text-sm hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Skip this step"
        >
          Skip for now →
        </button>
      )}

      {/* Mobile-only: Show step indicator */}
      <p className="text-xs text-center text-gray-400 sm:hidden mt-2">
        {currentStep === 'review' ? 'Almost done!' : 'One more step...'}
      </p>
    </div>
  );
}
