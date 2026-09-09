import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Mic,
  MicOff,
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Thermometer,
  Activity,
  Sparkles,
  Info,
  ChevronRight,
  Stethoscope
} from 'lucide-react';
import { SupportedAnimalType, Language, AnimalProfile, HealthReport } from '../types';
import { translations, getTranslation } from '../i18n/translations';
import { CameraAlignmentOverlay } from './CameraAlignmentOverlay';

interface HealthCheckFormProps {
  language: Language;
  animals: AnimalProfile[];
  onAnalysisComplete: (report: HealthReport) => void;
  preselectedAnimal?: AnimalProfile | null;
}

export const HealthCheckForm: React.FC<HealthCheckFormProps> = ({
  language,
  animals,
  onAnalysisComplete,
  preselectedAnimal,
}) => {
  const t = (key: keyof typeof translations['en']) => getTranslation(language, key);

  // Form State
  const [selectedAnimalType, setSelectedAnimalType] = useState<SupportedAnimalType>(
    preselectedAnimal?.type || 'Cow'
  );
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(preselectedAnimal?.id || '');
  const [animalNameInput, setAnimalNameInput] = useState<string>(preselectedAnimal?.name || '');

  // Photo State
  const [inputMethod, setInputMethod] = useState<'upload' | 'camera' | 'symptoms_only'>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Symptoms State
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomDescription, setSymptomDescription] = useState<string>('');
  const [temperature, setTemperature] = useState<string>('Normal');
  const [behavior, setBehavior] = useState<string>('Active & Alert');

  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Available standard symptoms
  const symptomList = [
    { id: 'fever', label: t('symptomFever') },
    { id: 'appetite', label: t('symptomLossOfAppetite') },
    { id: 'cough', label: t('symptomCoughing') },
    { id: 'breathing', label: t('symptomDifficultyBreathing') },
    { id: 'nasal', label: t('symptomNasalDischarge') },
    { id: 'eye', label: t('symptomEyeDischarge') },
    { id: 'skin', label: t('symptomSkinProblems') },
    { id: 'hair', label: t('symptomHairLoss') },
    { id: 'swelling', label: t('symptomSwelling') },
    { id: 'wounds', label: t('symptomWounds') },
    { id: 'diarrhea', label: t('symptomDiarrhea') },
    { id: 'vomiting', label: t('symptomVomiting') },
    { id: 'weakness', label: t('symptomWeakness') },
    { id: 'milk', label: t('symptomReducedMilk') },
    { id: 'walking', label: t('symptomDifficultyWalking') },
    { id: 'behavior', label: t('symptomAbnormalBehavior') },
    { id: 'scratching', label: t('symptomExcessiveScratching') },
    { id: 'other', label: t('symptomOther') },
  ];

  // Set up speech recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      // Language code for speech
      const langCode = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
      recognition.lang = langCode;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSymptomDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
        setVoiceNotice(`Added voice note: "${transcript}"`);
        setTimeout(() => setVoiceNotice(null), 4000);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setVoiceNotice(t('voiceUnavailable'));
        setTimeout(() => setVoiceNotice(null), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      setVoiceSupported(false);
    }

    return () => {
      stopCamera();
    };
  }, [language]);

  // Voice toggle
  const toggleVoiceInput = () => {
    if (!voiceSupported) {
      setVoiceNotice(t('voiceUnavailable'));
      setTimeout(() => setVoiceNotice(null), 4000);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        const langCode = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
        if (recognitionRef.current) {
          recognitionRef.current.lang = langCode;
          recognitionRef.current.start();
          setIsListening(true);
          setVoiceNotice(t('voiceListening'));
        }
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        setIsListening(false);
      }
    }
  };

  // Toggle symptom chip
  const toggleSymptom = (label: string) => {
    if (selectedSymptoms.includes(label)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== label));
    } else {
      setSelectedSymptoms([...selectedSymptoms, label]);
    }
  };

  // Image validation & upload handler
  const processImageFile = (file: File) => {
    setImageError(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setImageError('Unsupported file format. Please upload JPG, PNG, or WebP.');
      return;
    }

    // Validate size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setImageError('Image file is too large. Please select a photo under 15MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      stopCamera();
    };
    reader.onerror = () => {
      setImageError('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Start Camera Stream with resilient fallbacks for mobile & desktop
  const startCamera = async () => {
    setImageError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        let stream: MediaStream | null = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } },
          });
        } catch (initialErr) {
          console.warn('FacingMode environment failed, trying standard video:', initialErr);
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
        }

        if (stream) {
          mediaStreamRef.current = stream;
          setIsCameraActive(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch((playErr) => console.warn('Video play err:', playErr));
          }
          return;
        }
      }

      // If getUserMedia is blocked or unsupported, open native mobile camera
      cameraInputRef.current?.click();
    } catch (err: any) {
      console.warn('Camera stream error, falling back to native capture:', err);
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      } else {
        setImageError(
          language === 'hi'
            ? 'कैमरा शुरू नहीं हो सका। कृपया फोटो अपलोड करें या सीधे फाइल चुनें।'
            : 'Unable to access device camera. Please upload an image file instead.'
        );
      }
      setIsCameraActive(false);
    }
  };

  // Direct native mobile phone camera shutter
  const openNativeCamera = () => {
    setImageError(null);
    stopCamera();
    cameraInputRef.current?.click();
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture Photo from Video
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setImagePreview(dataUrl);
      stopCamera();
    }
  };

  // Remove Photo
  const removePhoto = () => {
    setImagePreview(null);
    setImageError(null);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Run AI Health Analysis
  const handleRunAnalysis = async () => {
    setAnalysisError(null);

    // Validation
    if (inputMethod !== 'symptoms_only' && !imagePreview && selectedSymptoms.length === 0) {
      setAnalysisError('Please provide either an animal photo or select at least one observed symptom.');
      return;
    }

    if (selectedSymptoms.length === 0 && !imagePreview && !symptomDescription) {
      setAnalysisError('Please select observed symptoms or describe what you notice about the animal.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep(0);

    // Dynamic loading step simulation while API generates
    const timer1 = setTimeout(() => setAnalysisStep(1), 1200);
    const timer2 = setTimeout(() => setAnalysisStep(2), 2600);
    const timer3 = setTimeout(() => setAnalysisStep(3), 4200);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imagePreview,
          animalType: selectedAnimalType,
          symptoms: selectedSymptoms,
          temperature: temperature,
          behavior: behavior,
          additionalInformation: symptomDescription,
          language: language,
        }),
      });

      const data = await response.json();

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      if (!response.ok) {
        if (data.error === 'AI_NOT_CONFIGURED') {
          setAnalysisError(
            'The Gemini AI API key is not configured. Please add your GEMINI_API_KEY in the AI Studio Settings > Secrets panel.'
          );
        } else {
          setAnalysisError(data.message || 'AI analysis could not be completed. Please try again.');
        }
        setIsAnalyzing(false);
        return;
      }

      if (data.success === false && data.animalDetected === false) {
        setAnalysisError(data.message);
        setIsAnalyzing(false);
        return;
      }

      // Save report via API
      const reportPayload = {
        animalId: selectedAnimalId || undefined,
        animalName: animalNameInput || `${selectedAnimalType} #${Math.floor(100 + Math.random() * 900)}`,
        animalType: selectedAnimalType,
        photoUrl: imagePreview || undefined,
        symptoms: selectedSymptoms,
        temperature: temperature,
        behavior: behavior,
        additionalInfo: symptomDescription,
        result: data.result,
      };

      const saveRes = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportPayload),
      });

      const savedReport = await saveRes.json();
      setIsAnalyzing(false);
      onAnalysisComplete(savedReport);
    } catch (err: any) {
      console.error('Error running analysis:', err);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setAnalysisError(
        err.message || 'Network connection failed. Check your internet connection and try again.'
      );
      setIsAnalyzing(false);
    }
  };

  const loadingMessages = [
    t('loading1'),
    t('loading2'),
    t('loading3'),
    t('loading4'),
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Multimodal Veterinary Vision Assessment</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          {t('heroHeadline')}
        </h1>
        <p className="mt-2 text-sm text-stone-600 max-w-xl mx-auto">
          {t('heroSubheading')}
        </p>
      </div>

      {/* Safety Alert Banner */}
      <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs sm:text-sm text-amber-900">
        <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Notice:</strong> {t('disclaimerShort')}
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* STEP 1: Animal Selection */}
          <section id="step-animal-selection">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs">
                  1
                </span>
                {t('checkStep1Header')}
              </h2>

              {/* Link to existing registered animal if any */}
              {animals.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 hidden sm:inline">{t('photoSelectedAnimalFromList')}</span>
                  <select
                    id="select-existing-animal"
                    value={selectedAnimalId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedAnimalId(id);
                      const found = animals.find((a) => a.id === id);
                      if (found) {
                        setSelectedAnimalType(found.type);
                        setAnimalNameInput(found.name);
                      }
                    }}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-stone-300 bg-stone-50 text-stone-800"
                  >
                    <option value="">-- Choose registered animal --</option>
                    {animals.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.type} - {a.tagId})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Animal Category Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['Cow', 'Buffalo', 'Goat', 'Sheep'] as SupportedAnimalType[]).map((type) => {
                const isSelected = selectedAnimalType === type;
                const label =
                  type === 'Cow'
                    ? t('animalCow')
                    : type === 'Buffalo'
                    ? t('animalBuffalo')
                    : type === 'Goat'
                    ? t('animalGoat')
                    : t('animalSheep');

                return (
                  <button
                    key={type}
                    type="button"
                    id={`animal-btn-${type.toLowerCase()}`}
                    onClick={() => setSelectedAnimalType(type)}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-900 shadow-xs font-bold'
                        : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100 text-stone-700 font-medium'
                    }`}
                  >
                    <span className="text-2xl">
                      {type === 'Cow' ? '🐄' : type === 'Buffalo' ? '🐃' : type === 'Goat' ? '🐐' : '🐑'}
                    </span>
                    <span className="text-sm">{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Animal Name / Identification tag */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Animal Name / Identifier (Optional)
                </label>
                <input
                  type="text"
                  id="animal-name-field"
                  placeholder="e.g. Gauri, Lakshmi, Tag 409..."
                  value={animalNameInput}
                  onChange={(e) => setAnimalNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          <hr className="border-stone-100" />

          {/* STEP 2: Photo Input Method */}
          <section id="step-photo-input">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs">
                2
              </span>
              {t('checkStep2Header')}
            </h2>

            {/* Method Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                type="button"
                id="photo-tab-upload"
                onClick={() => {
                  setInputMethod('upload');
                  stopCamera();
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                  inputMethod === 'upload'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>{t('photoMethodUpload')}</span>
              </button>

              <button
                type="button"
                id="photo-tab-camera"
                onClick={() => {
                  setInputMethod('camera');
                  startCamera();
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                  inputMethod === 'camera'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>{t('photoMethodCamera')}</span>
              </button>

              <button
                type="button"
                id="photo-tab-symptoms-only"
                onClick={() => {
                  setInputMethod('symptoms_only');
                  removePhoto();
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                  inputMethod === 'symptoms_only'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>{t('photoMethodSymptomsOnly')}</span>
              </button>
            </div>

            {/* Error in image */}
            {imageError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{imageError}</span>
              </div>
            )}

            {/* Photo Preview / Upload Area */}
            {inputMethod !== 'symptoms_only' && (
              <div>
                {imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 max-w-md mx-auto">
                    <img
                      src={imagePreview}
                      alt="Animal Preview"
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 flex items-center justify-between">
                      <span className="text-white text-xs font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        {t('photoPreview')}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          id="retake-photo-btn"
                          onClick={() => {
                            if (inputMethod === 'camera') startCamera();
                            else fileInputRef.current?.click();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/20 text-white hover:bg-white/30 text-xs font-medium backdrop-blur-xs flex items-center gap-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>{t('photoRetake')}</span>
                        </button>
                        <button
                          type="button"
                          id="remove-photo-btn"
                          onClick={removePhoto}
                          className="p-1 rounded-lg bg-red-600/80 hover:bg-red-700 text-white text-xs backdrop-blur-xs"
                          title={t('photoRemove')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : isCameraActive ? (
                  <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-black max-w-md mx-auto aspect-[3/4] sm:aspect-[4/5] max-h-[520px] shadow-2xl">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <CameraAlignmentOverlay
                      language={language}
                      onCapture={capturePhoto}
                      onCancel={stopCamera}
                    />
                  </div>
                ) : inputMethod === 'camera' ? (
                  <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-6 sm:p-8 text-center bg-emerald-50/40 space-y-4">
                    <input
                      ref={cameraInputRef}
                      type="file"
                      id="animal-camera-native-input"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          processImageFile(e.target.files[0]);
                        }
                      }}
                    />
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
                      <Camera className="w-7 h-7" />
                    </div>
                    <div className="max-w-sm mx-auto">
                      <h3 className="text-sm sm:text-base font-extrabold text-stone-900">
                        {language === 'hi' ? 'पशु का फोटो खींचें' : language === 'mr' ? 'जनावराचा फोटो काढा' : 'Capture Animal Photo'}
                      </h3>
                      <p className="text-xs text-stone-600 mt-1">
                        {language === 'hi' 
                          ? 'प्रभावित अंग (घाव, मुंह, खुर, आंख या त्वचा) का स्पष्ट और साफ फोटो लें।'
                          : 'Ensure good lighting on the affected area (mouth, hooves, skin lesions).'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        id="btn-open-live-camera"
                        onClick={startCamera}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-xs transition"
                      >
                        <Camera className="w-4 h-4" />
                        <span>{language === 'hi' ? 'लाइव कैमरा चालू करें' : 'Open Live Camera'}</span>
                      </button>

                      <button
                        type="button"
                        id="btn-open-mobile-shutter"
                        onClick={openNativeCamera}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-900 font-bold text-xs sm:text-sm shadow-2xs transition"
                      >
                        <span>{language === 'hi' ? 'फ़ोन कैमरा खोलें' : 'Phone Camera App'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-stone-300 hover:border-emerald-600 rounded-2xl p-8 text-center cursor-pointer bg-stone-50/50 hover:bg-emerald-50/30 transition group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="animal-image-file-input"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          processImageFile(e.target.files[0]);
                        }
                      }}
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      id="animal-camera-native-fallback"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          processImageFile(e.target.files[0]);
                        }
                      }}
                    />
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-stone-800">
                      {t('photoDragDrop')}
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      {t('photoQualityHint')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          <hr className="border-stone-100" />

          {/* STEP 3: Symptoms & Voice Input */}
          <section id="step-symptoms">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs">
                  3
                </span>
                {t('checkStep3Header')}
              </h2>

              {/* Voice button */}
              <button
                type="button"
                id="voice-symptom-btn"
                onClick={toggleVoiceInput}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-xs ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isListening ? t('voiceStop') : 'Voice Input (हिंदी/मराठी/EN)'}</span>
              </button>
            </div>

            {/* Voice Notice Toast */}
            {voiceNotice && (
              <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                <span>{voiceNotice}</span>
              </div>
            )}

            {/* Symptom Chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {symptomList.map((symp) => {
                const isChecked = selectedSymptoms.includes(symp.label);
                return (
                  <button
                    key={symp.id}
                    type="button"
                    id={`symptom-chip-${symp.id}`}
                    onClick={() => toggleSymptom(symp.label)}
                    className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition border ${
                      isChecked
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    {isChecked ? '✓ ' : '+ '}
                    {symp.label}
                  </button>
                );
              })}
            </div>

            {/* Free text symptom description */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Describe Symptoms in Detail / Voice Output:
              </label>
              <textarea
                id="symptom-description-textarea"
                rows={3}
                value={symptomDescription}
                onChange={(e) => setSymptomDescription(e.target.value)}
                placeholder={t('symptomDescriptionPlaceholder')}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent placeholder:text-stone-400"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                {t('voiceInputPrompt')}
              </p>
            </div>
          </section>

          <hr className="border-stone-100" />

          {/* STEP 4: Vitals & Behavior */}
          <section id="step-vitals">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs">
                4
              </span>
              {t('checkStep4Header')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Temperature */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-stone-500" />
                  <span>{t('temperatureLabel')}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Normal', label: t('temperatureNormal') },
                    { id: 'Mild Fever / Warm', label: t('temperatureWarm') },
                    { id: 'High Fever / Very Hot', label: t('temperatureHigh') },
                  ].map((temp) => (
                    <button
                      key={temp.id}
                      type="button"
                      id={`temp-${temp.id.split(' ')[0].toLowerCase()}`}
                      onClick={() => setTemperature(temp.id)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition text-center ${
                        temperature === temp.id
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {temp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Behavior */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-stone-500" />
                  <span>{t('behaviorLabel')}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Active & Alert', label: t('behaviorActive') },
                    { id: 'Dull / Sluggish', label: t('behaviorDull') },
                    { id: 'Unable or unwilling to stand', label: t('behaviorLyingDown') },
                    { id: 'Restless / Agitated', label: t('behaviorRestless') },
                  ].map((beh) => (
                    <button
                      key={beh.id}
                      type="button"
                      id={`behavior-${beh.id.split(' ')[0].toLowerCase()}`}
                      onClick={() => setBehavior(beh.id)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition text-center ${
                        behavior === beh.id
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {beh.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Analysis Error Display */}
          {analysisError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Analysis Could Not Proceed</strong>
                <p className="mt-0.5">{analysisError}</p>
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="button"
              id="start-ai-analysis-btn"
              disabled={isAnalyzing}
              onClick={handleRunAnalysis}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-white text-base shadow-md transition flex items-center justify-center gap-2 ${
                isAnalyzing
                  ? 'bg-stone-400 cursor-not-allowed'
                  : 'bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99]'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{loadingMessages[analysisStep] || t('analyzingTitle')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-emerald-200" />
                  <span>{t('analyzeBtn')}</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
