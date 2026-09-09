import React from 'react';
import {
  Phone,
  PhoneCall,
  ShieldCheck,
  Activity,
  HeartPulse,
  BookOpen,
  Calendar,
  AlertTriangle,
  Stethoscope,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { Language, UserProfile } from '../types';

interface FooterProps {
  language: Language;
  user: UserProfile | null;
  onNavigate: (tab: any) => void;
  onOpenAuth: (tab?: 'signin' | 'register') => void;
  onOpenPrivacy: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  language,
  user,
  onNavigate,
  onOpenAuth,
  onOpenPrivacy,
}) => {
  const isHindi = language === 'hi';
  const isMarathi = language === 'mr';

  const handleLinkClick = (tab: string) => {
    if (user) {
      onNavigate(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onOpenAuth('register');
    }
  };

  return (
    <footer id="app-footer" className="bg-stone-900 text-stone-300 border-t border-stone-800 text-xs">
      {/* Top Banner: Emergency Helpline Quick Access */}
      <div className="bg-emerald-950/90 border-b border-emerald-800/50 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5 text-emerald-200 font-medium text-xs sm:text-sm">
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {isHindi
                ? 'आपातकालीन पशु स्वास्थ्य सहायता: तुरंत 24x7 राष्ट्रीय हेल्पलाइन पर संपर्क करें'
                : isMarathi
                ? 'आपत्कालीन पशु आरोग्य मदत: त्वरित 24x7 राष्ट्रीय हेल्पलाइनशी संपर्क साधा'
                : 'Emergency Livestock Veterinary Support: Dial 24x7 National Helpline'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:1962"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition transform active:scale-95 cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>1962 (Toll Free)</span>
            </a>
            <a
              href="tel:18001801551"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-medium text-xs border border-emerald-600/60 transition cursor-pointer"
            >
              <Phone className="w-3 h-3" />
              <span>1800-180-1551 (KCC)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          
          {/* Col 1: Brand & Purpose */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                P
              </div>
              <div>
                <h3 className="text-white font-black text-base tracking-tight">PashuCare AI</h3>
                <p className="text-[11px] text-emerald-400 font-medium">Smart Livestock Health</p>
              </div>
            </div>

            <p className="text-stone-400 text-xs leading-relaxed">
              {isHindi
                ? 'भारतीय डेयरी और पशुपालक किसानों के लिए समर्पित AI-सक्षम स्वास्थ्य निदान, पशु पंजीयन, टीकाकरण अलर्ट और टेली-वेट सहायक।'
                : isMarathi
                ? 'भारतीय दुग्ध आणि पशुपालक शेतकऱ्यांसाठी समर्पित AI-सक्षम आरोग्य निदान, पशु नोंदणी आणि लसीकरण व्यवस्थापन.'
                : 'Empowering Indian dairy and livestock farmers with AI-driven preliminary disease detection, digital cattle logs, and veterinary tele-support.'}
            </p>

            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 font-bold text-[11px]">
                <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
                Made for people & farmers
              </span>
            </div>
          </div>

          {/* Col 2: Services & Features */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              {isHindi ? 'त्वरित सुविधाएं' : isMarathi ? 'जलद सेवा' : 'Quick Features'}
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button
                  onClick={() => handleLinkClick('check')}
                  className="flex items-center gap-1.5 hover:text-emerald-400 transition text-left cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-stone-600" />
                  <span>{isHindi ? 'AI लक्षण व रोग पहचान' : isMarathi ? 'AI लक्षण व आजार तपासणी' : 'AI Disease & Symptom Check'}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('animals')}
                  className="flex items-center gap-1.5 hover:text-emerald-400 transition text-left cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-stone-600" />
                  <span>{isHindi ? 'डिजिटल पशु पंजीयन (INAPH)' : isMarathi ? 'डिजिटल पशु नोंदणी' : 'Livestock Registry (INAPH)'}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('reminders')}
                  className="flex items-center gap-1.5 hover:text-emerald-400 transition text-left cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-stone-600" />
                  <span>{isHindi ? 'टीकाकरण व डीवॉर्मिंग कैलेंडर' : isMarathi ? 'लसीकरण व जंतनिर्मूलन दिनदर्शिका' : 'Vaccination & Deworming'}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('diseases')}
                  className="flex items-center gap-1.5 hover:text-emerald-400 transition text-left cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-stone-600" />
                  <span>{isHindi ? 'पशु रोग ज्ञानकोश (Lumpy, FMD)' : isMarathi ? 'पशु रोग माहिती (लम्पी, लाळ्या खुरकूत)' : 'Disease Knowledge Catalog'}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('vet')}
                  className="flex items-center gap-1.5 hover:text-emerald-400 transition text-left cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-stone-600" />
                  <span>{isHindi ? 'पशु चिकित्सक टेली-सपोर्ट' : isMarathi ? 'पशुवैद्यकीय सल्ला' : 'Veterinary Consultation'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Helplines & Govt Support */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              {isHindi ? 'राष्ट्रीय हेल्पलाइन नंबर' : isMarathi ? 'राष्ट्रीय हेल्पलाइन क्रमांक' : 'National Helplines'}
            </h4>
            <div className="space-y-2.5 text-stone-400">
              <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1">
                <div className="text-[11px] text-stone-400 font-semibold flex items-center justify-between">
                  <span>पशु टेलीमेडिसिन (Govt.)</span>
                  <span className="text-red-400 font-bold text-xs">24x7 Active</span>
                </div>
                <a
                  href="tel:1962"
                  className="text-base font-black text-white hover:text-emerald-400 transition flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-red-400" />
                  1962 (Toll Free)
                </a>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1">
                <div className="text-[11px] text-stone-400 font-semibold">
                  किसान कॉल सेंटर (KCC)
                </div>
                <a
                  href="tel:18001801551"
                  className="text-sm font-black text-white hover:text-emerald-400 transition flex items-center gap-1.5"
                >
                  <Phone className="w-3 h-3 text-emerald-400" />
                  1800-180-1551
                </a>
              </div>

              <div className="text-[11px] text-stone-400 flex items-start gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>DAHD (Department of Animal Husbandry & Dairying) गाइडलाइन्स अनुरूप</span>
              </div>
            </div>
          </div>

          {/* Col 4: Medical Disclaimer & Guidelines */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              {isHindi ? 'मार्गदर्शिका व नीतियां' : isMarathi ? 'मार्गदर्शक तत्त्वे' : 'Safety & Charter'}
            </h4>
            <div className="p-3 rounded-xl bg-stone-800/50 border border-stone-800 text-stone-400 text-[11px] leading-relaxed space-y-2">
              <div className="flex items-start gap-1.5 text-amber-300 font-semibold">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{isHindi ? 'चिकित्सा अस्वीकरण (Disclaimer)' : 'Veterinary Disclaimer'}</span>
              </div>
              <p>
                {isHindi
                  ? 'PashuCare AI एक प्राथमिक सहायक प्रणाली है। यह पेशेवर पशु चिकित्सक के निदान का विकल्प नहीं है। गंभीर स्थिति में तुरंत निकटतम पशु चिकित्सालय ले जाएं।'
                  : isMarathi
                  ? 'PashuCare AI एक प्राथमिक सहाय्यक साधन आहे. गंभीर स्थितीत कृपया जवळच्या सरकारी पशुवैद्यकीय अधिकाऱ्यांशी संपर्क साधा.'
                  : 'PashuCare AI provides decision support for early screening. Consult a registered veterinarian for clinical diagnosis and surgical emergencies.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={onOpenPrivacy}
                className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 underline font-medium cursor-pointer"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>{isHindi ? 'प्राइवेसी व डेटा सुरक्षा चार्टर' : 'Privacy & Medical Charter'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 text-[11px] text-center sm:text-left">
          <div className="font-medium text-stone-400">
            © 2026 PashuCare AI • <span className="text-emerald-400 font-semibold">Made for people & farmers</span>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            <span>@ 2026 all rights reserved</span>
            <span>•</span>
            <button
              onClick={onOpenPrivacy}
              className="hover:text-stone-300 transition underline cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <a href="tel:1962" className="text-red-400 hover:underline font-bold">
              Emergency SOS 1962
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
