import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  User,
  ExternalLink,
  ChevronRight,
  Stethoscope,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Language, UserProfile } from '../types';

interface GoogleConsentModalProps {
  isOpen: boolean;
  googleUser: {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL?: string | null;
    phoneNumber?: string | null;
  } | null;
  language: Language;
  onAgreeAndContinue: (userProfile?: UserProfile) => void;
  onCancelOrSwitchAccount: () => void;
  onOpenPrivacy?: () => void;
}

export const GoogleConsentModal: React.FC<GoogleConsentModalProps> = ({
  isOpen,
  googleUser,
  language,
  onAgreeAndContinue,
  onCancelOrSwitchAccount,
  onOpenPrivacy,
}) => {
  const [hasConfirmedCheckbox, setHasConfirmedCheckbox] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setIsProcessing(false);
      // Auto-scroll to top when opened
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isHindi = language === 'hi';
  const isMarathi = language === 'mr';

  const userDisplayName = googleUser?.displayName || googleUser?.email?.split('@')[0] || 'Farmer / पशुपालक';
  const userEmail = googleUser?.email || 'farmer@pashucare.ai';

  const handleAgree = async () => {
    if (!hasConfirmedCheckbox || isProcessing) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (googleUser) {
        const profile: UserProfile = {
          id: googleUser.uid,
          name: userDisplayName,
          email: userEmail,
          phone: googleUser.phoneNumber || '',
          preferredLanguage: language,
          farmName: 'My Dairy & Livestock Farm',
          farmLocation: 'Maharashtra, India',
          role: 'farmer',
          createdAt: new Date().toISOString(),
          photoUrl: googleUser.photoURL || undefined,
        };
        await onAgreeAndContinue(profile);
      } else {
        // Will initiate Google sign in & consent in App.tsx
        await onAgreeAndContinue();
      }
    } catch (err: any) {
      console.error('Consent & authorization error:', err);
      setErrorMessage(err.message || 'Authorization could not be completed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="data-sharing-consent-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="data-sharing-consent-heading"
    >
      <div
        id="data-sharing-consent-card"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden text-stone-900 animate-scaleUp"
      >
        {/* Sticky/Fixed Header: Google & PashuCare AI Branding */}
        <div className="shrink-0 bg-gradient-to-r from-stone-900 via-stone-800 to-emerald-950 p-4 sm:p-5 text-white border-b border-stone-800">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Google G Logo */}
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md shrink-0">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              </div>

              <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0" />

              {/* PashuCare AI Logo Badge */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
                  P
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white tracking-tight leading-none">PashuCare AI</h3>
                  <p className="text-[10px] text-emerald-300 leading-none mt-0.5">Livestock Health Assistant</p>
                </div>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1 shrink-0">
              <Lock className="w-3 h-3" />
              <span>OAuth 2.0 Verified</span>
            </span>
          </div>

          <div className="mt-3.5">
            <h2 id="data-sharing-consent-heading" className="text-base sm:text-lg font-black text-white leading-tight">
              {isHindi
                ? 'Data Sharing & Account Access (डेटा साझाकरण व खाता अनुमति)'
                : isMarathi
                ? 'Data Sharing & Account Access (डेटा शेअरिंग आणि खाते संमती)'
                : 'Data Sharing & Account Access'}
            </h2>
            <p className="text-xs text-stone-300 mt-1 font-medium leading-normal">
              {isHindi
                ? 'पशु स्वास्थ्य सेवा और निदान शुरू करने से पहले डेटा साझा करने की पुष्टि करें'
                : isMarathi
                ? 'पशुवैद्यकीय निदान आणि आरोग्य सेवेसाठी डेटा शेअर करण्याची पुष्टी करा'
                : 'Review what data will be accessed & shared with PashuCare AI before continuing'}
            </p>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {/* Active Account Identity Card */}
          {googleUser ? (
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {googleUser.photoURL ? (
                  <img
                    src={googleUser.photoURL}
                    alt={userDisplayName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">
                    {userDisplayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-stone-900 text-sm truncate">{userDisplayName}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  </div>
                  <div className="text-xs text-stone-600 truncate">{userEmail}</div>
                </div>
              </div>

              <button
                type="button"
                id="consent-switch-account-btn"
                onClick={onCancelOrSwitchAccount}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-bold underline shrink-0 cursor-pointer"
              >
                {isHindi ? 'खाता बदलें' : isMarathi ? 'खाते बदला' : 'Switch'}
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-stone-900 text-sm">
                  {isHindi ? 'Google खाता प्रमाणीकरण' : 'Google Account Authorization'}
                </div>
                <div className="text-xs text-stone-600">
                  {isHindi
                    ? 'जारी रखने पर आपके Google खाते से लॉगिन पुष्टि की जाएगी'
                    : 'You will sign in and link your Google profile on continue'}
                </div>
              </div>
            </div>
          )}

          {/* Primary Statement Box */}
          <div className="p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200 space-y-1">
            <div className="flex items-start gap-2 text-emerald-950 font-bold text-xs sm:text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                {isHindi
                  ? 'तुम इस Google खाते से PashuCare AI के साथ अपना डेटा साझा कर रहे हो'
                  : isMarathi
                  ? 'तुम्ही या Google खात्यावरून PashuCare AI सह तुमचा डेटा शेअर करत आहात'
                  : 'You are sharing your account data with PashuCare AI'}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-800/90 pl-6 leading-relaxed">
              {isHindi
                ? 'यह आपके पशुओं के स्वास्थ्य रिकॉर्ड को सुरक्षित रखने, एआई लक्षण निदान और आपातकालीन सहायता प्रदान करने के लिए आवश्यक है।'
                : isMarathi
                ? 'हे आपल्या जनावरांचे आरोग्य रेकॉर्ड सुरक्षित ठेवण्यासाठी आणि अचूक AI सल्ला देण्यासाठी आवश्यक आहे.'
                : 'Required to securely store livestock health records, run Gemini AI vision diagnostics, and enable 1962 tele-triage.'}
            </p>
          </div>

          {/* Permissions & Data Items Explanation */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {isHindi ? 'उपयोग और साझा किया जाने वाला डेटा:' : isMarathi ? 'शेअर केलेला डेटा:' : 'Data & Permissions Accessed:'}
            </h4>

            <div className="space-y-2 text-xs">
              {/* Item 1: Profile & Identity */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-stone-50 border border-stone-200/80">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-stone-900">
                    {isHindi ? '1. खाता पहचान व किसान प्रोफ़ाइल' : isMarathi ? '1. खाते ओळख आणि शेतकरी प्रोफाइल' : '1. Profile & Account Identity'}
                  </div>
                  <div className="text-[11px] text-stone-600 leading-normal">
                    {isHindi
                      ? 'नाम, ईमेल पता, अवतार और भाषा प्राथमिकता ताकि आपका डेटा सुरक्षित जुड़ा रहे।'
                      : 'Name, email address, profile photo, and regional language preference.'}
                  </div>
                </div>
              </div>

              {/* Item 2: Livestock Health Records */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-stone-50 border border-stone-200/80">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Stethoscope className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-stone-900">
                    {isHindi ? '2. पशु स्वास्थ्य, फोटो स्कैन व AI निदान' : isMarathi ? '2. पशु आरोग्य, फोटो स्कॅन आणि AI निदान' : '2. Livestock Health Records & AI Vision Scans'}
                  </div>
                  <div className="text-[11px] text-stone-600 leading-normal">
                    {isHindi
                      ? 'घाव, त्वचा, खुर व मुँह के फोटो, एआई बीमारी रिपोर्ट और टीकाकरण शेड्यूलर।'
                      : 'Symptom photos, AI condition reports, vaccination schedules, and herd tag records.'}
                  </div>
                </div>
              </div>

              {/* Item 3: Vet Helpline */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-stone-50 border border-stone-200/80">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-stone-900">
                    {isHindi ? '3. आपातकालीन पशु चिकित्सालय 1962 समन्वय' : isMarathi ? '3. आपत्कालीन पशुवैद्यकीय मदत 1962' : '3. Emergency 1962 Helpline & Tele-triage'}
                  </div>
                  <div className="text-[11px] text-stone-600 leading-normal">
                    {isHindi
                      ? 'गंभीर स्थिति में सरकारी 1962 एम्बुलेंस सेवा और नजदीकी डॉक्टर संपर्क।'
                      : 'Direct connectivity to National 1962 Helpline and nearby veterinary clinics.'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Cloud Storage Guarantee */}
          <div className="p-3 rounded-xl bg-stone-100/80 border border-stone-200 text-[11px] text-stone-600 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-stone-800">
              <Lock className="w-3 h-3 text-stone-600 shrink-0" />
              <span>{isHindi ? 'सुरक्षित एवं एन्क्रिप्टेड स्टोरेज' : 'Encrypted & Private Cloud'}</span>
            </div>
            <p className="leading-normal">
              {isHindi
                ? 'आपका डेटा Google Cloud Firestore में एंड-टू-एंड एन्क्रिप्टेड है। PashuCare AI आपकी जानकारी किसी तीसरे पक्ष या विज्ञापनदाता को कभी नहीं बेचता है।'
                : isMarathi
                ? 'तुमचा डेटा Google Cloud Firestore मध्ये सुरक्षित असून कोणत्याही तृतीय पक्षाला विकला जात नाही.'
                : 'Your data is secured in Google Cloud Firestore. PashuCare AI never sells personal information to third parties.'}
            </p>
            {onOpenPrivacy && (
              <button
                type="button"
                id="consent-open-privacy-link"
                onClick={onOpenPrivacy}
                className="text-emerald-700 hover:text-emerald-800 font-semibold underline inline-flex items-center gap-1 mt-0.5 cursor-pointer"
              >
                <span>{isHindi ? 'गोपनीयता नीति व चिकित्सा चार्टर पढ़ें' : 'Read Privacy & Medical Charter'}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Explicit Confirmation Checkbox */}
          <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none bg-stone-50 p-2.5 rounded-xl border border-stone-200">
            <input
              type="checkbox"
              id="agree-data-sharing-checkbox"
              checked={hasConfirmedCheckbox}
              onChange={(e) => setHasConfirmedCheckbox(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300 cursor-pointer shrink-0"
            />
            <span className="text-xs text-stone-800 font-medium leading-relaxed">
              {isHindi
                ? 'मैं इस खाते से डेटा साझा करने और PashuCare AI के नियमों व शर्तों से पूर्णतः सहमत हूँ।'
                : isMarathi
                ? 'मी या खात्यावरून डेटा शेअर करण्यास आणि PashuCare AI च्या अटींशी पूर्णतः सहमत आहे.'
                : 'I explicitly agree to share data with PashuCare AI and accept the Terms of Service.'}
            </span>
          </label>

          {/* Error Message if any */}
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Fixed/Sticky Bottom Action Bar with Prominent "Agree and Continue" Button */}
        <div
          id="data-sharing-consent-sticky-footer"
          className="shrink-0 sticky bottom-0 bg-stone-50 border-t border-stone-200 p-3.5 sm:p-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 shadow-md"
        >
          <button
            type="button"
            id="data-sharing-consent-cancel-btn"
            onClick={onCancelOrSwitchAccount}
            disabled={isProcessing}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 disabled:opacity-50 text-stone-700 text-xs sm:text-sm font-bold transition active:scale-95 cursor-pointer text-center"
          >
            {isHindi ? 'रद्द करें / वापस' : isMarathi ? 'रद्द करा / मागे' : 'Cancel / Back'}
          </button>

          <button
            type="button"
            id="agree-and-continue-btn"
            onClick={handleAgree}
            disabled={!hasConfirmedCheckbox || isProcessing}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-sm text-white shadow-lg transition active:scale-95 cursor-pointer ${
              !hasConfirmedCheckbox || isProcessing
                ? 'bg-stone-400 opacity-60 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-700/30'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{isHindi ? 'सत्यापित हो रहा है...' : 'Authorizing...'}</span>
              </>
            ) : (
              <>
                <span>
                  {isHindi
                    ? 'Agree and Continue (सहमति दें और आगे बढ़ें)'
                    : isMarathi
                    ? 'Agree and Continue (संमती द्या आणि पुढे चला)'
                    : 'Agree and Continue'}
                </span>
                <ArrowRight className="w-4 h-4 text-white shrink-0" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

