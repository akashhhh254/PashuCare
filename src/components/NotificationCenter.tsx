import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  Syringe, 
  AlertTriangle, 
  Stethoscope, 
  CheckCircle2, 
  Trash2, 
  Volume2, 
  ExternalLink,
  ShieldCheck,
  Radio,
  Clock
} from 'lucide-react';
import { PushNotificationItem, PushPermissionStatus, Language } from '../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotificationItem[];
  unreadCount: number;
  permissionStatus: PushPermissionStatus;
  onEnablePush: () => Promise<void>;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onTestVaccinationAlert: () => void;
  onTestUrgentVetAlert: () => void;
  onNavigateTab: (tabId: string) => void;
  language: Language;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  permissionStatus,
  onEnablePush,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onTestVaccinationAlert,
  onTestUrgentVetAlert,
  onNavigateTab,
  language
}) => {
  const [isEnabling, setIsEnabling] = useState(false);
  const [filter, setFilter] = useState<'all' | 'vaccination' | 'vet_response'>('all');

  if (!isOpen) return null;

  const handleEnableClick = async () => {
    setIsEnabling(true);
    try {
      await onEnablePush();
    } finally {
      setIsEnabling(false);
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  const getCategoryIcon = (category: string, urgent?: boolean) => {
    if (category === 'vaccination') {
      return (
        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-2xs">
          <Syringe className="w-5 h-5" />
        </div>
      );
    }
    if (category === 'vet_response' || urgent) {
      return (
        <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0 shadow-2xs animate-pulse">
          <Stethoscope className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-2xs">
        <Bell className="w-5 h-5" />
      </div>
    );
  };

  const formatTimestamp = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMinutes < 1) return language === 'hi' ? 'अभी' : language === 'mr' ? 'आत्ताच' : 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ${language === 'hi' ? 'पहले' : language === 'mr' ? 'पूर्वी' : 'ago'}`;
      if (diffHours < 24) return `${diffHours}h ${language === 'hi' ? 'पहले' : language === 'mr' ? 'पूर्वी' : 'ago'}`;
      if (diffDays === 1) return language === 'hi' ? 'कल' : language === 'mr' ? 'काल' : 'Yesterday';
      return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-md h-full sm:h-[90vh] bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-stone-900 text-base">
                  {language === 'hi' 
                    ? 'लाइव पुश अलर्ट्स व सूचनाएं' 
                    : language === 'mr' 
                    ? 'थेट पुश सूचना व अलर्ट्स' 
                    : 'Real-Time Push Alerts'}
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-600 text-white animate-pulse">
                    {unreadCount} {language === 'hi' ? 'नई' : language === 'mr' ? 'नवीन' : 'new'}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500">
                {language === 'hi' 
                  ? 'टीकाकरण अनुस्मारक और तत्काल पशुचिकित्सक सलाह' 
                  : language === 'mr' 
                  ? 'लसीकरण स्मरणपत्रे आणि तातडीचे पशुवैद्यकीय प्रतिसाद' 
                  : 'Vaccination reminders & urgent vet responses'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FCM Push Notification Permission Bar */}
        <div className="px-4 py-3 bg-stone-100 border-b border-stone-200 text-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Radio className={`w-3.5 h-3.5 ${permissionStatus === 'granted' ? 'text-emerald-600 animate-pulse' : 'text-amber-500'}`} />
              <span className="font-medium text-stone-700">
                {permissionStatus === 'granted' ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 inline" />
                    {language === 'hi' ? 'पुश अलर्ट्स सक्रिय हैं (FCM)' : language === 'mr' ? 'पुश सूचना सक्रिय आहेत (FCM)' : 'FCM Push Notifications Active'}
                  </span>
                ) : permissionStatus === 'denied' ? (
                  <span className="text-red-700">
                    {language === 'hi' ? 'ब्राउज़र सेटिंग्स में सूचनाएं अवरुद्ध हैं' : language === 'mr' ? 'ब्राउझर सेटिंग्जमध्ये सूचना अवरोधित आहेत' : 'Notifications blocked in browser settings'}
                  </span>
                ) : (
                  <span>
                    {language === 'hi' ? 'तत्काल चेतावनियों के लिए पुश सक्षम करें' : language === 'mr' ? 'तातडीच्या सूचनांसाठी पुश सुरू करा' : 'Enable push for real-time mobile/desktop alerts'}
                  </span>
                )}
              </span>
            </div>

            {permissionStatus !== 'granted' && (
              <button
                onClick={handleEnableClick}
                disabled={isEnabling}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md font-bold text-xs shadow-2xs transition shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isEnabling 
                  ? (language === 'hi' ? 'सक्रिय हो रहा...' : language === 'mr' ? 'सुरू होत आहे...' : 'Enabling...') 
                  : (language === 'hi' ? 'सक्रिय करें' : language === 'mr' ? 'सुरू करा' : 'Enable Push')}
              </button>
            )}
          </div>
        </div>

        {/* Quick Simulation / Testing Triggers Bar */}
        <div className="p-3 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between gap-2">
          <div className="text-[11px] text-emerald-900 font-medium flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>
              {language === 'hi' ? 'तत्काल टेस्ट करें:' : language === 'mr' ? 'त्वरित चाचणी:' : 'Test Real-Time Alert:'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onTestVaccinationAlert}
              className="px-2 py-1 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 rounded text-[11px] font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs"
              title="Send a sample upcoming vaccination reminder"
            >
              <Syringe className="w-3 h-3 text-amber-700" />
              <span>{language === 'hi' ? 'टीकाकरण अलर्ट' : language === 'mr' ? 'लसीकरण अलर्ट' : 'Vaccination'}</span>
            </button>
            <button
              onClick={onTestUrgentVetAlert}
              className="px-2 py-1 bg-white hover:bg-red-50 text-red-900 border border-red-300 rounded text-[11px] font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs"
              title="Send a sample urgent veterinarian response"
            >
              <AlertTriangle className="w-3 h-3 text-red-700" />
              <span>{language === 'hi' ? 'डॉक्टर रिस्पॉन्स' : language === 'mr' ? 'डॉक्टर प्रतिसाद' : 'Urgent Vet'}</span>
            </button>
          </div>
        </div>

        {/* Filters & Actions Bar */}
        <div className="px-4 py-2 border-b border-stone-200 bg-white flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer ${
                filter === 'all' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {language === 'hi' ? 'सभी' : language === 'mr' ? 'सर्व' : 'All'} ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('vaccination')}
              className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer flex items-center gap-1 ${
                filter === 'vaccination' ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Syringe className="w-3 h-3" />
              <span>{language === 'hi' ? 'टीका' : language === 'mr' ? 'लस' : 'Vaccines'}</span>
            </button>
            <button
              onClick={() => setFilter('vet_response')}
              className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer flex items-center gap-1 ${
                filter === 'vet_response' ? 'bg-red-700 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Stethoscope className="w-3 h-3" />
              <span>{language === 'hi' ? 'पशुवैद्य' : language === 'mr' ? 'पशुवैद्य' : 'Vet'}</span>
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-emerald-700 hover:text-emerald-800 font-semibold hover:underline text-[11px] cursor-pointer"
            >
              {language === 'hi' ? 'सभी पढ़े' : language === 'mr' ? 'सर्व वाचले' : 'Mark all read'}
            </button>
          )}
        </div>

        {/* Notifications Scroll List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {filteredNotifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-stone-500">
              <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                <Bell className="w-7 h-7" />
              </div>
              <p className="font-semibold text-stone-700 text-sm">
                {language === 'hi' 
                  ? 'कोई नई सूचना नहीं है' 
                  : language === 'mr' 
                  ? 'कोणत्याही नवीन सूचना नाहीत' 
                  : 'No alerts right now'}
              </p>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                {language === 'hi'
                  ? 'जब किसी पशु का टीकाकरण नजदीक होगा या पशुचिकित्सक संदेश भेजेंगे, तो आपको रियल-टाइम सूचना मिलेगी।'
                  : language === 'mr'
                  ? 'जेव्हा जनावरांचे लसीकरण जवळ येईल किंवा पशुवैद्यक संदेश पाठवतील, तेव्हा तुम्हाला थेट सूचना मिळेल.'
                  : 'You will receive real-time push notifications when vaccinations are due or veterinarians send clinical instructions.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              return (
                <div
                  key={item.id}
                  onClick={() => onMarkAsRead(item.id)}
                  className={`relative p-3 rounded-xl border transition group cursor-pointer ${
                    !item.read 
                      ? 'bg-emerald-50/40 border-emerald-200 shadow-2xs' 
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {!item.read && (
                    <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
                  )}

                  <div className="flex items-start gap-3">
                    {getCategoryIcon(item.category, item.urgent)}
                    
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-stone-900 text-xs sm:text-sm">
                          {item.title}
                        </span>
                        {item.urgent && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-red-100 text-red-700 uppercase">
                            {language === 'hi' ? 'तत्काल' : language === 'mr' ? 'तातडीचे' : 'Urgent'}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-stone-700 mt-1 leading-relaxed whitespace-pre-line">
                        {item.body}
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-2 pt-1 border-t border-stone-100 text-[11px] text-stone-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>{formatTimestamp(item.createdAt)}</span>
                        </span>

                        <div className="flex items-center gap-2">
                          {item.category === 'vaccination' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateTab('reminders');
                                onClose();
                              }}
                              className="text-amber-800 hover:text-amber-900 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>{language === 'hi' ? 'अनुस्मारक देखें' : language === 'mr' ? 'स्मरणपत्र पहा' : 'View Reminder'}</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateTab('vet');
                                onClose();
                              }}
                              className="text-emerald-800 hover:text-emerald-900 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>{language === 'hi' ? 'सलाह देखें' : language === 'mr' ? 'सल्ला पहा' : 'View Vet Advice'}</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteNotification(item.id);
                            }}
                            className="text-stone-400 hover:text-red-600 p-1 transition cursor-pointer"
                            title="Delete alert"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 text-center text-[11px] text-stone-500">
          <p>
            {language === 'hi'
              ? '📡 सुरक्षित Firebase Cloud Messaging द्वारा संचालित'
              : language === 'mr'
              ? '📡 सुरक्षित Firebase Cloud Messaging द्वारे समर्थित'
              : '📡 Secured by Firebase Cloud Messaging & Web Push'}
          </p>
        </div>
      </div>
    </div>
  );
};
