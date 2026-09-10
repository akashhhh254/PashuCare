import React from 'react';
import {
  HeartPulse,
  Users,
  Clock,
  PhoneCall,
  ArrowRight,
  ShieldAlert
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
      name: language === 'hi' ? 'गाय (Cattle)' : language === 'mr' ? 'गाय (Cattle)' : 'Cattle / Cow',
      desc: language === 'hi' ? 'खुरपका-मुंहपका, लंपी, थनैला' : language === 'mr' ? 'लाळ्या खुरकूत, लम्पी, स्तनदाह' : 'FMD, Lumpy Skin, Mastitis',
      icon: '🐄'
    },
    {
      id: 'Buffalo',
      name: language === 'hi' ? 'भैंस (Buffalo)' : language === 'mr' ? 'म्हैस (Buffalo)' : 'Buffalo',
      desc: language === 'hi' ? 'गलघोटू, थनैला, तेज बुखार' : language === 'mr' ? 'घटसर्प, स्तनदाह, ताप' : 'Hemorrhagic Septicemia, Mastitis',
      icon: '🐃'
    },
    {
      id: 'Goat',
      name: language === 'hi' ? 'बकरी (Goat)' : language === 'mr' ? 'शेळी (Goat)' : 'Goat',
      desc: language === 'hi' ? 'पीपीआर, चेचक, दस्त' : language === 'mr' ? 'पीपीआर, देवी, जुलाब' : 'PPR, Goat Pox, Enterotoxemia',
      icon: '🐐'
    },
    {
      id: 'Sheep',
      name: language === 'hi' ? 'भेड़ (Sheep)' : language === 'mr' ? 'मेंढी (Sheep)' : 'Sheep',
      desc: language === 'hi' ? 'पीपीआर, भेड़ चेचक, खुर सड़न' : language === 'mr' ? 'मेंढी देवी, खुर कुजणे' : 'Sheep Pox, Foot Rot, PPR',
      icon: '🐑'
    },
    {
      id: 'Chicken',
      name: language === 'hi' ? 'मुर्गी (Poultry)' : language === 'mr' ? 'कोंबडी (Poultry)' : 'Poultry / Birds',
      desc: language === 'hi' ? 'रानीखेत, खूनी दस्त' : language === 'mr' ? 'रानीखेत, रक्ताचे जुलाब' : 'Ranikhet / Newcastle, Coccidiosis',
      icon: '🐔'
    },
    {
      id: 'Other',
      name: language === 'hi' ? 'कुत्ता व अन्य पशु' : language === 'mr' ? 'कुत्रा व इतर' : 'Dogs & Other Animals',
      desc: language === 'hi' ? 'पार्वो, आंत संक्रमण, सामान्य जांच' : language === 'mr' ? 'पार्व्हो, सामान्य तपासणी' : 'Parvo, Respiratory, General signs',
      icon: '🐕'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* PRIMARY ACTION CARD */}
      <section className="rounded-xl border border-stone-300 bg-white p-6 sm:p-8 text-stone-900 shadow-2xs">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              {language === 'hi'
                ? 'पशु स्वास्थ्य जांच'
                : language === 'mr'
                ? 'जनावराचे आरोग्य तपासणी'
                : 'Livestock Health Assessment'}
            </h1>
            <p className="text-sm sm:text-base text-stone-600 mt-2 max-w-2xl leading-relaxed">
              {language === 'hi'
                ? 'पशु के लक्षण चुनें या फोटो जोड़ें। तुरंत प्राथमिक नैदानिक मार्गदर्शन और प्राथमिक उपचार सहायता प्राप्त करें।'
                : language === 'mr'
                ? 'जनावराची लक्षणे निवडा किंवा फोटो जोडा. त्वरित प्राथमिक आरोग्य सल्ला व प्रथमोपचार मदत मिळवा.'
                : 'Select symptoms or upload an optional photo for preliminary health screening, risk analysis, and immediate first aid guidance.'}
            </p>
          </div>

          {/* Action buttons with 48px+ touch targets */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              id="home-check-animal-health-btn"
              onClick={onStartCheck}
              className="min-h-[48px] flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-semibold text-base transition cursor-pointer"
            >
              <HeartPulse className="w-5 h-5 text-white" />
              <span>
                {language === 'hi' ? 'स्वास्थ्य जांच शुरू करें' : language === 'mr' ? 'आरोग्य तपासणी सुरू करा' : 'Start Health Check'}
              </span>
              <ArrowRight className="w-4 h-4 text-white ml-1" />
            </button>

            <button
              id="home-my-animals-btn"
              onClick={() => onNavigate('animals')}
              className="min-h-[48px] flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-800 font-semibold text-sm transition cursor-pointer"
            >
              <Users className="w-4 h-4 text-stone-600" />
              <span>{language === 'hi' ? 'पंजीकृत पशु' : language === 'mr' ? 'नोंदणीकृत जनावरे' : 'My Animals'}</span>
            </button>

            <button
              id="home-history-btn"
              onClick={() => onNavigate('history')}
              className="min-h-[48px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-700 font-semibold text-sm transition cursor-pointer"
            >
              <Clock className="w-4 h-4 text-stone-600" />
              <span>{language === 'hi' ? 'पिछली रिपोर्ट' : language === 'mr' ? 'मागील तपासणी' : 'Previous Reports'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* COMMON LIVESTOCK DIRECT SELECTION */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900">
            {language === 'hi' ? 'पशु श्रेणी चुनें' : language === 'mr' ? 'जनावर निवडा' : 'Select Livestock Species'}
          </h2>
          <span className="text-xs text-stone-500">
            {language === 'hi' ? 'जांच शुरू करने के लिए क्लिक करें' : 'Tap to start check'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {supportedLivestock.map((item) => (
            <button
              key={item.id}
              onClick={onStartCheck}
              className="min-h-[72px] flex flex-col justify-center text-left p-3.5 rounded-lg border border-stone-300 bg-white hover:border-emerald-700 hover:bg-emerald-50/30 active:bg-emerald-100/40 transition cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-2xl" role="img" aria-label={item.name}>
                  {item.icon}
                </span>
                <span className="text-xs text-stone-400 font-semibold">
                  →
                </span>
              </div>
              <span className="text-sm font-bold text-stone-900">
                {item.name}
              </span>
              <span className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                {item.desc}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* EMERGENCY & HELPLINE NOTICE */}
      <section className="p-4 rounded-lg border border-stone-300 bg-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <PhoneCall className="w-5 h-5 text-emerald-900 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              {language === 'hi'
                ? 'राष्ट्रीय पशु आपातकालीन हेल्पलाइन: 1962'
                : language === 'mr'
                ? 'राष्ट्रीय पशु आपत्कालीन हेल्पलाइन: 1962'
                : 'National Animal Emergency Helpline: 1962'}
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              {language === 'hi'
                ? 'गंभीर आपातकाल और एम्बुलेंस सहायता के लिए 24 घंटे निःशुल्क उपलब्ध।'
                : language === 'mr'
                ? 'तातडीच्या पशुवैद्यकीय मदतीसाठी 24 तास टोल-फ्री उपलब्ध.'
                : '24x7 Toll-Free veterinary assistance and emergency ambulance coordination across India.'}
            </p>
          </div>
        </div>

        <a
          href="tel:1962"
          className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white text-sm font-semibold shrink-0 transition"
        >
          <PhoneCall className="w-4 h-4" />
          <span>{language === 'hi' ? '1962 पर कॉल करें' : 'Call 1962'}</span>
        </a>
      </section>

      {/* CLINICAL DISCLAIMER */}
      <section className="p-4 rounded-lg border border-stone-200 bg-white text-xs text-stone-600 space-y-1.5 leading-relaxed">
        <div className="flex items-center gap-1.5 text-stone-800 font-bold">
          <ShieldAlert className="w-4 h-4 text-stone-700" />
          <span>{language === 'hi' ? 'चिकित्सकीय परामर्श सूचना' : 'Clinical Advisory Notice'}</span>
        </div>
        <p>
          {t('disclaimerFull')}
        </p>
      </section>

    </div>
  );
};
