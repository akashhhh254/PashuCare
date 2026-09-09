import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Lock,
  Mail,
  Phone,
  MapPin,
  Building,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { UserProfile, Language } from '../types';
import { translations, getTranslation } from '../i18n/translations';

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string; select_by?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            context?: string;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: number | string;
              locale?: string;
            }
          ) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
          cancel?: () => void;
        };
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (tokenResponse: any) => void;
            error_callback?: (error: any) => void;
          }) => {
            requestAccessToken: (overrideConfig?: any) => void;
          };
        };
      };
    };
  }
}

interface AuthModalProps {
  isOpen: boolean;
  language: Language;
  initialTab?: 'signin' | 'register';
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  language,
  initialTab = 'register',
  onClose,
  onSuccess,
}) => {
  const t = (key: keyof typeof translations['en']) => getTranslation(language, key);

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sign In Form State
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Register Form State
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regContact, setRegContact] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regFarmName, setRegFarmName] = useState('');
  const [regFarmLocation, setRegFarmLocation] = useState('Maharashtra, India');

  // Google Sign-In helper prompt
  const [showGoogleEmailPrompt, setShowGoogleEmailPrompt] = useState(false);
  const [googleManualEmail, setGoogleManualEmail] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setErrorMessage(null);
      setSuccessMessage(null);
      setShowGoogleEmailPrompt(false);
    }
  }, [isOpen, initialTab]);

  // Handle Google Credential Response from GIS
  const handleCredentialResponse = async (response: { credential: string; select_by?: string }) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (!response.credential) {
        throw new Error('No Google credential token received.');
      }

      let email = '';
      let name = '';
      let picture = '';

      try {
        const base64Url = response.credential.split('.')[1];
        if (base64Url) {
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            window
              .atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const payload = JSON.parse(jsonPayload);
          email = payload.email || '';
          name = payload.name || '';
          picture = payload.picture || '';
        }
      } catch (decodeErr) {
        console.warn('Direct JWT payload decode notice:', decodeErr);
      }

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: response.credential,
          email,
          name,
          picture,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        onSuccess(data.user);
        onClose();
      } else {
        setErrorMessage(data.message || 'Google authentication failed on server.');
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setErrorMessage(err.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize GIS listener when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;

    if (clientId && typeof window !== 'undefined' && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      } catch (err) {
        console.warn('GIS initialize error:', err);
      }
    }
  }, [isOpen]);

  // Initiate single Google Sign-In
  const initiateGoogleSignIn = async (emailOverride?: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;

    if (clientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('GIS OneTap prompt not displayed, falling back to direct auth');
            fallbackGoogleAuth(emailOverride);
          }
        });
        return;
      } catch (err) {
        console.warn('GIS prompt error:', err);
      }
    }

    // Direct Google authentication
    await fallbackGoogleAuth(emailOverride);
  };

  const fallbackGoogleAuth = async (emailOverride?: string) => {
    try {
      const emailToUse = emailOverride?.trim() || googleManualEmail.trim();

      if (!emailToUse && !emailOverride) {
        setShowGoogleEmailPrompt(true);
        setIsLoading(false);
        return;
      }

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToUse,
          name: emailToUse.split('@')[0],
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        onSuccess(data.user);
        onClose();
      } else {
        setErrorMessage(data.message || 'Google sign-in failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign-in error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Real Registration Form Submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regFirstName.trim()) {
      setErrorMessage('Please enter your first name.');
      return;
    }
    if (!regLastName.trim()) {
      setErrorMessage('Please enter your surname / last name.');
      return;
    }
    if (!regUsername.trim()) {
      setErrorMessage('Please choose a username.');
      return;
    }
    if (!regContact.trim()) {
      setErrorMessage('Please enter an email address or mobile number.');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    try {
      const isEmail = regContact.includes('@');
      const payload = {
        name: regFirstName.trim(),
        surname: regLastName.trim(),
        username: regUsername.trim(),
        email: isEmail ? regContact.trim() : '',
        phone: isEmail ? '' : regContact.trim(),
        password: regPassword,
        farmName: regFarmName.trim() || `${regFirstName.trim()}'s Livestock Farm`,
        farmLocation: regFarmLocation.trim() || 'Maharashtra, India',
        preferredLanguage: language,
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setSuccessMessage('Account created successfully! Logging in...');
        setTimeout(() => {
          onSuccess(data.user);
          onClose();
        }, 600);
      } else {
        setErrorMessage(data.message || 'Failed to create account. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Real Sign In Form Submission
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signInIdentifier.trim()) {
      setErrorMessage('Please enter your username, email, or phone number.');
      return;
    }
    if (!signInPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: signInIdentifier.trim(),
          password: signInPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setSuccessMessage('Signed in successfully!');
        setTimeout(() => {
          onSuccess(data.user);
          onClose();
        }, 500);
      } else {
        setErrorMessage(data.message || 'Sign in failed. Check your username/password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error during sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="auth-modal-card"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 transition-all"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-stone-900">
              {activeTab === 'register' ? t('authSignUpTitle') : t('authSignInTitle')}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {activeTab === 'register'
                ? 'Create your verified farmer account to track livestock health'
                : 'Sign in to access your livestock, health reports & reminders'}
            </p>
          </div>
          <button
            id="close-auth-modal-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Error Message */}
          {errorMessage && (
            <div
              id="auth-error-banner"
              className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div
              id="auth-success-banner"
              className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Single "Continue with Google" Button */}
          <div className="space-y-2">
            <button
              id="continue-with-google-btn"
              type="button"
              disabled={isLoading}
              onClick={() => initiateGoogleSignIn()}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 active:scale-[0.99] text-stone-800 font-bold text-sm shadow-2xs transition disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-stone-600" />
              ) : (
                <GoogleIcon />
              )}
              <span>{t('authGoogle')}</span>
            </button>

            {/* If Google Email Input Prompt is triggered */}
            {showGoogleEmailPrompt && (
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-700">Enter your Google Email:</span>
                  <button
                    type="button"
                    onClick={() => setShowGoogleEmailPrompt(false)}
                    className="text-stone-400 hover:text-stone-600"
                  >
                    Cancel
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="your.email@gmail.com"
                    value={googleManualEmail}
                    onChange={(e) => setGoogleManualEmail(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => initiateGoogleSignIn(googleManualEmail)}
                    className="px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                  >
                    Connect
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-stone-200" />
            <span className="flex-shrink mx-3 text-xs text-stone-400 font-bold uppercase tracking-wider">
              {t('authOrDivider')}
            </span>
            <div className="flex-grow border-t border-stone-200" />
          </div>

          {/* Tab Switcher: Register vs Sign In */}
          <div className="flex p-1 bg-stone-100 rounded-xl">
            <button
              id="tab-register-btn"
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition ${
                activeTab === 'register'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t('authTabRegister')}
            </button>
            <button
              id="tab-signin-btn"
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition ${
                activeTab === 'signin'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t('authTabSignIn')}
            </button>
          </div>

          {/* TAB 1: CREATE ACCOUNT FORM */}
          {activeTab === 'register' && (
            <form id="register-form" onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Name & Surname Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('authFirstName')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-first-name-input"
                      type="text"
                      required
                      placeholder="e.g. Ramesh"
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('authLastName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="reg-last-name-input"
                    type="text"
                    required
                    placeholder="e.g. Patil"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Username Field */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t('authUsername')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="reg-username-input"
                  type="text"
                  required
                  placeholder="e.g. ramesh_kisan"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Email or Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t('authPhoneOrEmail')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-contact-input"
                    type="text"
                    required
                    placeholder="e.g. farmer@example.com or +91 98765 43210"
                    value={regContact}
                    onChange={(e) => setRegContact(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('authPassword')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-password-input"
                      type="password"
                      required
                      minLength={4}
                      placeholder="Min 4 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('authConfirmPassword')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="reg-confirm-password-input"
                    type="password"
                    required
                    minLength={4}
                    placeholder="Re-enter password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Farm Name & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('authFarmName')}
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-farm-name-input"
                      type="text"
                      placeholder="e.g. Kisan Dairy Farm"
                      value={regFarmName}
                      onChange={(e) => setRegFarmName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('authFarmLocation')}
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-farm-location-input"
                      type="text"
                      placeholder="e.g. Pune, Maharashtra"
                      value={regFarmLocation}
                      onChange={(e) => setRegFarmLocation(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="submit-register-btn"
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>{t('authRegisterBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Switch link */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-stone-600 hover:text-emerald-700 font-semibold"
                >
                  {t('authSwitchToSignIn')}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SIGN IN FORM */}
          {activeTab === 'signin' && (
            <form id="signin-form" onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t('authUsername')} / {t('authPhoneOrEmail')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="signin-identifier-input"
                    type="text"
                    required
                    placeholder="Enter username, email, or phone"
                    value={signInIdentifier}
                    onChange={(e) => setSignInIdentifier(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t('authPassword')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="signin-password-input"
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="submit-signin-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>{t('authSignInBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Switch link */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-stone-600 hover:text-emerald-700 font-semibold"
                >
                  {t('authSwitchToRegister')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const GoogleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);
