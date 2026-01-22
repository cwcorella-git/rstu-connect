'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { isEmailAvailable } from '@/lib/profileStorage';
import {
  sendVerificationLink,
  checkVerificationStatus,
  onAuthStateChange,
  isEmailVerificationAvailable,
} from '@/lib/emailVerification';
import { getFieldError } from '../utils';
import type { OnboardingFormData, ValidateEmailResult, EmailVerificationResult } from '../types';

interface StepIdentityProps {
  formData: OnboardingFormData;
  onFormDataChange: (data: OnboardingFormData) => void;
  onEmailValidation: (result: ValidateEmailResult) => void;
  onEmailVerification?: (result: EmailVerificationResult) => void;
  emailValidation?: ValidateEmailResult;
}

export function StepIdentity({
  formData,
  onFormDataChange,
  onEmailValidation,
  onEmailVerification,
}: StepIdentityProps) {
  const [email, setEmail] = useState(formData.email);
  const [nickname, setNickname] = useState(formData.nickname);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(formData.emailVerified || false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const emailCheckTimeout = useRef<NodeJS.Timeout | null>(null);
  const autoFocusRef = useRef<HTMLInputElement>(null);

  const emailVerificationEnabled = isEmailVerificationAvailable();

  // Use ref to avoid stale closure issues with formData
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  // Check if already verified on mount (e.g., returning from magic link)
  useEffect(() => {
    const checkInitialStatus = async () => {
      const status = await checkVerificationStatus();
      if (status.verified && status.email) {
        // User is already verified - update state
        setEmailVerified(true);
        if (status.email !== email) {
          setEmail(status.email);
        }
        onFormDataChange({
          ...formDataRef.current,
          email: status.email,
          emailVerified: true,
        });
        if (onEmailVerification) {
          onEmailVerification({ codeSent: true, verified: true });
        }
      }
    };

    checkInitialStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for auth state changes (magic link callback)
  useEffect(() => {
    const unsubscribe = onAuthStateChange((verified, verifiedEmail) => {
      if (verified && verifiedEmail) {
        setEmailVerified(true);
        setEmail(verifiedEmail);
        onFormDataChange({
          ...formDataRef.current,
          email: verifiedEmail,
          emailVerified: true,
        });
        if (onEmailVerification) {
          onEmailVerification({ codeSent: true, verified: true });
        }
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [onFormDataChange, onEmailVerification]);

  // Auto-focus nickname input on mount
  useEffect(() => {
    if (autoFocusRef.current && !nickname) {
      autoFocusRef.current.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cooldown timer for resend button
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => setCooldownSeconds(cooldownSeconds - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds]);

  // Handle nickname change - update local state and parent
  const handleNicknameChange = useCallback((value: string) => {
    setNickname(value);
    const error = getFieldError('nickname', value, {});
    setNicknameError(error);

    // Update parent form data
    onFormDataChange({
      ...formDataRef.current,
      nickname: value,
    });
  }, [onFormDataChange]);

  // Handle email change - update local state and trigger validation
  const handleEmailChange = useCallback((value: string) => {
    const normalizedEmail = value.toLowerCase();
    setEmail(normalizedEmail);

    // Reset verification state when email changes
    if (normalizedEmail !== formDataRef.current.email) {
      setLinkSent(false);
      setEmailVerified(false);
      setLinkError(null);
    }

    // Update parent form data immediately
    onFormDataChange({
      ...formDataRef.current,
      email: normalizedEmail,
      emailVerified: false,
    });
  }, [onFormDataChange]);

  // Send verification link
  const handleSendLink = useCallback(async () => {
    if (!email || isSendingLink || cooldownSeconds > 0) return;

    setIsSendingLink(true);
    setLinkError(null);

    try {
      const result = await sendVerificationLink(email);

      if (result.success) {
        setLinkSent(true);
        setCooldownSeconds(60); // 60 second cooldown before resend
        if (onEmailVerification) {
          onEmailVerification({ codeSent: true, verified: false });
        }
      } else {
        setLinkError(result.error || 'Failed to send verification email');
        if (onEmailVerification) {
          onEmailVerification({ codeSent: false, verified: false, error: result.error });
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send email';
      setLinkError(message);
      if (onEmailVerification) {
        onEmailVerification({ codeSent: false, verified: false, error: message });
      }
    } finally {
      setIsSendingLink(false);
    }
  }, [email, isSendingLink, cooldownSeconds, onEmailVerification]);

  // Debounced email validation effect
  useEffect(() => {
    // Clear previous timeout
    if (emailCheckTimeout.current) {
      clearTimeout(emailCheckTimeout.current);
    }

    // Don't validate if email is empty
    if (!email) {
      setEmailError(null);
      onEmailValidation({ available: false });
      return;
    }

    // Basic format validation first
    const formatError = getFieldError('email', email, {});
    if (formatError) {
      setEmailError(formatError);
      onEmailValidation({ available: false, error: formatError });
      return;
    }

    // Debounce async validation (500ms)
    setIsValidatingEmail(true);
    emailCheckTimeout.current = setTimeout(async () => {
      try {
        const result = await isEmailAvailable(email);

        if (result.available) {
          setEmailError(null);
          onEmailValidation({ available: true });
        } else {
          const errorMsg = result.existingNickname
            ? `Email already registered to ${result.existingNickname}`
            : 'Email already in use';
          setEmailError(errorMsg);
          onEmailValidation({ available: false, error: errorMsg });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not validate email';
        setEmailError(message);
        onEmailValidation({ available: false, error: message });
      } finally {
        setIsValidatingEmail(false);
      }
    }, 500);

    return () => {
      if (emailCheckTimeout.current) {
        clearTimeout(emailCheckTimeout.current);
      }
    };
  }, [email, onEmailValidation]);

  const canSendLink = email && !emailError && !isValidatingEmail && !isSendingLink && cooldownSeconds === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">About You</h2>
        <p className="text-sm sm:text-base text-gray-600">
          Choose how you&apos;d like to appear to neighbors in your building community.
        </p>
      </div>

      {/* Nickname field */}
      <div>
        <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
          Nickname <span className="text-rstu-red">*</span>
        </label>
        <input
          ref={autoFocusRef}
          id="nickname"
          type="text"
          value={nickname}
          onChange={(e) => handleNicknameChange(e.target.value)}
          placeholder="How should we call you?"
          maxLength={30}
          className={`w-full px-4 py-3 border rounded-lg text-base font-medium focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent transition-all ${
            nicknameError ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        />
        {nicknameError && <p className="text-xs sm:text-sm text-red-600 mt-2">{nicknameError}</p>}
        <p className="text-xs text-gray-500 mt-2">
          No real name required. Be creative! You can always change this later.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {nickname.length}/30 characters
        </p>
      </div>

      {/* Email field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email <span className="text-rstu-red">*</span>
        </label>

        <div className="relative">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="your@email.com"
            disabled={emailVerified}
            className={`w-full px-4 py-3 border rounded-lg text-base font-medium focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent transition-all ${
              emailError ? 'border-red-500 bg-red-50' : emailVerified ? 'border-green-500 bg-green-50' : 'border-gray-300'
            } ${emailVerified ? 'cursor-not-allowed' : ''}`}
          />

          {/* Validation icons */}
          {email && !emailError && isValidatingEmail && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
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
            </div>
          )}

          {email && !emailError && !isValidatingEmail && !emailVerified && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}

          {emailVerified && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-green-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-medium">Verified</span>
            </div>
          )}
        </div>

        {emailError && <p className="text-xs sm:text-sm text-red-600 mt-2">{emailError}</p>}

        <p className="text-xs text-gray-500 mt-2">
          We&apos;ll send a verification link to confirm your email.
        </p>
      </div>

      {/* Email Verification Section */}
      {emailVerificationEnabled && email && !emailError && !isValidatingEmail && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-4">
          {!emailVerified ? (
            <>
              {/* Send Link Button or Waiting State */}
              {!linkSent ? (
                <div>
                  <button
                    type="button"
                    onClick={handleSendLink}
                    disabled={!canSendLink}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                      canSendLink
                        ? 'bg-rstu-red text-white hover:bg-red-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isSendingLink ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      'Send Verification Link'
                    )}
                  </button>
                  {linkError && <p className="text-xs sm:text-sm text-red-600 mt-2">{linkError}</p>}
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    We&apos;ll send a link to {email}
                  </p>
                </div>
              ) : (
                /* Waiting for verification */
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Check your email</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    We sent a verification link to <strong>{email}</strong>
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Click the link in the email to verify. This page will update automatically.
                  </p>

                  {/* Resend Button */}
                  <button
                    type="button"
                    onClick={handleSendLink}
                    disabled={cooldownSeconds > 0 || isSendingLink}
                    className={`text-sm font-medium ${
                      cooldownSeconds > 0 || isSendingLink
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-rstu-red hover:text-red-700'
                    }`}
                  >
                    {cooldownSeconds > 0 ? `Resend in ${cooldownSeconds}s` : 'Resend verification link'}
                  </button>

                  {/* Change email link */}
                  <p className="text-xs text-gray-400 mt-3">
                    Wrong email?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setLinkSent(false);
                        setLinkError(null);
                      }}
                      className="text-rstu-red hover:text-red-700"
                    >
                      Change it
                    </button>
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Verified State */
            <div className="flex items-center gap-3 py-2">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-green-800">Email Verified</p>
                <p className="text-sm text-green-600">{email}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Warning if email verification not available */}
      {!emailVerificationEnabled && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs sm:text-sm text-yellow-800">
            <strong>Note:</strong> Email verification is not currently available. Your email will be used for
            account identification but won&apos;t be verified.
          </p>
        </div>
      )}

      {/* Progressive info section */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-xs sm:text-sm text-green-800 leading-relaxed">
          <strong>Shared with organizers only:</strong> Your email and nickname are visible only to verified
          organizers and neighbors in your building. We never share your information with landlords,
          property managers, or any third parties.
        </p>
      </div>
    </div>
  );
}
