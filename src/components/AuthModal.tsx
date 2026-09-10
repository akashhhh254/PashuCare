import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Lock,
  Mail,
  Phone,
  Building,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Smartphone,
  Globe
} from 'lucide-react';
import { UserProfile, Language } from '../types';
import { translations, getTranslation } from '../i18n/translations';
import {
  signInWithGoogle,
  signInWithGooglePopup,
  getCurrentHostname,
  registerWithEmailPassword,
  signInWithEmailPassword,
  sendPasswordReset,
  setupPhoneRecaptcha,
  sendPhoneOtp,
  confirmPhoneOtp
} from '../lib/firebase';
import { ConfirmationResult } from 'firebase/auth';

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

  // Authentication Mode: 'email' or 'phone'
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

  // Email mode tabs: 'signin', 'register', or 'forgot_password'
  const [activeTab, setActiveTab] = useState<'signin' | 'register' | 'forgot_password'>(initialTab);

  // Loading & Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Email Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Email Register State
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regFarmName, setRegFarmName] = useState('');
  const [regFarmLocation, setRegFarmLocation] = useState('Maharashtra, India');

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');

  // Phone Auth State
  const [phoneStep, setPhoneStep] = useState<'enter_phone' | 'enter_otp'>('enter_phone');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneFarmerName, setPhoneFarmerName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setAuthMethod('email');
      setPhoneStep('enter_phone');
      setErrorMessage(null);
      setSuccessMessage(null);
      setForgotEmail('');
      setOtpCode('');
    }
  }, [isOpen, initialTab]);

  // ==========================================
  // 1. GOOGLE SIGN-IN HANDLER
  // ==========================================
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsGoogleLoading(true);

    try {
      const profile = await signInWithGoogle();
      if (!profile) {
        // Redirection initiated for standalone mobile browsers
        return;
      }
      setSuccessMessage(
        language === 'hi'
          ? 'Google से सफलतापूर्वक साइन इन किया गया!'
          : language === 'mr'
          ? 'Google द्वारे यशस्वीरित्या साइन इन केले!'
          : 'Successfully signed in with Google!'
      );
      setTimeout(() => {
        onSuccess(profile);
        onClose();
      }, 500);
    } catch (err: any) {
      const currentHost = getCurrentHostname() || (typeof window !== 'undefined' ? window.location.hostname : 'this domain');
      const isCancelled =
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        (err?.message && (
          err.message.includes('popup-closed-by-user') ||
          err.message.includes('cancelled-popup-request')
        ));

      if (isCancelled) {
        console.warn('Google Sign-In popup closed by user.');
        setErrorMessage(
          language === 'hi'
            ? 'साइन-इन विंडो बंद कर दी गई। आप पुनः प्रयास कर सकते हैं या ईमेल/पासवर्ड या फोन से साइन इन कर सकते हैं।'
            : language === 'mr'
            ? 'साइन-इन विंडो बंद केली गेली. आपण पुन्हा प्रयत्न करू शकता किंवा ईमेल/फोनने लॉगिन करू शकता.'
            : 'Google sign-in popup was closed before completing. You can try again, or sign in using Email or Phone OTP below.'
        );
      } else if (err?.code === 'auth/popup-blocked' || (err?.message && err.message.includes('popup-blocked'))) {
        console.warn('Google Sign-In popup blocked by browser.');
        setErrorMessage(
          language === 'hi'
            ? 'ब्राउज़र द्वारा पॉपअप ब्लॉक कर दिया गया था। कृपया पॉपअप की अनुमति दें या नीचे ईमेल का उपयोग करें।'
            : language === 'mr'
            ? 'ब्राउझरद्वारे पॉपअप ब्लॉक केले गेले होते. कृपया पॉपअपला अनुमती द्या किंवा खाली ईमेल वापरा.'
            : 'Sign-in popup was blocked by your browser. Please allow popups or use Email/Phone below.'
        );
      } else if (err?.code === 'auth/unauthorized-domain' || (err?.message && err.message.includes('unauthorized-domain'))) {
        console.warn(`Firebase Auth unauthorized domain: ${currentHost}`);
        setErrorMessage(
          language === 'hi'
            ? `Google साइन-इन इस डोमेन (${currentHost}) के लिए अधिकृत नहीं है। कृपया Firebase Console → Authentication → Settings → Authorized domains में '${currentHost}' जोड़ें। आप नीचे ईमेल या फोन OTP से साइन इन कर सकते हैं।`
            : language === 'mr'
            ? `Google लॉगिन या डोमेनसाठी (${currentHost}) अधिकृत नाही. कृपया Firebase Console → Authentication → Settings → Authorized domains मध्ये '${currentHost}' जोडा. आपण खाली ईमेल किंवा फोन OTP ने लॉगिन करू शकता.`
            : `Google Sign-In is not yet authorized for this domain (${currentHost}). To enable Google login here, add '${currentHost}' in Firebase Console → Authentication → Settings → Authorized domains. You can also sign in with Email & Password or Phone OTP below.`
        );
      } else {
        console.warn('Google Sign-In notice:', err?.code || err?.message || err);
        setErrorMessage(
          language === 'hi'
            ? 'Google साइन इन पूरा नहीं हो सका। कृपया पुनः प्रयास करें या ईमेल / फोन का उपयोग करें।'
            : language === 'mr'
            ? 'Google साइन इन पूर्ण होऊ शकले नाही. कृपया पुन्हा प्रयत्न करा किंवा ईमेल / फोन वापरा.'
            : (err?.message || 'Google Sign-In could not be completed. Please try again or use Email / Phone below.')
        );
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // ==========================================
  // 2. EMAIL & PASSWORD: REGISTER
  // ==========================================
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regFirstName.trim()) {
      setErrorMessage(language === 'hi' ? 'कृपया अपना पहला नाम दर्ज करें।' : 'Please enter your first name.');
      return;
    }
    if (!regLastName.trim()) {
      setErrorMessage(language === 'hi' ? 'कृपया अपना उपनाम दर्ज करें।' : 'Please enter your last name.');
      return;
    }
    const cleanEmail = regEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage(language === 'hi' ? 'कृपया वैध ईमेल पता दर्ज करें।' : 'Please enter a valid email address.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage(
        language === 'hi'
          ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।'
          : 'Password must be at least 6 characters long for Firebase Auth.'
      );
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage(language === 'hi' ? 'पासवर्ड मेल नहीं खा रहे हैं।' : 'Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const profile = await registerWithEmailPassword(cleanEmail, regPassword, {
        firstName: regFirstName.trim(),
        lastName: regLastName.trim(),
        phone: regPhone.trim(),
        farmName: regFarmName.trim() || `${regFirstName.trim()}'s Livestock Farm`,
        farmLocation: regFarmLocation.trim() || 'Maharashtra, India',
        preferredLanguage: language
      });

      setSuccessMessage(
        language === 'hi'
          ? 'खाता सफलतापूर्वक बनाया गया! साइन इन हो रहा है...'
          : 'Farmer account registered successfully in Firebase!'
      );
      setTimeout(() => {
        onSuccess(profile);
        onClose();
      }, 600);
    } catch (err: any) {
      console.warn('Firebase Registration notice:', err?.code || err?.message || err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMessage(
          language === 'hi'
            ? 'यह ईमेल पहले से पंजीकृत है। कृपया साइन इन करें।'
            : 'This email is already registered. Please sign in instead.'
        );
      } else if (err.code === 'auth/weak-password') {
        setErrorMessage('Password is too weak. Please use at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMessage('Invalid email format.');
      } else {
        setErrorMessage(err.message || 'Failed to create account via Firebase Auth.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 3. EMAIL & PASSWORD: SIGN IN
  // ==========================================
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const email = signInEmail.trim().toLowerCase();
    if (!email) {
      setErrorMessage(language === 'hi' ? 'कृपया ईमेल पता दर्ज करें।' : 'Please enter your email address.');
      return;
    }
    if (!signInPassword) {
      setErrorMessage(language === 'hi' ? 'कृपया पासवर्ड दर्ज करें।' : 'Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const profile = await signInWithEmailPassword(email, signInPassword);
      setSuccessMessage(language === 'hi' ? 'साइन इन सफल!' : 'Signed in successfully!');
      setTimeout(() => {
        onSuccess(profile);
        onClose();
      }, 500);
    } catch (err: any) {
      console.warn('Firebase Sign-In notice:', err?.code || err?.message || err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setErrorMessage(
          language === 'hi'
            ? 'अमान्य ईमेल या पासवर्ड। कृपया पुनः जांचें।'
            : 'Invalid email or password. Please try again or create an account.'
        );
      } else if (err.code === 'auth/wrong-password') {
        setErrorMessage('Incorrect password. Please verify or use Forgot Password.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMessage('Too many failed attempts. Please reset your password or try again later.');
      } else {
        setErrorMessage(err.message || 'Failed to sign in. Please verify your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 4. FORGOT PASSWORD
  // ==========================================
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const email = forgotEmail.trim().toLowerCase();
    if (!email || !email.includes('@') || !email.includes('.')) {
      setErrorMessage(language === 'hi' ? 'कृपया वैध ईमेल दर्ज करें।' : 'Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      await sendPasswordReset(email);
      setSuccessMessage(
        language === 'hi'
          ? `पासवर्ड रीसेट लिंक ${email} पर भेज दी गई है। कृपया अपना ईमेल इनबॉक्स देखें!`
          : `Password reset link sent to ${email}. Please check your inbox or spam folder!`
      );
    } catch (err: any) {
      console.warn('Password Reset notice:', err?.code || err?.message || err);
      if (err.code === 'auth/user-not-found') {
        setErrorMessage('No user found with this email address.');
      } else {
        setErrorMessage(err.message || 'Failed to send reset link via Firebase.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 5. PHONE AUTH: SEND OTP
  // ==========================================
  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      setErrorMessage(
        language === 'hi'
          ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।'
          : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    const fullPhoneNumber = `${phoneCountryCode}${cleanNumber.slice(-10)}`;
    setIsLoading(true);

    try {
      const appVerifier = setupPhoneRecaptcha('recaptcha-container');
      const confirmation = await sendPhoneOtp(fullPhoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setPhoneStep('enter_otp');
      setSuccessMessage(
        language === 'hi'
          ? `ओटीपी कोड ${fullPhoneNumber} पर भेजा गया है!`
          : `SMS verification code sent to ${fullPhoneNumber}!`
      );
    } catch (err: any) {
      console.warn('Phone Auth OTP notice:', err?.code || err?.message || err);
      if (err.code === 'auth/invalid-phone-number') {
        setErrorMessage('Invalid phone number format. Please check the country code and number.');
      } else if (err.code === 'auth/quota-exceeded') {
        setErrorMessage('SMS quota exceeded for this project. Please try Google Sign-in or Email/Password.');
      } else {
        setErrorMessage(
          err.message || 'Failed to send SMS code. Make sure Phone provider is enabled in Firebase Console.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 6. PHONE AUTH: CONFIRM OTP
  // ==========================================
  const handleConfirmPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!confirmationResult) {
      setErrorMessage('Verification session expired. Please request a new code.');
      setPhoneStep('enter_phone');
      return;
    }

    const cleanOtp = otpCode.trim();
    if (cleanOtp.length < 6) {
      setErrorMessage('Please enter the 6-digit OTP code received via SMS.');
      return;
    }

    setIsLoading(true);

    try {
      const profile = await confirmPhoneOtp(confirmationResult, cleanOtp, {
        name: phoneFarmerName.trim() || undefined,
        phone: `${phoneCountryCode}${phoneNumber.replace(/\D/g, '').slice(-10)}`,
        preferredLanguage: language
      });

      setSuccessMessage(
        language === 'hi' ? 'फोन सत्यापन सफल! साइन इन हो गया।' : 'Phone verified successfully! Signing in...'
      );
      setTimeout(() => {
        onSuccess(profile);
        onClose();
      }, 500);
    } catch (err: any) {
      console.warn('Confirm Phone OTP notice:', err?.code || err?.message || err);
      if (err.code === 'auth/invalid-verification-code') {
        setErrorMessage('Invalid verification code. Please check your SMS and try again.');
      } else if (err.code === 'auth/code-expired') {
        setErrorMessage('Verification code has expired. Please request a new one.');
      } else {
        setErrorMessage(err.message || 'Verification failed. Please check the code.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      {/* Hidden reCAPTCHA container for Phone Auth */}
      <div id="recaptcha-container"></div>

      <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-stone-900">
                {authMethod === 'phone'
                  ? 'Phone Authentication'
                  : activeTab === 'register'
                  ? t('authSignUpTitle')
                  : activeTab === 'signin'
                  ? t('authSignInTitle')
                  : t('authResetPasswordTitle')}
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-wide uppercase bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                Firebase
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {authMethod === 'phone'
                ? 'Sign in instantly using SMS verification code'
                : activeTab === 'register'
                ? 'Create a secure farmer account backed by Firebase & Firestore'
                : activeTab === 'signin'
                ? 'Sign in to access your livestock, health reports & real-time data'
                : t('authResetPasswordSubtitle')}
            </p>
          </div>
          <button
            id="close-auth-modal-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
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

          {/* 1. GOOGLE SIGN-IN BUTTON */}
          <button
            id="google-signin-btn"
            type="button"
            disabled={isGoogleLoading || isLoading}
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2.5 disabled:opacity-60 active:scale-[0.99]"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
            ) : (
              <div className="w-4 h-4 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center">
                G
              </div>
            )}
            <span>{t('authGoogle')}</span>
          </button>

          {/* OR DIVIDER */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-stone-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              {t('authOrDivider')}
            </span>
            <div className="border-t border-stone-200 w-full"></div>
          </div>

          {/* AUTH METHOD SELECTOR: Email/Password vs Phone (SMS) */}
          <div className="flex p-1 bg-stone-100 rounded-xl">
            <button
              id="auth-method-email-btn"
              type="button"
              onClick={() => {
                setAuthMethod('email');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                authMethod === 'email'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email & Password</span>
            </button>
            <button
              id="auth-method-phone-btn"
              type="button"
              onClick={() => {
                setAuthMethod('phone');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                authMethod === 'phone'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Phone SMS (OTP)</span>
            </button>
          </div>

          {/* ========================================================= */}
          {/* SECTION A: PHONE AUTHENTICATION WITH FIREBASE */}
          {/* ========================================================= */}
          {authMethod === 'phone' && (
            <div className="space-y-4">
              {phoneStep === 'enter_phone' ? (
                <form id="phone-auth-send-form" onSubmit={handleSendPhoneOtp} className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
                    <Smartphone className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Firebase Phone Authentication</p>
                      <p className="text-[11px] text-emerald-800">
                        Enter your mobile phone number. A secure 6-digit SMS verification code will be sent to your device.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Farmer Full Name (Optional)
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="phone-farmer-name-input"
                        type="text"
                        placeholder="e.g. Ramesh Patil"
                        value={phoneFarmerName}
                        onChange={(e) => setPhoneFarmerName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {language === 'hi' ? 'मोबाइल नंबर' : 'Mobile Phone Number'} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={phoneCountryCode}
                        onChange={(e) => setPhoneCountryCode(e.target.value)}
                        className="px-2.5 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 bg-stone-50 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      >
                        <option value="+91">🇮🇳 +91 (India)</option>
                        <option value="+1">🇺🇸 +1 (US)</option>
                        <option value="+44">🇬🇧 +44 (UK)</option>
                        <option value="+880">🇧🇩 +880 (BD)</option>
                        <option value="+977">🇳🇵 +977 (NP)</option>
                      </select>
                      <div className="relative flex-1">
                        <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="phone-number-input"
                          type="tel"
                          required
                          placeholder="98765 43210"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono tracking-wider"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1">
                      {language === 'hi'
                        ? 'हम आपको Firebase प्रमाणीकरण द्वारा एकमुश्त पासवर्ड (OTP) भेजेंगे।'
                        : 'Firebase will deliver an SMS OTP to verify your account.'}
                    </p>
                  </div>

                  <button
                    id="submit-send-otp-btn"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending SMS OTP...</span>
                      </>
                    ) : (
                      <>
                        <Phone className="w-4 h-4" />
                        <span>{t('authSendOtp')}</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form id="phone-auth-verify-form" onSubmit={handleConfirmPhoneOtp} className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Enter SMS Code</p>
                      <p className="text-[11px] text-amber-800">
                        Enter the 6-digit code sent to {phoneCountryCode} {phoneNumber}.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('authEnterOtp')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="phone-otp-input"
                        type="text"
                        required
                        maxLength={6}
                        autoFocus
                        placeholder="Enter 6-digit code"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-9 pr-3 py-2.5 text-center text-lg font-mono font-black tracking-widest rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <button
                    id="submit-verify-otp-btn"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t('authVerifyOtp')}</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setPhoneStep('enter_phone');
                        setErrorMessage(null);
                        setOtpCode('');
                      }}
                      className="text-stone-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Change Phone Number</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSendPhoneOtp}
                      disabled={isLoading}
                      className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION B: EMAIL & PASSWORD AUTHENTICATION */}
          {/* ========================================================= */}
          {authMethod === 'email' && (
            <div className="space-y-4">
              {/* Tab Switcher: Register vs Sign In */}
              {activeTab !== 'forgot_password' ? (
                <div className="flex p-1 bg-stone-100 rounded-xl">
                  <button
                    id="tab-register-btn"
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className={`flex-1 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition ${
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
                      setSuccessMessage(null);
                    }}
                    className={`flex-1 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition ${
                      activeTab === 'signin'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {t('authTabSignIn')}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between py-0.5">
                  <button
                    type="button"
                    id="header-back-to-signin-btn"
                    onClick={() => {
                      setActiveTab('signin');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-bold transition hover:underline"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{t('authBackToSignIn')}</span>
                  </button>
                  <span className="text-[11px] text-stone-400 font-medium">Firebase Authentication</span>
                </div>
              )}

              {/* B1: CREATE ACCOUNT FORM */}
              {activeTab === 'register' && (
                <form id="register-form" onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="reg-email-input"
                        type="email"
                        required
                        placeholder="farmer@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Mobile Phone (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="reg-phone-input"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                          placeholder="Min 6 characters"
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
                        placeholder="Re-type password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {t('authFarmName')}
                      </label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="reg-farm-name-input"
                          type="text"
                          placeholder="e.g. Patil Dairy Farm"
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
                      <input
                        id="reg-farm-loc-input"
                        type="text"
                        placeholder="e.g. Nashik, Maharashtra"
                        value={regFarmLocation}
                        onChange={(e) => setRegFarmLocation(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <button
                    id="submit-register-btn"
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating Firebase Account...</span>
                      </>
                    ) : (
                      <>
                        <span>{t('authRegisterBtn')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* B2: SIGN IN FORM */}
              {activeTab === 'signin' && (
                <form id="signin-form" onSubmit={handleSignInSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="signin-email-input"
                        type="email"
                        required
                        placeholder="farmer@example.com"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-stone-700">
                        {t('authPassword')} <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        id="forgot-password-link-btn"
                        onClick={() => {
                          setActiveTab('forgot_password');
                          setErrorMessage(null);
                          setSuccessMessage(null);
                          if (signInEmail.includes('@')) {
                            setForgotEmail(signInEmail.trim());
                          }
                        }}
                        className="text-xs text-emerald-700 hover:text-emerald-800 font-bold hover:underline transition"
                      >
                        {t('authForgotPassword')}
                      </button>
                    </div>
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

                  <button
                    id="submit-signin-btn"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing in with Firebase...</span>
                      </>
                    ) : (
                      <>
                        <span>{t('authSignInBtn')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* B3: FORGOT PASSWORD FORM */}
              {activeTab === 'forgot_password' && (
                <form id="forgot-password-form" onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-800 flex-shrink-0">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-amber-950">
                        {t('authResetPasswordTitle')}
                      </p>
                      <p className="text-amber-800 leading-relaxed text-[11.5px]">
                        {t('authResetPasswordSubtitle')}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Registered Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="forgot-password-email-input"
                        type="email"
                        required
                        autoFocus
                        placeholder="farmer@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <button
                    id="submit-forgot-password-btn"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Reset Link...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>{t('authSendResetLink')}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
