'use client';

import { useState, useEffect, useRef } from 'react';
import { validateInviteCodeAsync } from '@/lib/profileStorage';
import { sanitizeInviteCode, getInviteCodeFromUrl } from '../utils';
import type { OnboardingFormData } from '../types';

interface StepWelcomeProps {
  formData: OnboardingFormData;
  onFormDataChange: (data: OnboardingFormData) => void;
  onInviteValidation: (result: { valid: boolean; error?: string }) => void;
}

export function StepWelcome({ formData, onFormDataChange, onInviteValidation }: StepWelcomeProps) {
  const [localInviteCode, setLocalInviteCode] = useState(formData.inviteCode || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [hasAttempted, setHasAttempted] = useState(false);
  const hasAutoValidated = useRef(false);

  // Handle invite code validation
  const handleValidateInvite = async () => {
    if (!localInviteCode.trim()) {
      onInviteValidation({ valid: false, error: 'Please enter an invite code' });
      setHasAttempted(true);
      return;
    }

    setIsValidating(true);
    setHasAttempted(true);

    try {
      const result = await validateInviteCodeAsync(localInviteCode);
      setValidationResult(result);

      if (result.valid) {
        onFormDataChange({
          ...formData,
          inviteCode: localInviteCode,
        });
        onInviteValidation({ valid: true });
      } else {
        onInviteValidation({ valid: false, error: result.error });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to validate invite code';
      onInviteValidation({ valid: false, error: message });
      setValidationResult({ valid: false, error: message });
    } finally {
      setIsValidating(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && localInviteCode.trim()) {
      handleValidateInvite();
    }
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    const sanitized = sanitizeInviteCode(value);
    setLocalInviteCode(sanitized);
  };

  // Sync localInviteCode when formData changes (e.g., from URL params)
  useEffect(() => {
    if (formData.inviteCode && formData.inviteCode !== localInviteCode) {
      setLocalInviteCode(formData.inviteCode);
    }
  }, [formData.inviteCode]);

  // Auto-validate if invite code came from URL (runs once on mount)
  useEffect(() => {
    // Only auto-validate once
    if (hasAutoValidated.current) return;

    const urlInviteCode = getInviteCodeFromUrl();
    // Auto-validate if URL has invite code and it matches formData
    if (urlInviteCode && formData.inviteCode === urlInviteCode) {
      hasAutoValidated.current = true;

      // Validate directly with the URL invite code (don't rely on localInviteCode state)
      const validateUrlInvite = async () => {
        setIsValidating(true);
        setHasAttempted(true);

        try {
          const result = await validateInviteCodeAsync(urlInviteCode);
          setValidationResult(result);

          if (result.valid) {
            onFormDataChange({
              ...formData,
              inviteCode: urlInviteCode,
            });
            onInviteValidation({ valid: true });
          } else {
            onInviteValidation({ valid: false, error: result.error });
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to validate invite code';
          onInviteValidation({ valid: false, error: message });
          setValidationResult({ valid: false, error: message });
        } finally {
          setIsValidating(false);
        }
      };

      validateUrlInvite();
    }
  }, [formData.inviteCode]);

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to RSTU</h2>
        <p className="text-gray-600">
          Join your building community and connect with neighbors. Your information stays private and is
          never shared with landlords.
        </p>
      </div>

      {/* Invite code input section */}
      <div className="space-y-3">
        <label htmlFor="invite-code" className="block text-sm font-medium text-gray-700">
          Invite Code <span className="text-rstu-red">*</span>
        </label>

        <div className="flex gap-2">
          <input
            id="invite-code"
            type="text"
            value={localInviteCode}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your invite code..."
            className={`flex-1 px-4 py-3 border rounded-lg text-sm font-medium uppercase placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent transition-all ${
              validationResult?.valid
                ? 'border-green-500 bg-green-50'
                : hasAttempted && !validationResult?.valid
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300'
            }`}
            disabled={isValidating}
          />

          <button
            onClick={handleValidateInvite}
            disabled={!localInviteCode.trim() || isValidating}
            className={`px-6 py-3 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
              localInviteCode.trim() && !isValidating
                ? 'bg-rstu-red text-white hover:bg-red-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isValidating ? (
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
            ) : (
              'Check'
            )}
          </button>
        </div>

        {/* Validation result messages */}
        {validationResult?.valid && (
          <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>Invite code valid!</strong>
                {validationResult.createdBy && (
                  <span className="block text-xs mt-1">
                    Invited by <strong>{validationResult.createdBy}</strong>
                  </span>
                )}
              </span>
            </p>
          </div>
        )}

        {hasAttempted && !validationResult?.valid && (
          <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{validationResult?.error || 'Invalid invite code'}</span>
            </p>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Invite codes</strong> help us verify you're a real tenant and protect our community from
          bad actors. If you don't have one yet, ask a neighbor, organizer, or reach out at{' '}
          <a href="mailto:contact@renosparkstenantsunion.org" className="underline">contact@renosparkstenantsunion.org</a>
        </p>
      </div>

      {/* Privacy notice */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-xs text-green-800">
          <strong>Your privacy is protected:</strong> All information you share is visible only to verified
          organizers and neighbors in your building. We never share data with landlords, property managers,
          or third parties.
        </p>
      </div>
    </div>
  );
}
