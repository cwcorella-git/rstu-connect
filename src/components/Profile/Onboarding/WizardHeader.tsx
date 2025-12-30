'use client';

import { getStepTitle, getStepDescription } from './utils';
import type { OnboardingStep } from './types';

interface WizardHeaderProps {
  currentStep: OnboardingStep;
  stepIndex: number;
  totalSteps: number;
  onClose: () => void;
}

export function WizardHeader({ currentStep, stepIndex, totalSteps, onClose }: WizardHeaderProps) {
  const progressPercent = (stepIndex / totalSteps) * 100;

  return (
    <div className="flex-shrink-0 bg-white border-b border-gray-200">
      {/* Progress bar */}
      <div className="h-1 bg-gray-100 overflow-hidden">
        <div
          className="h-full bg-rstu-red transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Header content */}
      <div className="flex items-start justify-between p-4 sm:p-6">
        <div className="flex-1 pr-4">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">
            {getStepTitle(currentStep)}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {getStepDescription(currentStep)}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Step {stepIndex} of {totalSteps}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close onboarding"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
