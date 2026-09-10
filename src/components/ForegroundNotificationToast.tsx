import React, { useEffect } from 'react';
import { Bell, Syringe, Stethoscope, X, ExternalLink } from 'lucide-react';
import { PushNotificationItem, Language } from '../types';

interface ForegroundNotificationToastProps {
  notification: PushNotificationItem | null;
  onDismiss: () => void;
  onNavigateTab: (tabId: string) => void;
  language: Language;
}

export const ForegroundNotificationToast: React.FC<ForegroundNotificationToastProps> = ({
  notification,
  onDismiss,
  onNavigateTab,
  language
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 7000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const isVaccine = notification.category === 'vaccination';
  const isUrgentVet = notification.category === 'vet_response' || notification.urgent;

  return (
    <div className="fixed top-20 right-4 left-4 sm:left-auto sm:max-w-md z-50 animate-in slide-in-from-top duration-300">
      <div className={`p-4 rounded-2xl shadow-xl border backdrop-blur-md flex items-start gap-3 text-stone-900 ${
        isUrgentVet 
          ? 'bg-red-50/95 border-red-300 ring-2 ring-red-400' 
          : isVaccine
          ? 'bg-amber-50/95 border-amber-300'
          : 'bg-emerald-50/95 border-emerald-300'
      }`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs ${
          isUrgentVet ? 'bg-red-600 animate-bounce' : isVaccine ? 'bg-amber-600' : 'bg-emerald-700'
        }`}>
          {isUrgentVet ? (
            <Stethoscope className="w-5 h-5" />
          ) : isVaccine ? (
            <Syringe className="w-5 h-5" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-extrabold text-xs sm:text-sm text-stone-900">
              {notification.title}
            </h4>
            {isUrgentVet && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-red-200 text-red-800 uppercase">
                {language === 'hi' ? 'तत्काल' : language === 'mr' ? 'तातडीचे' : 'Urgent'}
              </span>
            )}
          </div>
          <p className="text-xs text-stone-700 mt-1 leading-snug">
            {notification.body}
          </p>

          <div className="mt-2.5 flex items-center gap-3">
            <button
              onClick={() => {
                onNavigateTab(isVaccine ? 'reminders' : 'vet');
                onDismiss();
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                isUrgentVet
                  ? 'bg-red-700 text-white hover:bg-red-800 shadow-2xs'
                  : 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-2xs'
              }`}
            >
              <span>{isVaccine ? (language === 'hi' ? 'अनुस्मारक खोलें' : language === 'mr' ? 'स्मरणपत्र उघडा' : 'Open Reminder') : (language === 'hi' ? 'सलाह देखें' : language === 'mr' ? 'सल्ला पहा' : 'View Advice')}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={onDismiss}
              className="text-stone-500 hover:text-stone-800 text-xs font-semibold cursor-pointer"
            >
              {language === 'hi' ? 'खारिज करें' : language === 'mr' ? 'रद्द करा' : 'Dismiss'}
            </button>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-stone-400 hover:text-stone-700 p-1 transition cursor-pointer"
          aria-label="Close toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
