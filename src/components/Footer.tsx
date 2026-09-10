import React from 'react';
import {
  Phone,
  PhoneCall,
  ShieldCheck,
  HeartPulse,
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
  onNavigate,
  onOpenPrivacy,
}) => {
  const isHindi = language === 'hi';
  const isMarathi = language === 'mr';

  const handleLinkClick = (tab: string) => {
    onNavigate(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="app-footer" className="bg-stone-900 text-stone-300 border-t border-stone-800 text-xs">
      {/* Top Helpline Quick Access */}
      <div className="bg-stone-950 border-b border-stone-800 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-stone-200 font-medium text-xs sm:text-sm">
            <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isHindi
                ? 'राष्ट्रीय पशु आपातकालीन 24x7 हेल्पलाइन: 1962'
                : isMarathi
                ? 'राष्ट्रीय पशु आपत्कालीन 24x7 हेल्पलाइन: 1962'
                : 'National Animal Emergency 24x7 Helpline: 1962'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:1962"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold text-xs transition cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>1962 (Toll Free)</span>
            </a>
            <a
              href="tel:18001801551"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-xs border border-stone-700 transition cursor-pointer"
            >
              <Phone className="w-3 h-3 text-stone-400" />
              <span>1800-180-1551 (KCC)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Col 1: Brand & Purpose */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-white font-bold text-sm">
                <HeartPulse className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base tracking-tight">PashuCare</h3>
                <p className="text-[11px] text-stone-400">Livestock Health & Clinical Advisory</p>
              </div>
            </div>

            <p className="text-stone-400 text-xs leading-relaxed max-w-sm">
              {isHindi
                ? 'पशुपालक और डेयरी किसानों के लिए प्राथमिक स्वास्थ्य परीक्षण, रोग लक्षण पहचान और सुरक्षित पशु चिकित्सा मार्गदर्शन।'
                : isMarathi
                ? 'पशुपालक आणि दुग्ध उत्पादक शेतकऱ्यांसाठी प्राथमिक आरोग्य तपासणी आणि पशुवैद्यकीय मार्गदर्शन.'
                : 'Preliminary health screening, symptom identification, and clinical care advisory for dairy and livestock farmers.'}
            </p>
          </div>

          {/* Col 2: Navigation Utilities */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              {isHindi ? 'त्वरित लिंक' : 'Quick Navigation'}
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button
                  onClick={() => handleLinkClick('home')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  {isHindi ? 'होम पेज' : 'Home'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('check')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left font-semibold text-emerald-400"
                >
                  {isHindi ? 'स्वास्थ्य जांच शुरू करें' : 'Start Health Check'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('animals')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  {isHindi ? 'पंजीकृत पशु (My Animals)' : 'Registered Animals'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('history')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  {isHindi ? 'पिछली जांच रिपोर्ट' : 'Health Assessment History'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Clinical Disclaimer */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              {isHindi ? 'चिकित्सकीय अस्वीकरण' : 'Clinical Advisory'}
            </h4>
            <div className="p-3 rounded-lg bg-stone-800/70 border border-stone-800 text-stone-400 text-xs leading-relaxed space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-xs">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Veterinary Notice</span>
              </div>
              <p>
                {isHindi
                  ? 'PashuCare केवल प्राथमिक स्वास्थ्य सूचना और मार्गदर्शन प्रदान करता है। किसी भी गंभीर या आपातकालीन स्थिति में तुरंत निकटतम पंजीकृत पशु चिकित्सक से संपर्क करें।'
                  : isMarathi
                  ? 'PashuCare केवळ प्राथमिक माहितीसाठी आहे. गंभीर स्थितीत कृपया नोंदणीकृत पशुवैद्यकीय अधिकाऱ्यांशी संपर्क साधा.'
                  : 'PashuCare provides early health screening and first aid guidance. Always consult a licensed veterinarian for definitive diagnosis and treatment.'}
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-5 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 text-xs">
          <div>
            © {new Date().getFullYear()} PashuCare • Livestock Health
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            <button
              onClick={onOpenPrivacy}
              className="hover:text-stone-200 transition underline cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
              Privacy & Advisory Charter
            </button>
            <span>•</span>
            <a href="tel:1962" className="text-red-400 hover:underline font-bold">
              Emergency 1962
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
