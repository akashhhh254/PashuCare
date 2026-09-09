import React, { useState } from 'react';
import {
  Activity,
  HeartPulse,
  BookOpen,
  Calendar,
  Users,
  Shield,
  Languages,
  PhoneCall,
  Menu,
  X,
  User,
  LogOut,
  Info
} from 'lucide-react';
import { Language, UserProfile } from '../types';
import { translations, getTranslation } from '../i18n/translations';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentTab?: string;
  activeTab?: string;
  setCurrentTab?: (tab: string) => void;
  setActiveTab?: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  user: UserProfile | null;
  onOpenAuth: (tab?: 'signin' | 'register') => void;
  onSignOut?: () => void;
  onOpenPrivacy?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  activeTab,
  setCurrentTab,
  setActiveTab,
  language,
  setLanguage,
  user,
  onOpenAuth,
  onSignOut,
  onOpenPrivacy
}) => {
  const effectiveTab = activeTab || currentTab || 'home';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const t = (key: keyof typeof translations['en']) => getTranslation(language, key);

  const navItems = [
    { id: 'home', label: t('navHome'), icon: Activity },
    { id: 'check', label: t('navHealthCheck'), icon: HeartPulse, highlight: true },
    { id: 'animals', label: t('navMyAnimals'), icon: Users },
    { id: 'history', label: t('navHistory'), icon: Activity },
    { id: 'reminders', label: t('navReminders'), icon: Calendar },
    { id: 'vet', label: t('navVeterinarian'), icon: PhoneCall },
    { id: 'diseases', label: t('navDiseases'), icon: BookOpen },
    { id: 'about', label: t('navAbout'), icon: Info },
    ...(user?.role === 'admin' ? [{ id: 'admin', label: t('navAdmin'), icon: Shield }] : [])
  ];

  const handleNavClick = (id: string) => {
    if (id === 'about') {
      if (onOpenPrivacy) {
        onOpenPrivacy();
      }
      setMobileMenuOpen(false);
      return;
    }
    if (setActiveTab) {
      setActiveTab(id);
    } else if (setCurrentTab) {
      setCurrentTab(id);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
      {/* Top emergency & accessibility utility bar */}
      <div className="bg-emerald-800 text-emerald-50 text-xs py-1 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-300" />
              <span>National Animal Helpline: <strong>1962</strong> (Toll-Free 24x7)</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-emerald-100">
            <button
              onClick={onOpenPrivacy}
              className="hover:text-white transition underline cursor-pointer"
            >
              Privacy & Farmers Rights
            </button>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline text-emerald-200">Kisan Call Center: 1800-180-1551</span>
          </div>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Brand */}
          <div
            id="brand-logo-btn"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition">
              <HeartPulse className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-stone-900 tracking-tight">
                  PashuCare <span className="text-emerald-700 font-bold">AI</span>
                </span>
                <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                  Livestock Health
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                {t('appTagline')}
              </p>
            </div>
          </div>

          {/* Desktop Nav Links (Only shown when user is logged in) */}
          {user ? (
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = effectiveTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                      item.highlight
                        ? 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm'
                        : isActive
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${item.highlight ? 'text-white' : isActive ? 'text-emerald-700' : 'text-stone-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          ) : (
            <div className="hidden lg:flex items-center gap-6 text-xs text-stone-600 font-medium">
              <span className="flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <HeartPulse className="w-3.5 h-3.5 text-emerald-700" />
                <span>AI Livestock Diagnostic Platform</span>
              </span>
              <button
                onClick={onOpenPrivacy}
                className="hover:text-emerald-700 transition"
              >
                Medical Charter
              </button>
              <a
                href="tel:1962"
                className="text-red-700 hover:underline font-bold"
              >
                Emergency: 1962
              </a>
            </div>
          )}

          {/* Action Tools: Language, PWA, User */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                id="language-select-btn"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs sm:text-sm font-medium text-stone-700 hover:bg-stone-50 hover:border-stone-400 transition"
              >
                <Languages className="w-4 h-4 text-emerald-700" />
                <span className="uppercase font-bold">{language}</span>
                <span className="hidden sm:inline text-stone-500 text-xs">
                  ({language === 'hi' ? 'हिंदी' : language === 'mr' ? 'मराठी' : 'English'})
                </span>
              </button>

              {langDropdownOpen && (
                <div
                  id="language-dropdown-menu"
                  className="absolute right-0 mt-2 w-44 rounded-xl bg-white p-1.5 shadow-xl border border-stone-200 z-50 text-sm"
                >
                  <button
                    onClick={() => {
                      setLanguage('en');
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                      language === 'en' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>English</span>
                    {language === 'en' && <span className="text-emerald-700 text-xs font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('hi');
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                      language === 'hi' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>हिंदी (Hindi)</span>
                    {language === 'hi' && <span className="text-emerald-700 text-xs font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('mr');
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                      language === 'mr' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>मराठी (Marathi)</span>
                    {language === 'mr' && <span className="text-emerald-700 text-xs font-bold">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* User Account / Sign In */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  id="user-profile-btn"
                  onClick={() => handleNavClick('profile')}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 transition text-stone-800 text-xs sm:text-sm font-semibold"
                  title="Farmer Profile"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold overflow-hidden">
                    {user.photoUrl ? (
                      <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <span className="hidden md:inline max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                </button>
                <button
                  id="sign-out-btn"
                  onClick={onSignOut}
                  className="p-2 text-stone-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                  title={t('navSignOut')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="header-register-btn"
                  onClick={() => onOpenAuth('register')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-700 text-emerald-800 hover:bg-emerald-50 text-xs sm:text-sm font-bold transition"
                >
                  <span>{t('authTabRegister')}</span>
                </button>
                <button
                  id="sign-in-btn"
                  onClick={() => onOpenAuth('signin')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold transition"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{t('navSignIn')}</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-700 hover:bg-stone-100 transition"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          {user ? (
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = effectiveTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold transition ${
                      item.highlight
                        ? 'bg-emerald-700 text-white'
                        : isActive
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3 py-2">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                <p className="font-bold">
                  {language === 'hi' 
                    ? 'पशु स्वास्थ्य जांच के लिए कृपया खाता बनाएं या साइन इन करें।' 
                    : language === 'mr' 
                    ? 'आरोग्य तपासणीसाठी कृपया खाते तयार करा किंवा साइन इन करा.' 
                    : 'Please create an account or sign in to access diagnostic tools.'}
                </p>
              </div>

              <button
                onClick={() => {
                  onOpenAuth('register');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-sm transition"
              >
                <User className="w-4 h-4" />
                <span>{t('authTabRegister')}</span>
              </button>

              <button
                onClick={() => {
                  onOpenAuth('signin');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 font-bold text-sm transition"
              >
                <span>{t('authTabSignIn')}</span>
              </button>
            </div>
          )}

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Helpline: <strong>1962</strong></span>
            <button onClick={onOpenPrivacy} className="underline text-emerald-700">Privacy & Charter</button>
          </div>
        </div>
      )}
    </header>
  );
};
