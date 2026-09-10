import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Stethoscope,
  Clock,
  Droplets,
  Utensils
} from 'lucide-react';
import { AnimalCategory, Language, AnimalProfile, HealthReport } from '../types';
import { translations, getTranslation } from '../i18n/translations';
import { CameraAlignmentOverlay } from './CameraAlignmentOverlay';
import { AnimalSelector } from './AnimalSelector';
import { ALL_SPECIES, getSymptomsForCategory, AnimalSpeciesDef } from '../data/animals';
import { compressImageFile } from '../utils/imageCompressor';
import { safeFetchJson, validateAndNormalizeAIResponse } from '../utils/aiAnalysisParser';

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

  // Form State: Animal
  const [selectedSpecies, setSelectedSpecies] = useState<string>(
    preselectedAnimal?.type || 'Cow'
  );
  const [selectedCategory, setSelectedCategory] = useState<AnimalCategory>(
    'livestock'
  );
  const [isDairyMammal, setIsDairyMammal] = useState<boolean>(true);
  const [customSpeciesName, setCustomSpeciesName] = useState<string>('');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(preselectedAnimal?.id || '');
  const [animalNameInput, setAnimalNameInput] = useState<string>(preselectedAnimal?.name || '');
  const [breedInput, setBreedInput] = useState<string>(preselectedAnimal?.breed || '');
  const [ageInput, setAgeInput] = useState<string>(preselectedAnimal?.age || '');
  const [sexInput, setSexInput] = useState<string>('Unknown');

  // Photo State
  const [inputMethod, setInputMethod] = useState<'upload' | 'camera' | 'symptoms_only'>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Symptoms State
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomDescription, setSymptomDescription] = useState<string>('');
  
  // Vitals & Clinical Observation State
  const [temperature, setTemperature] = useState<string>('Normal');
  const [behavior, setBehavior] = useState<string>('Active & Alert');
  const [appetite, setAppetite] = useState<string>('Normal');
  const [waterIntake, setWaterIntake] = useState<string>('Normal');
  const [milkProduction, setMilkProduction] = useState<string>('Normal');
  const [duration, setDuration] = useState<string>('1-2 days');

  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Dynamically load category-specific symptoms
  const categorySymptoms = useMemo(() => {
    return getSymptomsForCategory(selectedCategory);
  }, [selectedCategory]);

  // Handle species selection from AnimalSelector
  const handleSpeciesChange = (
    species: AnimalSpeciesDef | { id: string; name: string; category: AnimalCategory; emoji: string; isDairyMammal?: boolean }
  ) => {
    setSelectedSpecies(species.name);
    setSelectedCategory(species.category);
    setIsDairyMammal(Boolean(species.isDairyMammal));
  };

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

      const langCode = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
      recognition.lang = langCode;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSymptomDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
        setVoiceNotice(`Added note: "${transcript}"`);
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

  // Image compression & upload handler
  const processImageFile = async (file: File) => {
    setImageError(null);
    setIsProcessingImage(true);

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setImageError('Unsupported file format. Please upload JPG, PNG, or WebP.');
      setIsProcessingImage(false);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setImageError('Image file is too large. Please select a photo under 25MB.');
      setIsProcessingImage(false);
      return;
    }

    try {
      // Compress client-side to max 1280px to avoid huge base64 payload
      const compressedDataUrl = await compressImageFile(file, 1280, 0.82);
      setImagePreview(compressedDataUrl);
      stopCamera();
    } catch (err: any) {
      console.error('Image compression error:', err);
      setImageError('Failed to process image. Please try another photo.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Start Camera Stream
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

      cameraInputRef.current?.click();
    } catch (err: any) {
      console.warn('Camera stream error, falling back to native capture:', err);
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      } else {
        setImageError(
          language === 'hi'
            ? 'कैमरा शुरू नहीं हो सका। कृपया फोटो अपलोड करें।'
            : 'Unable to access device camera. Please upload an image file instead.'
        );
      }
      setIsCameraActive(false);
    }
  };

  const openNativeCamera = () => {
    setImageError(null);
    stopCamera();
    cameraInputRef.current?.click();
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;
      
      const maxDim = 1280;
      let finalW = width;
      let finalH = height;
      if (finalW > maxDim || finalH > maxDim) {
        if (finalW > finalH) {
          finalH = Math.round((finalH * maxDim) / finalW);
          finalW = maxDim;
        } else {
          finalW = Math.round((finalW * maxDim) / finalH);
          finalH = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = finalW;
      canvas.height = finalH;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, finalW, finalH);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setImagePreview(dataUrl);
        stopCamera();
      }
    } catch (e) {
      console.error('Capture photo canvas error:', e);
    }
  };

  const removePhoto = () => {
    setImagePreview(null);
    setImageError(null);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Run AI Health Analysis with strict error handling and safe JSON pipeline
  const handleRunAnalysis = async () => {
    setAnalysisError(null);

    // Resolve final species name
    const finalSpecies = (customSpeciesName.trim() || selectedSpecies).trim();
    if (!finalSpecies) {
      setAnalysisError('Please select or specify the animal species.');
      return;
    }

    // Validation: Require at least one symptom or image or clinical description
    if (inputMethod !== 'symptoms_only' && !imagePreview && selectedSymptoms.length === 0 && !symptomDescription.trim()) {
      setAnalysisError(
        language === 'hi'
          ? 'कृपया कम से कम एक लक्षण चुनें या पशु की फोटो अपलोड करें।'
          : 'Please add at least one symptom or upload an animal photo before starting the analysis.'
      );
      return;
    }

    if (inputMethod === 'symptoms_only' && selectedSymptoms.length === 0 && !symptomDescription.trim()) {
      setAnalysisError(
        language === 'hi'
          ? 'कृपया कम से कम एक लक्षण चुनें या विवरण लिखें।'
          : 'Please select at least one symptom or write a description of what you observe.'
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep(0);

    const timer1 = setTimeout(() => setAnalysisStep(1), 1200);
    const timer2 = setTimeout(() => setAnalysisStep(2), 2600);
    const timer3 = setTimeout(() => setAnalysisStep(3), 4200);

    try {
      const response = await safeFetchJson<{
        success: boolean;
        animalDetected?: boolean;
        message?: string;
        result?: any;
      }>('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: inputMethod !== 'symptoms_only' ? imagePreview : null,
          animalType: finalSpecies,
          animalCategory: selectedCategory,
          animalName: animalNameInput || `${finalSpecies} #${Math.floor(100 + Math.random() * 900)}`,
          breed: breedInput,
          age: ageInput,
          sex: sexInput,
          symptoms: selectedSymptoms,
          temperature: temperature,
          behavior: behavior,
          appetite: appetite,
          waterIntake: waterIntake,
          milkProduction: isDairyMammal ? milkProduction : 'Not Applicable',
          duration: duration,
          additionalInformation: symptomDescription,
          language: language,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      if (!response.ok || !response.data?.success) {
        const errorMsg =
          response.errorMessage ||
          response.data?.message ||
          'Unable to complete the health analysis right now. Please try again.';
        setAnalysisError(errorMsg);
        setIsAnalyzing(false);
        return;
      }

      // Validate & normalize AI result against strict schema
      const normalizedResult = validateAndNormalizeAIResponse(
        response.data.result,
        finalSpecies
      );

      // Save report to server API
      const reportPayload = {
        animalId: selectedAnimalId || undefined,
        animalName: animalNameInput || `${finalSpecies} #${Math.floor(100 + Math.random() * 900)}`,
        animalType: finalSpecies,
        photoUrl: imagePreview || undefined,
        symptoms: selectedSymptoms,
        temperature: temperature,
        behavior: behavior,
        additionalInfo: symptomDescription,
        result: normalizedResult,
      };

      const saveRes = await safeFetchJson<HealthReport>('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportPayload),
      });

      setIsAnalyzing(false);

      if (saveRes.ok && saveRes.data) {
        onAnalysisComplete(saveRes.data);
      } else {
        // Even if save API fails, show report to user immediately
        const fallbackReport: HealthReport = {
          id: `rep-${Date.now()}`,
          reportCode: `PC-${Math.floor(1000 + Math.random() * 9000)}`,
          userId: 'farmer-1',
          createdAt: new Date().toISOString(),
          ...reportPayload,
        };
        onAnalysisComplete(fallbackReport);
      }
    } catch (err: any) {
      console.error('Error running health analysis:', err);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setAnalysisError('Unable to complete the health analysis right now. Please try again.');
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3 shadow-2xs">
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Multimodal Veterinary Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          {t('heroHeadline')}
        </h1>
        <p className="mt-2 text-sm text-stone-600 max-w-xl mx-auto">
          {t('heroSubheading')}
        </p>
      </div>

      {/* Safety Alert Banner */}
      <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs sm:text-sm text-amber-900 shadow-2xs">
        <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Notice:</strong> {t('disclaimerShort')}
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* STEP 1: Comprehensive Animal Selection */}
          <section id="step-animal-selection">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs">
                  1
                </span>
                <span>
                  {language === 'hi'
                    ? 'पशु एवं प्रजाति का चयन करें (Animal Species)'
                    : language === 'mr'
                    ? 'जनावर व प्रजाती निवडा'
                    : 'Select Animal Species & Profile'}
                </span>
              </h2>

              {/* Link to existing registered animal profile */}
              {animals.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 hidden sm:inline">
                    {language === 'hi' ? 'पंजीकृत पशु:' : 'Registered Animal:'}
                  </span>
                  <select
                    id="select-existing-animal"
                    value={selectedAnimalId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedAnimalId(id);
                      const found = animals.find((a) => a.id === id);
                      if (found) {
                        setSelectedSpecies(found.type);
                        setAnimalNameInput(found.name);
                        if (found.breed) setBreedInput(found.breed);
                        if (found.age) setAgeInput(found.age);
                        // find species definition to check dairy
                        const spObj = ALL_SPECIES.find(
                          (s) => s.name.toLowerCase() === found.type.toLowerCase()
                        );
                        if (spObj) {
                          setSelectedCategory(spObj.category);
                          setIsDairyMammal(Boolean(spObj.isDairyMammal));
                        }
                      }
                    }}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-stone-300 bg-stone-50 text-stone-800 focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="">-- Choose registered animal --</option>
                    {animals.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.type} - {a.tagId || a.id.slice(0, 6)})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Modern Searchable & Categorized Animal Selector */}
            <AnimalSelector
              selectedSpecies={selectedSpecies}
              customSpeciesName={customSpeciesName}
              onSelectSpecies={handleSpeciesChange}
              onCustomSpeciesChange={(name) => {
                setCustomSpeciesName(name);
                setSelectedSpecies(name || 'Custom Animal');
              }}
              language={language}
            />

            {/* Animal Details: Name, Breed, Age, Sex */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-stone-100">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {language === 'hi' ? 'पशु का नाम / पहचान (वैकल्पिक)' : 'Animal Name / ID (Optional)'}
                </label>
                <input
                  type="text"
                  id="animal-name-field"
                  placeholder="e.g. Gauri, Bruno, Tag 402..."
                  value={animalNameInput}
                  onChange={(e) => setAnimalNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {language === 'hi' ? 'नस्ल (Breed - Optional)' : 'Breed (Optional)'}
                </label>
                <input
                  type="text"
                  id="animal-breed-field"
                  placeholder="e.g. Gir, Murrah, Labrador..."
                  value={breedInput}
                  onChange={(e) => setBreedInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {language === 'hi' ? 'उम्र (Age - Optional)' : 'Age (Optional)'}
                </label>
                <input
                  type="text"
                  id="animal-age-field"
                  placeholder="e.g. 2 years, 6 months..."
                  value={ageInput}
                  onChange={(e) => setAgeInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {language === 'hi' ? 'लिंग (Sex)' : 'Sex'}
                </label>
                <select
                  id="animal-sex-field"
                  value={sexInput}
                  onChange={(e) => setSexInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white shadow-2xs"
                >
                  <option value="Unknown">Unknown / Not Specified</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
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
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
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
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
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
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  inputMethod === 'symptoms_only'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>{t('photoMethodSymptomsOnly')}</span>
              </button>
            </div>

            {/* Image Error message */}
            {imageError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{imageError}</span>
              </div>
            )}

            {/* Photo Preview / Upload Area */}
            {inputMethod !== 'symptoms_only' && (
              <div>
                {isProcessingImage ? (
                  <div className="p-8 text-center rounded-2xl border border-stone-200 bg-stone-50">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-700 mx-auto mb-2" />
                    <p className="text-xs text-stone-600 font-medium">Optimizing photo for clinical analysis...</p>
                  </div>
                ) : imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 max-w-md mx-auto shadow-md">
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
                          ? 'प्रभावित अंग (घाव, मुंह, आंख, त्वचा या पूरा शरीर) का स्पष्ट फोटो लें।'
                          : 'Ensure good lighting on the affected area (lesions, posture, eyes, skin).'}
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
                <span>
                  {isListening
                    ? t('voiceListening')
                    : voiceSupported
                    ? (language === 'hi' ? 'बोलकर बताएं' : language === 'mr' ? 'आवाजाने सांगा' : 'Speak Symptoms')
                    : t('voiceUnavailable')}
                </span>
              </button>
            </div>

            {voiceNotice && (
              <div className="mb-3 text-xs text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                {voiceNotice}
              </div>
            )}

            {/* Dynamic Symptom Chips adapted to species category */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-stone-500 font-medium">
                  {language === 'hi'
                    ? `इस श्रेणी (${selectedCategory}) के लिए प्रमुख लक्षण:`
                    : `Common signs observed in ${selectedSpecies || 'this animal'}:`}
                </span>
                <span className="text-[11px] text-stone-400">
                  {selectedSymptoms.length} {language === 'hi' ? 'चुने गए' : 'selected'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {categorySymptoms.map((sym) => {
                  const label =
                    language === 'hi' ? sym.hindiLabel : language === 'mr' ? sym.marathiLabel : sym.label;
                  const isSelected = selectedSymptoms.includes(label);

                  return (
                    <button
                      key={sym.id}
                      type="button"
                      id={`symptom-chip-${sym.id}`}
                      onClick={() => toggleSymptom(label)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Symptom Text Description Area */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {language === 'hi'
                  ? 'अतिरिक्त लक्षण या आपकी टिप्पणियां (Optional Description):'
                  : 'Additional Symptoms or Farmer Notes (Optional):'}
              </label>
              <textarea
                id="symptom-description-field"
                rows={3}
                placeholder={
                  language === 'hi'
                    ? 'पशु के लक्षण विस्तार से लिखें या ऊपर दिए माइक बटन से बोलें...'
                    : 'Describe what you noticed (e.g. onset, stool consistency, abnormal posture, discharge)...'
                }
                value={symptomDescription}
                onChange={(e) => setSymptomDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent placeholder:text-stone-400 bg-white shadow-2xs"
              />
            </div>
          </section>

          <hr className="border-stone-100" />

          {/* STEP 4: Clinical Vitals & Behavior */}
          <section id="step-behavior">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs">
                4
              </span>
              <span>
                {language === 'hi'
                  ? 'शारीरिक स्थिति एवं व्यवहार (Vitals & Demeanor)'
                  : language === 'mr'
                  ? 'शारीरिक स्थिती व वर्तन'
                  : 'Clinical Vitals & Demeanor'}
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Temperature */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-stone-500" />
                  <span>{t('temperatureLabel')}</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
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
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-bold'
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
                <div className="grid grid-cols-2 gap-1.5">
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
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {beh.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Appetite */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-stone-500" />
                  <span>{language === 'hi' ? 'भूख (Appetite)' : 'Appetite'}</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'Normal', label: 'Normal' },
                    { id: 'Reduced / Picky', label: 'Reduced' },
                    { id: 'Completely off-feed / None', label: 'Off-feed' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAppetite(item.id)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition text-center ${
                        appetite === item.id
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Water Intake */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-stone-500" />
                  <span>{language === 'hi' ? 'पानी पीना (Water Intake)' : 'Water Intake'}</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'Normal', label: 'Normal' },
                    { id: 'Drinking excessively', label: 'Excessive' },
                    { id: 'Reduced / Not drinking', label: 'Reduced' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setWaterIntake(item.id)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition text-center ${
                        waterIntake === item.id
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration of Signs */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  <span>{language === 'hi' ? 'बीमारी की अवधि (Duration)' : 'Duration of Signs'}</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'Today (acute)', label: 'Today' },
                    { id: '1-2 days', label: '1-2 days' },
                    { id: '3-7 days', label: '3-7 days' },
                  ].map((dur) => (
                    <button
                      key={dur.id}
                      type="button"
                      onClick={() => setDuration(dur.id)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition text-center ${
                        duration === dur.id
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Milk Production (Only visible if Dairy Mammal) */}
              {isDairyMammal && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                    <span className="text-xs">🥛</span>
                    <span>{language === 'hi' ? 'दूध उत्पादन (Milk Drop)' : 'Milk Production'}</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'Normal', label: 'Normal' },
                      { id: 'Reduced', label: 'Reduced' },
                      { id: 'Abnormal / Blood or Clots', label: 'Abnormal' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setMilkProduction(item.id)}
                        className={`p-2 rounded-xl text-xs font-semibold border transition text-center ${
                          milkProduction === item.id
                            ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-bold'
                            : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Analysis Error Display with prominent Try Again button */}
          {analysisError && (
            <div
              id="analysis-error-banner"
              className="p-4 sm:p-5 rounded-2xl bg-red-50 border border-red-200 text-red-900 space-y-3 shadow-xs"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong className="block text-sm font-bold text-red-900">
                    {language === 'hi' ? 'स्वास्थ्य विश्लेषण पूरा नहीं हो सका' : 'Analysis Could Not Proceed'}
                  </strong>
                  <p className="mt-1 text-xs sm:text-sm text-red-800 leading-relaxed">
                    {analysisError}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pl-8 pt-1">
                <button
                  type="button"
                  id="analysis-try-again-btn"
                  onClick={handleRunAnalysis}
                  className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'पुनः प्रयास करें (Try Again)' : 'Try Again'}</span>
                </button>
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
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-white text-base shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
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
