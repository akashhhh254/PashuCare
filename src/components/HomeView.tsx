import React from 'react';
import {
  HeartPulse,
  Users,
  Clock,
  PhoneCall,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  FileText
} from 'lucide-react';
import { Language } from '../types';
import { translations, getTranslation } from '../i18n/translations';

interface HomeViewProps {
  language: Language;
  onStartCheck: () => void;
  onNavigate: (tab: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  language,
  onStartCheck,
  onNavigate,
}) => {
  const t = (key: keyof typeof translations['en']) => getTranslation(language, key);

  const supportedLivestock = [
    {
      id: 'Cow',
      name: language === 'hi' ? 'गाय (Cow)' : language === 'mr' ? 'गाय (Cow)' : 'Cattle / Cow',
      desc: language === 'hi' ? 'खुरपका-मुंहपका, लंपी, थनैला, अफरा' : language === 'mr' ? 'लाळ्या खुरकूत, लम्पी, स्तनदाह' : 'FMD, Lumpy Skin Disease, Mastitis, Bloat',
      icon: '🐄'
    },
    {
      id: 'Buffalo',
      name: language === 'hi' ? 'भैंस (Buffalo)' : language === 'mr' ? 'म्हैस (Buffalo)' : 'Buffalo',
      desc: language === 'hi' ? 'गलघोटू, थनैला, ताप' : language === 'mr' ? 'घटसर्प, स्तनदाह, ताप' : 'Hemorrhagic Septicemia, Mastitis, Pyrexia',
      icon: '🐃'
    },
    {
      id: 'Goat',
      name: language === 'hi' ? 'बकरी (Goat)' : language === 'mr' ? 'शेळी (Goat)' : 'Goat',
      desc: language === 'hi' ? 'पीपीआर, चेचक, दस्त' : language === 'mr' ? 'पीपीआर, देवी, जुलाब' : 'PPR, Goat Pox, Enterotoxemia, Diarrhea',
      icon: '🐐'
    },
    {
      id: 'Sheep',
      name: language === 'hi' ? 'भेड़ (Sheep)' : language === 'mr' ? 'मेंढी (Sheep)' : 'Sheep',
      desc: language === 'hi' ? 'पीपीआर, भेड़ चेचक, खुर सड़न' : language === 'mr' ? 'मेंढी देवी, खुर कुजणे' : 'Sheep Pox, PPR, Foot Rot, Parasitic Anemia',
      icon: '🐑'
    },
    {
      id: 'Chicken',
      name: language === 'hi' ? 'मुर्गी (Poultry)' : language === 'mr' ? 'कोंबडी (Poultry)' : 'Poultry / Birds',
      desc: language === 'hi' ? 'रानीखेत, खूनी दस्त' : language === 'mr' ? 'रानीखेत, रक्ताचे जुलाब' : 'Ranikhet / Newcastle, Coccidiosis, Fowl Pox',
      icon: '🐔'
    },
    {
      id: 'Other',
      name: language === 'hi' ? 'कुत्ता व अन्य पशु' : language === 'mr' ? 'कुत्रा व इतर' : 'Dogs & Others',
      desc: language === 'hi' ? 'पार्वो, आंत संक्रमण, सामान्य जांच' : language === 'mr' ? 'पार्व्हो, सामान्य तपासणी' : 'Canine Parvo, Respiratory, General Signs',
      icon: '🐕'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      
      {/* MAIN HERO CARD */}
      <section className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-10 shadow-sm text-stone-900">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-700">
            <HeartPulse className="w-3.5 h-3.5 text-emerald-700" />
            <span>PashuCare AI • Livestock Health</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-stone-900 leading-tight">
            Check Your Animal's Health
          </h1>

          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            Upload a photo or describe the symptoms to get a preliminary health assessment.
          </p>

          {/* Call to action buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              id="home-check-animal-health-btn"
              onClick={onStartCheck}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm sm:text-base shadow-sm transition active:scale-98 cursor-pointer"
            >
              <HeartPulse className="w-5 h-5 text-emerald-100" />
              <span>Check Animal Health</span>
              <ArrowRight className="w-4 h-4 text-emerald-100 ml-1" />
            </button>

            <button
              id="home-my-animals-btn"
              onClick={() => onNavigate('animals')}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 font-semibold text-sm sm:text-base transition cursor-pointer"
            >
              <Users className="w-4 h-4 text-stone-600" />
              <span>My Animals</span>
            </button>

            <button
              id="home-history-btn"
              onClick={() => onNavigate('history')}
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-stone-600 hover:text-stone-900 font-medium text-sm transition cursor-pointer"
            >
              <Clock className="w-4 h-4 text-stone-500" />
              <span>Previous Reports</span>
            </button>
          </div>
        </div>
      </section>

      {/* SUPPORTED ANIMALS SECTION */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-stone-900">
            Supported Animals
          </h2>
          <span className="text-xs text-stone-500">
            Select an animal to begin health check
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {supportedLivestock.map((item) => (
            <button
              key={item.id}
              onClick={onStartCheck}
              className="flex flex-col text-left p-3.5 sm:p-4 rounded-xl border border-stone-200 bg-white hover:border-emerald-600 hover:bg-emerald-50/40 transition group cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <span className="text-2xl" role="img" aria-label={item.name}>
                  {item.icon}
                </span>
                <span className="text-xs text-stone-400 group-hover:text-emerald-700 font-bold transition">
                  →
                </span>
              </div>
              <span className="text-sm font-semibold text-stone-900 group-hover:text-emerald-900">
                {item.name}
              </span>
              <span className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                {item.desc}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* EMERGENCY & HELPLINE NOTICE */}
      <section className="p-4 sm:p-5 rounded-xl border border-stone-200 bg-stone-100/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <PhoneCall className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-stone-900">
              National Animal Emergency Helpline: 1962
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Available 24x7 toll-free for urgent veterinary ambulance and emergency consultations across India.
            </p>
          </div>
        </div>

        <a
          href="tel:1962"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shrink-0 transition"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Call 1962</span>
        </a>
      </section>

      {/* CLINICAL DISCLAIMER */}
      <section className="p-4 rounded-xl border border-stone-200 bg-white text-xs text-stone-500 space-y-1">
        <div className="flex items-center gap-1.5 text-stone-700 font-semibold">
          <ShieldAlert className="w-4 h-4 text-stone-500" />
          <span>Preliminary Health Advisory Disclaimer</span>
        </div>
        <p className="leading-relaxed">
          {t('disclaimerFull')}
        </p>
      </section>

    </div>
  );
};
