'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { isEmailAvailable } from '@/lib/profileStorage';
import { sendVerificationCode, verifyEmailCode, isEmailVerificationAvailable } from '@/lib/emailVerification';
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
  const [verificationCode, setVerificationCode] = useState(formData.verificationCode || '');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(formData.emailVerified ? true : false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(formData.emailVerified || false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const emailCheckTimeout = useRef<NodeJS.Timeout | null>(null);
  const autoFocusRef = useRef<HTMLInputElement>(null);

  const emailVerificationEnabled = isEmailVerificationAvailable();

  // Use ref to avoid stale closure issues with formData
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

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
      setCodeSent(false);
      setEmailVerified(false);
      setVerificationCode('');
      setCodeError(null);
    }

    // Update parent form data immediately
    onFormDataChange({
      ...formDataRef.current,
      email: normalizedEmail,
      emailVerified: false,
      verificationCode: '',
    });
  }, [onFormDataChange]);

  // Handle verification code change
  const handleCodeChange = useCallback((value: string) => {
    // Only allow digits, max 6 characters
    const cleanCode = value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(cleanCode);
    setCodeError(null);

    // Update parent form data
    onFormDataChange({
      ...formDataRef.current,
      verificationCode: cleanCode,
    });
  }, [onFormDataChange]);

  // Send verification code
  const handleSendCode = useCallback(async () => {
    if (!email || isSendingCode || cooldownSeconds > 0) return;

    setIsSendingCode(true);
    setCodeError(null);

    try {
      const result = await sendVerificationCode(email, nickname);

      if (result.success) {
        setCodeSent(true);
        setCooldownSeconds(60); // 60 second cooldown before resend
        if (onEmailVerification) {
          onEmailVerification({ codeSent: true, verified: false });
        }
      } else {
        setCodeError(result.error || 'Failed to send verification code');
        if (onEmailVerification) {
          onEmailVerification({ codeSent: false, verified: false, error: result.error });
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send code';
      setCodeError(message);
      if (onEmailVerification) {
        onEmailVerification({ codeSent: false, verified: false, error: message });
      }
    } finally {
      setIsSendingCode(false);
    }
  }, [email, nickname, isSendingCode, cooldownSeconds, onEmailVerification]);

  // Verify code
  const handleVerifyCode = useCallback(async () => {
    if (!email || !verificationCode || verificationCode.length !== 6 || isVerifyingCode) return;

    setIsVerifyingCode(true);
    setCodeError(null);

    try {
      const result = await verifyEmailCode(email, verificationCode);

      if (result.success) {
        setEmailVerified(true);
        // Update parent form data
        onFormDataChange({
          ...formDataRef.current,
          emailVerified: true,
        });
        if (onEmailVerification) {
          onEmailVerification({ codeSent: true, verified: true });
        }
      } else {
        setCodeError(result.error || 'Invalid verification code');
        if (onEmailVerification) {
          onEmailVerification({ codeSent: true, verified: false, error: result.error });
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify code';
      setCodeError(message);
      if (onEmailVerification) {
        onEmailVerification({ codeSent: true, verified: false, error: message });
      }
    } finally {
      setIsVerifyingCode(false);
    }
  }, [email, verificationCode, isVerifyingCode, onFormDataChange, onEmailVerification]);

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

  const canSendCode = email && !emailError && !isValidatingEmail && !isSendingCode && cooldownSeconds === 0;
  const canVerifyCode = verificationCode.length === 6 && !isVerifyingCode && !emailVerified;

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
          We&apos;ll send a verification code to confirm your email.
        </p>
      </div>

      {/* Email Verification Section */}
      {emailVerificationEnabled && email && !emailError && !isValidatingEmail && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-4">
          {!emailVerified ? (
            <>
              {/* Send Code Button */}
              {!codeSent ? (
                <div>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={!canSendCode}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                      canSendCode
                        ? 'bg-rstu-red text-white hover:bg-red-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isSendingCode ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      'Send Verification Code'
                    )}
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    We&apos;ll send a 6-digit code to {email}
                  </p>
                </div>
              ) : (
                <>
                  {/* Verification Code Input */}
                  <div>
                    <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Code
                    </label>
                    <div className="flex gap-3">
                      <input
                        id="verification-code"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={verificationCode}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                        className={`flex-1 px-4 py-3 border rounded-lg text-base font-mono font-bold tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent transition-all ${
                          codeError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyCode}
                        disabled={!canVerifyCode}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                          canVerifyCode
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isVerifyingCode ? (
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          'Verify'
                        )}
                      </button>
                    </div>
                    {codeError && <p className="text-xs sm:text-sm text-red-600 mt-2">{codeError}</p>}
                  </div>

                  {/* Resend Button */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Didn&apos;t receive the code?</span>
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={cooldownSeconds > 0 || isSendingCode}
                      className={`font-medium ${
                        cooldownSeconds > 0 || isSendingCode
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-rstu-red hover:text-red-700'
                      }`}
                    >
                      {cooldownSeconds > 0 ? `Resend in ${cooldownSeconds}s` : 'Resend Code'}
                    </button>
                  </div>
                </>
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
