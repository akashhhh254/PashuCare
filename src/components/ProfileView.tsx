import React from 'react';
import {
  User,
  Phone,
  MapPin,
  Shield,
  LogOut,
  LogIn,
  Languages,
  HeartPulse,
  Users,
  Calendar,
  PhoneCall,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Award,
  ChevronRight,
  Info
} from 'lucide-react';
import { AnimalProfile, HealthReport, Language, Reminder, UserProfile } from '../types';
import { translations, getTranslation } from '../i18n/translations';

interface ProfileViewProps {
  user: UserProfile | null;
  animals: AnimalProfile[];
  reports: HealthReport[];
  reminders: Reminder[];
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenAuth: (tab?: 'signin' | 'register') => void;
  onSignOut: () => void;
  onOpenPrivacy: () => void;
  onNavigate: (tab: string) => void;
  onClearCache: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  animals,
  reports,
  reminders,
  language,
  onLanguageChange,
  onOpenAuth,
  onSignOut,
  onOpenPrivacy,
  onNavigate,
  onClearCache
}) => {
  const t = (key: keyof typeof translations['en']) => getTranslation(language, key);

  const healthyCount = animals.filter((a) => a.status === 'Healthy').length;
  const underObsCount = animals.filter((a) => a.status === 'Under Observation').length;
  const criticalCount = animals.filter((a) => a.status === 'Critical').length;
  const pendingReminders = reminders.filter((r) => !r.completed).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Profile Header Card */}
      <div className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-700 text-white flex items-center justify-center text-2xl sm:text-3xl font-black shadow-md border-2 border-emerald-600 overflow-hidden">
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : user?.name ? (
                user.name.charAt(0).toUpperCase()
              ) : (
                <User className="w-8 h-8 sm:w-10 sm:h-10" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-stone-900">
                  {user?.name || 'Guest Farmer'}
                </h1>
                {user?.role === 'admin' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Admin
                  </span>
                ) : user ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Verified Farmer
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-600">
                    Not Signed In
                  </span>
                )}
              </div>

              <p className="text-stone-600 text-sm font-medium mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>{user ? user.farmName : 'Guest Farmer'}</span>
                <span>•</span>
                <span>{user ? user.farmLocation : 'India'}</span>
              </p>

              {(user?.phone || user?.email) && (
                <p className="text-stone-500 text-xs mt-1 flex items-center gap-2">
                  {user.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-stone-400" />
                      <span>{user.phone}</span>
                    </span>
                  )}
                  {user.phone && user.email && <span>•</span>}
                  {user.email && (
                    <span className="truncate">{user.email}</span>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {user ? (
              <button
                onClick={onSignOut}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold transition"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('navSignOut')}</span>
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={() => onOpenAuth('register')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-emerald-700 text-emerald-800 hover:bg-emerald-50 text-xs sm:text-sm font-bold shadow-2xs transition"
                >
                  <span>{t('authTabRegister')}</span>
                </button>
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-xs transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t('navSignIn')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Livestock Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => onNavigate('animals')}
          className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-emerald-300 transition text-left shadow-2xs group"
        >
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <Users className="w-5 h-5" />
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
          </div>
          <p className="text-2xl font-black text-stone-900">{animals.length}</p>
          <p className="text-xs text-stone-500 font-medium">Total Registered</p>
        </button>

        <button
          onClick={() => onNavigate('history')}
          className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-emerald-300 transition text-left shadow-2xs group"
        >
          <div className="flex items-center justify-between text-teal-700 mb-2">
            <HeartPulse className="w-5 h-5" />
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
          </div>
          <p className="text-2xl font-black text-stone-900">{reports.length}</p>
          <p className="text-xs text-stone-500 font-medium">AI Health Checks</p>
        </button>

        <button
          onClick={() => onNavigate('animals')}
          className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-emerald-300 transition text-left shadow-2xs group"
        >
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <Sparkles className="w-5 h-5" />
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
          </div>
          <p className="text-2xl font-black text-stone-900">{healthyCount}</p>
          <p className="text-xs text-stone-500 font-medium">Healthy Animals</p>
        </button>

        <button
          onClick={() => onNavigate('reminders')}
          className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-emerald-300 transition text-left shadow-2xs group"
        >
          <div className="flex items-center justify-between text-blue-700 mb-2">
            <Calendar className="w-5 h-5" />
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
          </div>
          <p className="text-2xl font-black text-stone-900">{pendingReminders}</p>
          <p className="text-xs text-stone-500 font-medium">Pending Vaccines</p>
        </button>
      </div>

      {/* App Settings & Language Selection */}
      <div className="rounded-3xl bg-white border border-stone-200 p-6 space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
          <Languages className="w-4 h-4 text-emerald-700" />
          <span>Language Preference / भाषा निवडा</span>
        </h2>
        
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onLanguageChange('en')}
            className={`p-3 rounded-xl border text-center font-bold text-sm transition ${
              language === 'en'
                ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-2xs'
                : 'border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            English
          </button>
          <button
            onClick={() => onLanguageChange('hi')}
            className={`p-3 rounded-xl border text-center font-bold text-sm transition ${
              language === 'hi'
                ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-2xs'
                : 'border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            हिंदी (Hindi)
          </button>
          <button
            onClick={() => onLanguageChange('mr')}
            className={`p-3 rounded-xl border text-center font-bold text-sm transition ${
              language === 'mr'
                ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-2xs'
                : 'border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            मराठी (Marathi)
          </button>
        </div>
      </div>

      {/* Emergency Veterinary Contact Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-red-900 to-rose-950 text-white p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-red-800/80 border border-red-600/60 text-red-200 text-xs font-bold uppercase tracking-wider">
            <span>24x7 Government Helpline</span>
          </div>
          <h3 className="text-lg font-black">National Animal Emergency (1962)</h3>
          <p className="text-xs text-red-100 max-w-md">
            Immediate dispatch assistance for critical livestock emergencies, epidemic alerts, and ambulance dispatch across districts.
          </p>
        </div>
        <a
          href="tel:1962"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-red-700 font-extrabold text-sm hover:bg-red-50 transition shadow-sm shrink-0"
        >
          <PhoneCall className="w-4 h-4 text-red-600" />
          <span>Call 1962 Toll-Free</span>
        </a>
      </div>

      {/* Data Security, Privacy & Diagnostics Charter */}
      <div className="rounded-3xl bg-white border border-stone-200 p-6 space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Medical Boundaries & Data Ownership</span>
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          PashuCare AI provides diagnostic triage support to help dairy farmers detect conditions early. 
          All AI health results are preliminary insights and should be confirmed by a licensed Veterinary Medical Officer.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenPrivacy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition"
          >
            <Info className="w-3.5 h-3.5 text-stone-600" />
            <span>Read Medical Boundaries & Privacy Policy</span>
          </button>

          <button
            onClick={onClearCache}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-800 text-xs font-bold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Local App Cache</span>
          </button>
        </div>
      </div>

    </div>
  );
};
