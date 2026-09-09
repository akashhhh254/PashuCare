import React, { useState } from 'react';
import {
  Focus,
  Crosshair,
  Grid,
  Sun,
  ShieldCheck,
  Eye,
  Activity,
  Sparkles,
  Info,
  Camera,
  RotateCcw,
  X,
  Maximize2
} from 'lucide-react';
import { Language } from '../types';

export type AlignmentZoneMode = 'wound' | 'mouth_hoof' | 'eyes' | 'full';

interface CameraAlignmentOverlayProps {
  language: Language;
  onCapture: () => void;
  onCancel: () => void;
  onFlipCamera?: () => void;
  hasMultipleCameras?: boolean;
}

export const CameraAlignmentOverlay: React.FC<CameraAlignmentOverlayProps> = ({
  language,
  onCapture,
  onCancel,
  onFlipCamera,
  hasMultipleCameras = false,
}) => {
  const [activeZone, setActiveZone] = useState<AlignmentZoneMode>('wound');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  const isHindi = language === 'hi';
  const isMarathi = language === 'mr';

  const zonePresets: {
    id: AlignmentZoneMode;
    label: string;
    sublabel: string;
    icon: React.ElementType;
    boxStyle: string;
    tip: string;
  }[] = [
    {
      id: 'wound',
      label: isHindi ? 'घाव / त्वचा' : isMarathi ? 'जखम / त्वचा' : 'Wound & Skin',
      sublabel: isHindi ? 'चकत्ते, गांठ या घाव' : 'Lesion, rash or lump',
      icon: Activity,
      boxStyle: 'w-48 h-48 sm:w-56 sm:h-56 rounded-2xl',
      tip: isHindi
        ? 'प्रभावित घाव या त्वचा को हरे बॉक्स के बीच में रखें (30-40 सेमी दूरी)'
        : isMarathi
        ? 'बाधित जखम किंवा त्वचा हिरव्या चौकटीत मध्यभागी ठेवा'
        : 'Center the affected wound or skin lesion inside the green box (30-40 cm distance)',
    },
    {
      id: 'mouth_hoof',
      label: isHindi ? 'मुँह व खुर' : isMarathi ? 'तोंड आणि खूर' : 'Mouth & Hoofs',
      sublabel: isHindi ? 'लार, छाले या खुर' : 'Blisters, saliva or hoofs',
      icon: Focus,
      boxStyle: 'w-64 h-40 sm:w-72 sm:h-44 rounded-xl',
      tip: isHindi
        ? 'मुँह के छाले, लार या खुर के घाव को इस आयताकार फ्रेम में संरेखित करें'
        : isMarathi
        ? 'तोंडातील फोड किंवा खुराची जखम या फ्रेममध्ये ठेवा'
        : 'Align mouth sores, salivation, or hoof lesions in this horizontal frame',
    },
    {
      id: 'eyes',
      label: isHindi ? 'आँख व कान' : isMarathi ? 'डोळे आणि कान' : 'Eye & Mucosa',
      sublabel: isHindi ? 'सफेदी, पानी या सूजन' : 'Discharge, opacity or swelling',
      icon: Eye,
      boxStyle: 'w-44 h-44 sm:w-48 sm:h-48 rounded-full',
      tip: isHindi
        ? 'आँख की पुतली या पलक को गोलाकार सर्कल में सीधा केंद्रित करें'
        : isMarathi
        ? 'डोळ्याची बाहुली किंवा पापणी गोलाकार वर्तुळात केंद्रित करा'
        : 'Center the animal eye, cornea or eyelids inside the circular focus area',
    },
    {
      id: 'full',
      label: isHindi ? 'पूरा पशु' : isMarathi ? 'संपूर्ण जनावर' : 'Full Animal',
      sublabel: isHindi ? 'आकार, मुद्रा व पेट' : 'Posture, bloating & body',
      icon: Maximize2,
      boxStyle: 'w-72 h-48 sm:w-80 sm:h-52 rounded-2xl',
      tip: isHindi
        ? 'पूरे पशु की मुद्रा, पेट का फूलना या खड़े होने की स्थिति फ्रेम में लें'
        : isMarathi
        ? 'संपूर्ण जनावराची उभी राहण्याची पद्धत किंवा पोटाची स्थिती फ्रेममध्ये घ्या'
        : 'Frame entire animal body to evaluate posture, gait, or rumen bloat',
    },
  ];

  const currentZone = zonePresets.find((z) => z.id === activeZone) || zonePresets[0];

  const handleCaptureClick = () => {
    setIsCapturing(true);
    setTimeout(() => {
      onCapture();
      setIsCapturing(false);
    }, 150);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between overflow-hidden select-none">
      {/* Top Bar: Target Presets & Mode Selector */}
      <div className="p-3 bg-gradient-to-b from-black/85 via-black/50 to-transparent pointer-events-auto space-y-2">
        <div className="flex items-center justify-between gap-2">
          {/* AI Vision Mode Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>{isHindi ? 'AI विज़न अलाइनमेंट गाइड' : isMarathi ? 'AI व्हिजन अलाइनमेंट' : 'AI Vision Alignment'}</span>
          </div>

          {/* Quick Tools: Grid Toggle & Close */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1.5 rounded-lg text-xs font-semibold backdrop-blur-md transition ${
                showGrid
                  ? 'bg-emerald-500 text-stone-950 shadow-xs'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title={isHindi ? 'ग्रिड टॉगल करें' : 'Toggle Alignment Grid'}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>

            {hasMultipleCameras && onFlipCamera && (
              <button
                type="button"
                onClick={onFlipCamera}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs backdrop-blur-md transition"
                title={isHindi ? 'कैमरा बदलें' : 'Flip Camera'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs backdrop-blur-md transition"
              title={isHindi ? 'बंद करें' : 'Cancel'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Alignment Zone Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {zonePresets.map((preset) => {
            const Icon = preset.icon;
            const isActive = activeZone === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setActiveZone(preset.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-400 text-stone-950 shadow-md scale-105'
                    : 'bg-black/50 text-stone-200 hover:bg-black/70 border border-white/20'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Center Reticle / Target Viewfinder Frame */}
      <div className="relative flex-1 flex items-center justify-center pointer-events-none p-4">
        {/* Alignment Target Box with Dynamic Outline */}
        <div
          className={`relative border-2 border-dashed border-emerald-400/90 shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all duration-300 flex items-center justify-center ${currentZone.boxStyle}`}
        >
          {/* 4 Glowing L-Shaped Corner Brackets */}
          <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-md shadow-xs" />
          <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-md shadow-xs" />
          <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-md shadow-xs" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-md shadow-xs" />

          {/* Center Crosshairs (+) with Pulsing Center Dot */}
          <div className="relative flex items-center justify-center">
            <div className="w-6 h-[1.5px] bg-emerald-300/80" />
            <div className="h-6 w-[1.5px] bg-emerald-300/80 absolute" />
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute opacity-75" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-200 absolute" />
          </div>

          {/* Optional Rule-of-Thirds Grid Overlay */}
          {showGrid && (
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-25">
              <div className="border-r border-b border-emerald-200" />
              <div className="border-r border-b border-emerald-200" />
              <div className="border-b border-emerald-200" />
              <div className="border-r border-b border-emerald-200" />
              <div className="border-r border-b border-emerald-200" />
              <div className="border-b border-emerald-200" />
              <div className="border-r border-emerald-200" />
              <div className="border-r border-emerald-200" />
              <div />
            </div>
          )}

          {/* Target Zone Label Floating Tag */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-black/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold tracking-wider uppercase whitespace-nowrap shadow-sm">
            {currentZone.label}
          </div>
        </div>
      </div>

      {/* Bottom Bar: Guidance Banner & Capture Trigger */}
      <div className="p-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent pointer-events-auto space-y-3">
        {/* Real-time Guidance Banner */}
        <div className="max-w-md mx-auto px-3 py-1.5 rounded-xl bg-black/70 border border-white/15 backdrop-blur-md flex items-center justify-between gap-2 text-white text-[11px]">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Crosshair className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate text-stone-200 font-medium">
              {currentZone.tip}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-amber-300 shrink-0 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
            <Sun className="w-3 h-3 text-amber-400" />
            <span>{isHindi ? 'अच्छी रोशनी रखें' : 'Good light'}</span>
          </div>
        </div>

        {/* Shutter Capture Controls */}
        <div className="flex items-center justify-center gap-6 pb-1">
          {/* Cancel */}
          <button
            type="button"
            id="camera-overlay-cancel-btn"
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-md transition active:scale-95"
          >
            {isHindi ? 'रद्द करें' : isMarathi ? 'रद्द करा' : 'Cancel'}
          </button>

          {/* Main Shutter Button */}
          <button
            type="button"
            id="shutter-capture-btn"
            onClick={handleCaptureClick}
            disabled={isCapturing}
            className={`w-16 h-16 rounded-full bg-white border-4 border-emerald-500 shadow-2xl flex items-center justify-center transition transform active:scale-90 hover:scale-105 cursor-pointer ${
              isCapturing ? 'scale-95 bg-emerald-100' : ''
            }`}
            title={isHindi ? 'फोटो खींचें' : 'Take Photo'}
          >
            <div
              className={`w-10 h-10 rounded-full transition-all duration-150 ${
                isCapturing ? 'bg-emerald-800 scale-75' : 'bg-emerald-600'
              } flex items-center justify-center shadow-inner`}
            >
              <Camera className="w-5 h-5 text-white" />
            </div>
          </button>

          {/* Alignment Mode Quick Reset / Switch */}
          <button
            type="button"
            onClick={() => {
              const modes: AlignmentZoneMode[] = ['wound', 'mouth_hoof', 'eyes', 'full'];
              const nextIndex = (modes.indexOf(activeZone) + 1) % modes.length;
              setActiveZone(modes[nextIndex]);
            }}
            className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold backdrop-blur-md hover:bg-emerald-900/60 transition active:scale-95 flex items-center gap-1"
          >
            <Focus className="w-3.5 h-3.5" />
            <span>{isHindi ? 'फ्रेम बदलें' : 'Next Frame'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
