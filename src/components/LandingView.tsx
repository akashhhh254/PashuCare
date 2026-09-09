import React from 'react';
import {
  HeartPulse,
  Camera,
  ShieldCheck,
  PhoneCall,
  Activity,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Users,
  Calendar,
  BookOpen,
  Languages,
  ArrowRight,
  UserPlus,
  LogIn,
  Lock,
  Stethoscope,
  Clock,
  Check
} from 'lucide-react';
import { Language } from '../types';
import { translations, getTranslation } from '../i18n/translations';

interface LandingViewProps {
  language: Language;
  onOpenAuth: (tab?: 'signin' | 'register') => void;
  onOpenPrivacy: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  language,
  onOpenAuth,
  onOpenPrivacy,
}) => {
  const t = (key: keyof typeof translations['en']) => getTranslation(language, key);

  const features = [
    {
      id: 'feat-ai-scan',
      title: t('landingFeat1Title'),
      desc: t('landingFeat1Desc'),
      icon: Camera,
      tag: 'Gemini 3.8 Vision AI',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      id: 'feat-registry',
      title: t('landingFeat2Title'),
      desc: t('landingFeat2Desc'),
      icon: Users,
      tag: 'Tag ID & Herd Records',
      color: 'bg-blue-50 text-blue-800 border-blue-200'
    },
    {
      id: 'feat-reminders',
      title: t('landingFeat3Title'),
      desc: t('landingFeat3Desc'),
      icon: Calendar,
      tag: 'FMD & Deworming Alerts',
      color: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    {
      id: 'feat-vet-sos',
      title: t('landingFeat4Title'),
      desc: t('landingFeat4Desc'),
      icon: PhoneCall,
      tag: 'National Toll-Free 1962',
      color: 'bg-rose-50 text-rose-800 border-rose-200'
    },
    {
      id: 'feat-handbook',
      title: t('landingFeat5Title'),
      desc: t('landingFeat5Desc'),
      icon: BookOpen,
      tag: 'Regional Indian Diseases',
      color: 'bg-purple-50 text-purple-800 border-purple-200'
    },
    {
      id: 'feat-offline-lang',
      title: t('landingFeat6Title'),
      desc: t('landingFeat6Desc'),
      icon: Languages,
      tag: 'Hindi • Marathi • English',
      color: 'bg-teal-50 text-teal-800 border-teal-200'
    }
  ];

  const steps = [
    {
      num: '1',
      title: t('landingStep1Title'),
      desc: t('landingStep1Desc'),
      icon: UserPlus
    },
    {
      num: '2',
      title: t('landingStep2Title'),
      desc: t('landingStep2Desc'),
      icon: Users
    },
    {
      num: '3',
      title: t('landingStep3Title'),
      desc: t('landingStep3Desc'),
      icon: HeartPulse
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-stone-900 text-white pt-10 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Mission, Headline & Account Gate */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-800/80 border border-emerald-600/40 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>{t('landingHeroBadge')}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {t('landingHeroTitle')}
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl leading-relaxed">
                {t('landingHeroSubtitle')}
              </p>

              {/* MANDATORY ACCOUNT NOTICE BANNER */}
              <div className="p-4 rounded-2xl bg-white/10 border border-emerald-400/30 backdrop-blur-md space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0 text-white">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {language === 'hi' 
                        ? 'पशु स्वास्थ्य सेवा और सुविधाओं का उपयोग करने के लिए खाता आवश्यक है' 
                        : language === 'mr' 
                        ? 'आरोग्य तपासणी व गोठा व्यवस्थापनासाठी खाते तयार करणे आवश्यक आहे' 
                        : 'Account Required to Access Diagnosis & Livestock Tools'}
                    </h3>
                    <p className="text-xs text-emerald-100 mt-0.5">
                      {t('landingGateNotice')}
                    </p>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    id="landing-hero-register-btn"
                    onClick={() => onOpenAuth('register')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-sm sm:text-base shadow-lg transition active:scale-98 cursor-pointer"
                  >
                    <UserPlus className="w-5 h-5 text-stone-950" />
                    <span>{t('landingBtnRegister')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    id="landing-hero-signin-btn"
                    onClick={() => onOpenAuth('signin')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm sm:text-base border border-white/20 backdrop-blur-xs transition cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-emerald-200" />
                    <span>{t('landingBtnSignIn')}</span>
                  </button>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-emerald-800/60 text-xs">
                <div>
                  <div className="font-extrabold text-emerald-300 text-sm sm:text-base">100% Free</div>
                  <div className="text-stone-300 text-[11px]">For Dairy & Rural Farmers</div>
                </div>
                <div>
                  <div className="font-extrabold text-emerald-300 text-sm sm:text-base">4 Species</div>
                  <div className="text-stone-300 text-[11px]">Cow, Buffalo, Goat, Sheep</div>
                </div>
                <div>
                  <div className="font-extrabold text-emerald-300 text-sm sm:text-base">Helpline 1962</div>
                  <div className="text-stone-300 text-[11px]">Govt Emergency Call</div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Technology Visual Preview */}
            <div className="lg:col-span-5">
              <div className="bg-stone-900/90 border border-emerald-800/80 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-md space-y-4">
                
                {/* Header bar */}
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      Live AI Vision Diagnostic Engine
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                    Preview Card
                  </span>
                </div>

                {/* Sample Card */}
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-stone-800/80 border border-stone-700/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-200">Gir Cow #402 (Lactating)</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Moderate Alert
                      </span>
                    </div>

                    <div className="text-xs text-stone-400 space-y-1">
                      <p className="flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Analyzed Photo: Mouth lesions & excessive salivation</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Symptoms: High fever (104°F), reduced rumination, limp</span>
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-xs text-emerald-100">
                      <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Assessment: Suspected Early Foot & Mouth (FMD)</span>
                      </div>
                      <p className="text-[11px] text-stone-300 mt-1">
                        Action: Isolate animal immediately, potassium permanganate mouth wash, notify local vet hospital.
                      </p>
                    </div>
                  </div>

                  {/* Callout inside preview */}
                  <div className="text-center p-3 rounded-xl bg-emerald-900/30 border border-emerald-700/30">
                    <p className="text-xs text-emerald-200 font-medium">
                      {language === 'hi'
                        ? 'अपने पशुओं की ऐसी ही जांच और रिकॉर्ड रखने के लिए खाता बनाएं:'
                        : language === 'mr'
                        ? 'आपल्या जनावरांची अशीच आरोग्य तपासणी व नोंदी ठेवण्यासाठी खाते बनवा:'
                        : 'Create your account to run diagnostic scans on your own herd:'}
                    </p>
                    <button
                      onClick={() => onOpenAuth('register')}
                      className="mt-2.5 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{t('landingBtnRegister')}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                  <span>Standard 1962 SOS Integration</span>
                  <button
                    onClick={onOpenPrivacy}
                    className="text-emerald-400 hover:underline cursor-pointer"
                  >
                    Medical Safety Charter
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* WHAT THE APP DOES: 6 KEY CAPABILITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t('landingSectionFeaturesTitle')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight">
            {language === 'hi' 
              ? 'पशुपालकों के लिए संपूर्ण डिजिटल स्वास्थ्य प्रणाली'
              : language === 'mr'
              ? 'शेतकरी बांधवांसाठी संपूर्ण डिजिटल पशु आरोग्य प्रणाली'
              : 'Complete Digital Healthcare for Every Dairy & Livestock Farmer'}
          </h2>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            {t('landingSectionFeaturesSub')}
          </p>
        </div>

        {/* 6 Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                id={feat.id}
                className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center group-hover:scale-105 transition">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 group-hover:text-emerald-800 transition">
                    {feat.title}
                  </h3>

                  <p className="text-sm text-stone-600 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>
                    {language === 'hi'
                      ? 'खाता बनाने के बाद तुरंत उपलब्ध'
                      : language === 'mr'
                      ? 'खाते तयार केल्यानंतर त्वरित उपलब्ध'
                      : 'Available with free farmer account'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3 STEPS TO GET STARTED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-stone-900 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Simple & Fast
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {t('landingHowItWorksTitle')}
            </h2>
            <p className="text-sm text-emerald-100">
              {language === 'hi' 
                ? 'कोई जटिल प्रक्रिया नहीं — सिर्फ 3 चरणों में अपने पशुओं की देखभाल शुरू करें'
                : language === 'mr'
                ? 'कोणतीही किचकट पद्धत नाही — फक्त ३ सोप्या टप्प्यांत सुरुवात करा'
                : 'No complicated paperwork — start diagnosing and managing your cattle in minutes.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="bg-white/10 border border-white/15 rounded-2xl p-6 backdrop-blur-xs space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-stone-950 font-black flex items-center justify-center text-lg">
                    {step.num}
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Direct CTA button */}
          <div className="text-center pt-2">
            <button
              onClick={() => onOpenAuth('register')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 font-black text-base shadow-xl transition active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-5 h-5 text-emerald-700" />
              <span>{t('landingBtnRegister')}</span>
              <ArrowRight className="w-4 h-4 text-emerald-700" />
            </button>
          </div>

        </div>
      </section>

      {/* SUPPORTED LIVESTOCK SPECIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-stone-900">
            {language === 'hi' 
              ? 'समर्थित पशु प्रजातियां'
              : language === 'mr'
              ? 'समर्थित जनावरांचे प्रकार'
              : 'Supported Livestock Species'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            {language === 'hi'
              ? 'गाय, भैंस, बकरी और भेड़ के लिए विशेष रूप से प्रशिक्षित AI मॉडल'
              : language === 'mr'
              ? 'गाय, म्हैस, शेळी आणि मेंढीसाठी विशेष प्रशिक्षित AI मॉडेल'
              : 'Specialized diagnostic models trained on Indian dairy and pastoral breeds'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-stone-200 text-center space-y-2 shadow-2xs">
            <div className="text-3xl">🐄</div>
            <h4 className="font-bold text-stone-900 text-sm">{t('animalCow')}</h4>
            <p className="text-[11px] text-stone-500">Gir, Sahiwal, Red Sindhi, HF, Jersey Cross</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 text-center space-y-2 shadow-2xs">
            <div className="text-3xl">🐃</div>
            <h4 className="font-bold text-stone-900 text-sm">{t('animalBuffalo')}</h4>
            <p className="text-[11px] text-stone-500">Murrah, Jaffrabadi, Mehsana, Surti</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 text-center space-y-2 shadow-2xs">
            <div className="text-3xl">🐐</div>
            <h4 className="font-bold text-stone-900 text-sm">{t('animalGoat')}</h4>
            <p className="text-[11px] text-stone-500">Beetal, Sirohi, Jamnapari, Barbari</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 text-center space-y-2 shadow-2xs">
            <div className="text-3xl">🐑</div>
            <h4 className="font-bold text-stone-900 text-sm">{t('animalSheep')}</h4>
            <p className="text-[11px] text-stone-500">Marwari, Deccani, Nellore, Malpura</p>
          </div>
        </div>
      </section>

      {/* FINAL BOTTOM CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-800 text-white rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-xl">
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black">
              {t('landingCalloutTitle')}
            </h2>
            <p className="text-sm text-emerald-100">
              {t('landingCalloutDesc')}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              id="landing-bottom-register-btn"
              onClick={() => onOpenAuth('register')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 font-black text-sm sm:text-base shadow-lg transition active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-emerald-800" />
              <span>{t('landingBtnRegister')}</span>
            </button>

            <button
              id="landing-bottom-signin-btn"
              onClick={() => onOpenAuth('signin')}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-white font-bold text-sm sm:text-base border border-emerald-600/50 transition cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-emerald-200" />
              <span>{t('landingBtnSignIn')}</span>
            </button>
          </div>

          <div className="pt-2 text-xs text-emerald-200 flex flex-wrap items-center justify-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Government 1962 Integrated</span>
            </span>
            <span>•</span>
            <button
              onClick={onOpenPrivacy}
              className="underline hover:text-white cursor-pointer"
            >
              Veterinary & Privacy Guidelines
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
