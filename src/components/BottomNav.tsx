import React from 'react';
import { Home, HeartPulse, Users, Clock, User } from 'lucide-react';
import { Language } from '../types';
import { translations, getTranslation } from '../i18n/translations';

interface BottomNavProps {
  currentTab?: string;
  activeTab?: string;
  setCurrentTab?: (tab: string) => void;
  setActiveTab?: (tab: string) => void;
  language: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  activeTab,
  setCurrentTab,
  setActiveTab,
  language
}) => {
  const effectiveTab = activeTab || currentTab || 'home';
  const t = (key: keyof typeof translations['en']) => getTranslation(language, key);

  const tabs = [
    { id: 'home', label: t('navHome'), icon: Home },
    { id: 'check', label: t('navHealthCheck'), icon: HeartPulse, isPrimary: true },
    { id: 'animals', label: t('navMyAnimals'), icon: Users },
    { id: 'history', label: t('navHistory'), icon: Clock },
    { id: 'profile', label: t('navProfile'), icon: User },
  ];

  const handleTabClick = (tabId: string) => {
    if (setActiveTab) {
      setActiveTab(tabId);
    } else if (setCurrentTab) {
      setCurrentTab(tabId);
    }
  };

  return (
    <div
      id="mobile-bottom-nav"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-2 py-1 shadow-lg pb-safe"
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = effectiveTab === tab.id;

          if (tab.isPrimary) {
            return (
              <button
                key={tab.id}
                id={`bottom-nav-${tab.id}`}
                onClick={() => handleTabClick(tab.id)}
                className="flex flex-col items-center -mt-5 cursor-pointer select-none"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-800 text-white flex items-center justify-center shadow-md active:bg-emerald-900 transition border-2 border-white">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] font-bold text-emerald-900 mt-1">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              id={`bottom-nav-${tab.id}`}
              onClick={() => handleTabClick(tab.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center py-1 px-3 rounded-lg transition cursor-pointer select-none ${
                isActive ? 'text-emerald-900 font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-800' : 'text-stone-500'}`} />
              <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
