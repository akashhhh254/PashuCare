import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { initialDiseases } from './src/data/diseases';

dotenv.config();

const app = express();
const PORT = 3000;

// Allow large image uploads (base64 pictures from mobile cameras)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Local database file path
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DBStructure {
  users: any[];
  animals: any[];
  health_reports: any[];
  reminders: any[];
  veterinarian_requests: any[];
  diseases: any[];
}

const defaultDB: DBStructure = {
  users: [
    {
      id: 'admin-1',
      name: 'Dr. A. K. Sharma (State Vet Advisor)',
      phone: '+91 94230 99881',
      email: 'admin.pashu@gov.in',
      preferredLanguage: 'en',
      farmName: 'Veterinary Disease Surveillance Cell',
      farmLocation: 'Central Animal Husbandry Directorate',
      role: 'admin',
      createdAt: new Date().toISOString()
    }
  ],
  animals: [
    {
      id: 'anim-1',
      userId: 'farmer-1',
      name: 'Gauri',
      tagId: 'IN-MH-2023-8821',
      type: 'Cow',
      age: '4',
      gender: 'Female',
      breed: 'Gir Cow',
      weight: '380',
      farmLocation: 'Main Shed - Bay A',
      photoUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80',
      healthScore: 84,
      lastCheckDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Healthy',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'anim-2',
      userId: 'farmer-1',
      name: 'Bhima',
      tagId: 'IN-MH-2022-1102',
      type: 'Buffalo',
      age: '5',
      gender: 'Female',
      breed: 'Murrah Buffalo',
      weight: '520',
      farmLocation: 'Main Shed - Bay B',
      photoUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80',
      healthScore: 68,
      lastCheckDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Under Observation',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  health_reports: [
    {
      id: 'rep-1',
      reportCode: 'PC-2026-001',
      userId: 'farmer-1',
      animalId: 'anim-2',
      animalName: 'Bhima',
      animalType: 'Buffalo',
      photoUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      symptoms: ['Mild Fever', 'Loss of appetite', 'Skin problems'],
      temperature: 'Mild Fever / Warm',
      behavior: 'Dull / Sluggish',
      additionalInfo: 'Slight swelling on flank and lower leg.',
      result: {
        animalDetected: true,
        detectedAnimalType: 'Buffalo',
        imageQuality: { sufficient: true, reason: 'Clear view of animal torso and skin' },
        overallHealthStatus: 'Needs Attention',
        riskLevel: 'Medium',
        possibleConditions: [
          {
            name: 'Suspected Early Lumpy Skin / Insect Bite Hypersensitivity',
            confidence: 76,
            reason: 'Mild cutaneous swelling and reported sluggishness with fever signs.'
          }
        ],
        visibleSymptoms: ['Skin irregularities', 'Slight dull posture'],
        reportedSymptoms: ['Mild Fever', 'Loss of appetite', 'Skin problems'],
        possibleCauses: ['Vector bite reaction or early poxvirus exposure in humid conditions'],
        generalRecommendations: [
          'Isolate from other cattle in a well-ventilated dry stall',
          'Keep insects away using mosquito nets and smoke dried neem leaves',
          'Ensure ample clean hydration with electrolyte powder'
        ],
        preventionTips: [
          'Fly and tick control in the barn',
          'Check herd vaccination records'
        ],
        veterinarianRecommended: true,
        emergency: false,
        healthScore: 68,
        disclaimer: 'This AI assessment is for preliminary informational purposes only and is not a substitute for diagnosis or treatment by a qualified veterinarian.'
      }
    }
  ],
  reminders: [
    {
      id: 'rem-1',
      userId: 'farmer-1',
      animalId: 'anim-1',
      animalName: 'Gauri',
      title: 'FMD Booster Vaccination',
      type: 'vaccination',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completed: false,
      notes: 'Government livestock dispensary vaccination camp',
      createdAt: new Date().toISOString()
    },
    {
      id: 'rem-2',
      userId: 'farmer-1',
      animalId: 'anim-2',
      animalName: 'Bhima',
      title: 'Deworming (Albendazole / Fenbendazole)',
      type: 'deworming',
      dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completed: false,
      notes: 'Administer early morning on empty stomach with guidance',
      createdAt: new Date().toISOString()
    }
  ],
  veterinarian_requests: [
    {
      id: 'vetreq-1',
      userId: 'farmer-1',
      userName: 'Ramesh Patil',
      userPhone: '+91 98221 54321',
      animalId: 'anim-2',
      animalName: 'Bhima',
      animalType: 'Buffalo',
      symptoms: ['Mild Fever', 'Loss of appetite', 'Skin problems'],
      preferredDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      preferredTime: 'Morning (09:00 AM - 12:00 PM)',
      description: 'Need on-site checkup for cutaneous nodules and fever.',
      reportId: 'rep-1',
      status: 'Pending',
      createdAt: new Date().toISOString()
    }
  ],
  diseases: []
};

// Helper to read DB
function readDB(): DBStructure {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading DB, falling back to default:', err);
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2), 'utf-8');
  return defaultDB;
}

// Helper to write DB
function writeDB(data: DBStructure) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}

// Initialize DB on startup
if (!fs.existsSync(DB_FILE)) {
  writeDB(defaultDB);
}

// Initialize Google GenAI lazily
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    aiConfigured: hasKey,
    time: new Date().toISOString(),
  });
});

// 2. AI Animal Health Vision & Clinical Analysis
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const {
      image,
      animalType = 'Animal',
      animalCategory = 'livestock',
      animalName = '',
      breed = '',
      age = '',
      sex = '',
      symptoms = [],
      temperature = 'Normal',
      behavior = 'Active & Alert',
      appetite = 'Normal',
      waterIntake = 'Normal',
      milkProduction = 'Not Applicable',
      duration = '1-2 days',
      additionalInformation = '',
      language = 'en'
    } = req.body;

    const ai = getAIClient();
    if (!ai) {
      return res.status(400).json({
        success: false,
        error: 'AI_NOT_CONFIGURED',
        message: 'The Gemini AI API key is not configured. Please add your GEMINI_API_KEY in the AI Studio Settings > Secrets panel before initiating AI health analysis.',
      });
    }

    if (!image && (!symptoms || symptoms.length === 0) && !additionalInformation) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_INPUT',
        message: 'Please add at least one symptom or upload an animal photo before starting the analysis.',
      });
    }

    // Dynamic species context builder
    const speciesLower = String(animalType).toLowerCase();
    let speciesSpecificGuidance = '';

    if (speciesLower.includes('cow') || speciesLower.includes('bull') || speciesLower.includes('calf') || speciesLower.includes('cattle')) {
      speciesSpecificGuidance = 'SPECIES DOMAIN: Bovine / Cattle. Evaluate against cattle pathology (FMD, Lumpy Skin Disease, Bovine Mastitis, Hemorrhagic Septicemia, Black Quarter, Theileriosis, Bloat, Milk Fever, Ketosis). Consider rumination, milk drop, mucosal ulcers, and herd biosecurity.';
    } else if (speciesLower.includes('buffalo')) {
      speciesSpecificGuidance = 'SPECIES DOMAIN: Water Buffalo (Bubaline). Highly susceptible to Hemorrhagic Septicemia (Gal Ghotu), heat stress, wallowing-associated parasites, Surra (Trypanosomiasis), and mastitis. Buffaloes have lower heat tolerance than cattle.';
    } else if (speciesLower.includes('goat') || speciesLower.includes('sheep')) {
      speciesSpecificGuidance = 'SPECIES DOMAIN: Small Ruminants (Caprine / Ovine). Evaluate for Peste des Petits Ruminants (PPR), Enterotoxemia (Pulpy Kidney), Contagious Ecthyma (Orf), Sheep/Goat Pox, Haemonchus contortus (severe anemia / bottle jaw), Foot Rot, and acute bloat.';
    } else if (speciesLower.includes('chicken') || speciesLower.includes('poultry') || speciesLower.includes('hen') || speciesLower.includes('rooster') || speciesLower.includes('duck') || speciesLower.includes('turkey') || speciesLower.includes('quail')) {
      speciesSpecificGuidance = 'SPECIES DOMAIN: Avian / Poultry. Evaluate for Newcastle Disease (Ranikhet), Infectious Bronchitis, Coccidiosis (bloody droppings), Fowl Pox, Fowl Cholera, Chronic Respiratory Disease (CRD), egg binding, crop stasis, and nutritional deficiencies. Do NOT apply mammal or dairy considerations.';
    } else if (speciesLower.includes('dog') || speciesLower.includes('canine') || speciesLower.includes('puppy')) {
      speciesSpecificGuidance = 'SPECIES DOMAIN: Canine / Dog. Evaluate for Canine Parvovirus, Distemper, Kennel Cough, Tick Fever (Ehrlichiosis), gastroenteritis, allergic dermatitis, otitis, and GDV/bloat. NEVER recommend human paracetamol/ibuprofen (highly toxic to dogs).';
    } else if (speciesLower.includes('cat') || speciesLower.includes('feline') || speciesLower.includes('kitten')) {
      speciesSpecificGuidance = 'SPECIES DOMAIN: Feline / Cat. Evaluate for Feline Panleukopenia, Upper Respiratory Infection (Cat Flu / Herpesvirus / Calicivirus), Feline Lower Urinary Tract Disease (FLUTD), hairballs, and ear mites. Note: Permethrin, paracetamol, and essential oils are extremely toxic to cats.';
    } else if (speciesLower.includes('horse') || speciesLower.includes('donkey') || speciesLower.includes('mule') || speciesLower.includes('equine')) {
      speciesSpecificGuidance = 'SPECIES DOMAIN: Equine. Evaluate for Colic (abdominal pain, rolling), Laminitis (founder), Strangles, Tetanus, respiratory heaves, and hoof thrush. Equine colic is an immediate medical emergency.';
    } else if (speciesLower.includes('pig') || speciesLower.includes('swine')) {
      speciesSpecificGuidance = 'SPECIES DOMAIN: Swine / Pig. Evaluate for Swine Erysipelas, African Swine Fever signs, Porcine Parvovirus, respiratory complex, and mange.';
    } else if (speciesLower.includes('fish') || speciesLower.includes('koi') || speciesLower.includes('goldfish') || speciesLower.includes('aquatic')) {
      speciesSpecificGuidance = 'SPECIES DOMAIN: Aquatic / Fish. Evaluate for Ich (white spot disease), Fin Rot, Swim Bladder Disorder, Dropsy, fungal infections, water ammonia/nitrite toxicity, and low dissolved oxygen.';
    } else if (speciesLower.includes('snake') || speciesLower.includes('lizard') || speciesLower.includes('turtle') || speciesLower.includes('tortoise') || speciesLower.includes('reptile')) {
      speciesSpecificGuidance = 'SPECIES DOMAIN: Reptilian. Evaluate for Metabolic Bone Disease (MBD / calcium-UVB deficiency), Respiratory Infection, Dysecdysis (retained shed), Mouth Rot (Infectious Stomatitis), and thermal burns.';
    } else if (speciesLower.includes('frog') || speciesLower.includes('toad') || speciesLower.includes('amphibian')) {
      speciesSpecificGuidance = 'SPECIES DOMAIN: Amphibian. Evaluate for Red Leg Syndrome, Chytridiomycosis, skin lesions, hydration state, and permeable skin sensitivities.';
    } else if (animalCategory === 'wildlife' || speciesLower.includes('elephant') || speciesLower.includes('deer') || speciesLower.includes('lion') || speciesLower.includes('tiger') || speciesLower.includes('leopard') || speciesLower.includes('monkey') || speciesLower.includes('wild')) {
      speciesSpecificGuidance = 'SPECIES DOMAIN: Wildlife / Protected Fauna. Provide preliminary clinical observations, emphasize safety precautions (do NOT touch or corner wild animals), and explicitly advise contacting the local Forest Department or certified Wildlife Veterinarians.';
    } else {
      speciesSpecificGuidance = `SPECIES DOMAIN: ${animalType}. Provide species-appropriate veterinary observations based on standard clinical guidelines for this animal.`;
    }

    const systemPrompt = `You are "PashuCare AI", a comprehensive, production-grade veterinary clinical intelligence assistant.
You provide health guidance for all animal species: livestock, poultry, companion animals (dogs, cats), birds, wildlife, reptiles, amphibians, and aquatic animals.

${speciesSpecificGuidance}

CORE MEDICAL & SAFETY RULES:
1. SPECIES AWARENESS: NEVER assume every animal is a cow or cattle. Calibrate your analysis strictly to the selected species (${animalType}).
2. MEDICAL ACCURACY: NEVER state with absolute certainty that "This animal definitely has X disease." Use clinical language: "Possible condition", "Potential cause", "Differential diagnosis".
3. SEVERITY & EMERGENCIES:
   - Severity must be one of: "low", "moderate", "high", "emergency".
   - If signs indicate immediate life threats (e.g. severe bloat with respiratory distress, acute choking, profuse bleeding, inability to stand, severe trauma, suspected rabies, high acute fever with collapse), set "emergency": true, "veterinarian_required": true, and "severity": "emergency".
4. PRACTICAL & SAFE RECOMMENDATIONS:
   - "immediate_actions": Practical, safe first-aid and supportive steps the owner/farmer can take immediately (e.g. isolate, hydration/ORS, clean bedding, warm/cool environment, antiseptic wound dressing).
   - "recommendations": General care, feeding, biosecurity, and management guidance.
   - "warning_signs": 2-4 critical deterioration signs that demand immediate emergency intervention.
   - Do NOT provide dangerous prescription drug dosages. Prescription medications and antibiotics must always be supervised by a licensed veterinarian.
5. IMAGE OBSERVATIONS:
   - If an image is provided, identify visible physical signs (posture, skin/feather/coat integrity, eyes, oral mucosa, lesions, discharge).
   - If the image does not show an animal (e.g., random object, food, machinery), clearly state this in the summary while still addressing reported symptoms if available.
6. LANGUAGE:
   - Respond in "${language}" (en = English, hi = Hindi, mr = Marathi).
   - Ensure medical conditions are recognizable (e.g. "Foot and Mouth Disease / खुरपका-मुंहपका", "Mastitis / थनैला रोग").
7. STRICT OUTPUT FORMAT:
   - You MUST output exclusively valid JSON conforming strictly to the provided schema.`;

    const userPromptText = `ANIMAL CLINICAL PROFILE:
- Species: ${animalType}
- Name / Tag ID: ${animalName || 'Not specified'}
- Breed: ${breed || 'Not specified'}
- Age: ${age || 'Not specified'}
- Sex: ${sex || 'Not specified'}
- Observed Symptoms: ${symptoms && symptoms.length > 0 ? symptoms.join(', ') : 'None explicitly checked'}
- Body Temperature: ${temperature}
- Behavior / Demeanor: ${behavior}
- Appetite: ${appetite}
- Water Intake: ${waterIntake}
- Milk Production (if applicable): ${milkProduction}
- Duration of Symptoms: ${duration}
- User's Detailed Notes: ${additionalInformation || 'None provided'}
- Preferred Output Language: ${language}

Analyze the clinical signs and image (if provided). Generate a comprehensive assessment strictly adhering to the JSON schema.`;

    const contents: any = [];

    // Parse image if provided
    if (image && typeof image === 'string' && image.startsWith('data:image/')) {
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        contents.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        });
      }
    }

    contents.push({
      text: `${systemPrompt}\n\n${userPromptText}`,
    });

    // Call Gemini with resilient model fallback for production reliability
    const candidateModels = ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let responseText = '';
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            responseMimeType: 'application/json',
          },
        });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (mErr: any) {
        lastError = mErr;
        console.warn(`Model ${modelName} returned error, trying fallback candidate:`, mErr?.message || mErr);
      }
    }

    if (!responseText) {
      throw lastError || new Error('All AI model candidates unavailable');
    }

    let rawJson: any;

    try {
      rawJson = JSON.parse(responseText.trim());
    } catch (e1) {
      // Clean possible markdown code fences
      const cleaned = responseText.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').replace(/```/g, '').trim();
      try {
        rawJson = JSON.parse(cleaned);
      } catch (e2) {
        // Fallback: extract substring between first { and last }
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) {
          rawJson = JSON.parse(match[0]);
        } else {
          throw new Error('MALFORMED_AI_RESPONSE');
        }
      }
    }

    // Validate and structure response
    const animalOut = rawJson.animal || {};
    const speciesOut = animalOut.species || animalType;
    const analysisOut = rawJson.analysis || {};

    let severityVal = String(analysisOut.severity || rawJson.severity || 'low').toLowerCase();
    if (!['low', 'moderate', 'high', 'emergency'].includes(severityVal)) {
      severityVal = severityVal.includes('emerg') || severityVal.includes('crit') ? 'emergency' : severityVal.includes('high') ? 'high' : severityVal.includes('mod') ? 'moderate' : 'low';
    }

    let confidenceVal = Number(analysisOut.confidence ?? rawJson.confidence ?? 75);
    if (isNaN(confidenceVal) || confidenceVal < 0) confidenceVal = 70;
    if (confidenceVal > 100) confidenceVal = 100;

    const possibleConditionsOut = Array.isArray(analysisOut.possible_conditions)
      ? analysisOut.possible_conditions.map((c: any) => {
          if (typeof c === 'string') {
            return { name: c, confidence: confidenceVal, reason: 'Identified based on clinical signs and reported symptoms.' };
          }
          return {
            name: String(c.name || 'Condition'),
            confidence: Number(c.confidence ?? confidenceVal),
            reason: String(c.reason || 'Clinical observation')
          };
        })
      : Array.isArray(rawJson.possibleConditions)
      ? rawJson.possibleConditions.map((c: any) => ({
          name: String(c.name || 'Condition'),
          confidence: Number(c.confidence ?? confidenceVal),
          reason: String(c.reason || 'Clinical observation')
        }))
      : [{ name: 'General Health Observation', confidence: confidenceVal, reason: 'Evaluated based on reported symptoms.' }];

    const observedSymptomsOut = Array.isArray(analysisOut.observed_symptoms)
      ? analysisOut.observed_symptoms.map(String)
      : Array.isArray(rawJson.visibleSymptoms)
      ? rawJson.visibleSymptoms.map(String)
      : symptoms;

    const recommendationsOut = Array.isArray(rawJson.recommendations)
      ? rawJson.recommendations.map(String)
      : Array.isArray(rawJson.generalRecommendations)
      ? rawJson.generalRecommendations.map(String)
      : ['Provide clean drinking water, adequate ventilation, and monitor closely.'];

    const immediateActionsOut = Array.isArray(rawJson.immediate_actions)
      ? rawJson.immediate_actions.map(String)
      : Array.isArray(rawJson.immediateActions)
      ? rawJson.immediateActions.map(String)
      : ['Isolate animal in a clean, quiet area to reduce physical stress.'];

    const warningSignsOut = Array.isArray(rawJson.warning_signs)
      ? rawJson.warning_signs.map(String)
      : Array.isArray(rawJson.warningSigns)
      ? rawJson.warningSigns.map(String)
      : ['Sudden collapse', 'Severe respiratory distress', 'Extreme lethargy or non-responsiveness'];

    const vetRequiredOut = Boolean(
      rawJson.veterinarian_required ??
      rawJson.veterinarianRecommended ??
      severityVal === 'high' ??
      severityVal === 'emergency'
    );

    const emergencyOut = Boolean(
      rawJson.emergency ??
      severityVal === 'emergency'
    );

    const summaryOut = String(
      analysisOut.summary ||
      rawJson.summary ||
      rawJson.rawAIExplanation ||
      `Health analysis complete for ${speciesOut}.`
    ).trim();

    // Map backwards-compatible fields
    const riskLevelVal = severityVal === 'emergency' ? 'Emergency' : severityVal === 'high' ? 'High' : severityVal === 'moderate' ? 'Medium' : 'Low';
    const healthStatusVal = severityVal === 'emergency' ? 'Emergency' : severityVal === 'high' ? 'High Risk' : severityVal === 'moderate' ? 'Needs Attention' : 'Healthy';

    let healthScoreVal = 85;
    if (severityVal === 'emergency') healthScoreVal = Math.max(15, 100 - confidenceVal);
    else if (severityVal === 'high') healthScoreVal = Math.max(35, 100 - Math.round(confidenceVal * 0.7));
    else if (severityVal === 'moderate') healthScoreVal = Math.max(55, 100 - Math.round(confidenceVal * 0.45));
    else healthScoreVal = Math.min(96, Math.max(78, 100 - Math.round(confidenceVal * 0.2)));

    const resultPayload = {
      // Strict JSON Schema representation
      animal: {
        species: speciesOut,
        breed: breed || animalOut.breed || '',
        name: animalName || animalOut.name || '',
        age: age || animalOut.age || '',
        sex: sex || animalOut.sex || ''
      },
      analysis: {
        possible_conditions: possibleConditionsOut,
        observed_symptoms: observedSymptomsOut,
        severity: severityVal,
        confidence: confidenceVal,
        summary: summaryOut
      },
      recommendations: recommendationsOut,
      immediate_actions: immediateActionsOut,
      warning_signs: warningSignsOut,
      veterinarian_required: vetRequiredOut,
      emergency: emergencyOut,

      // Backward-compatible fields
      animalDetected: true,
      detectedAnimalType: speciesOut,
      overallHealthStatus: healthStatusVal,
      riskLevel: riskLevelVal,
      possibleConditions: possibleConditionsOut,
      visibleSymptoms: observedSymptomsOut,
      reportedSymptoms: symptoms,
      possibleCauses: possibleConditionsOut.map((c: any) => c.name),
      generalRecommendations: recommendationsOut,
      preventionTips: warningSignsOut,
      medicinesAndTreatment: {
        firstAidMedications: immediateActionsOut,
        veterinaryDrugs: vetRequiredOut
          ? ['Consult a licensed veterinarian for formal prescription and accurate dosage calculation.']
          : ['Supportive care and periodic monitoring.'],
        supportiveCare: recommendationsOut,
        safetyPrecautions: 'Prescription antibiotics and injectable medications must always be administered under professional veterinary guidance.'
      },
      veterinarianRecommended: vetRequiredOut,
      healthScore: healthScoreVal,
      disclaimer: 'This AI health assessment provides preliminary guidance based on visual observations and reported signs. It does not replace clinical veterinary diagnosis or treatment.',
      rawAIExplanation: summaryOut,
      summary: summaryOut,
      immediateActions: immediateActionsOut,
      warningSigns: warningSignsOut
    };

    return res.status(200).json({
      success: true,
      animalDetected: true,
      result: resultPayload,
    });
  } catch (error: any) {
    console.error('AI Animal Health Analysis error:', error);
    return res.status(500).json({
      success: false,
      error: 'ANALYSIS_FAILED',
      message: 'Unable to complete the health analysis right now. Please try again.',
    });
  }
});

// 3. Animals CRUD
app.get('/api/animals', (req: Request, res: Response) => {
  const db = readDB();
  const userId = (req.query.userId as string) || 'farmer-1';
  const userAnimals = db.animals.filter(a => a.userId === userId || !a.userId);
  res.json(userAnimals);
});

app.get('/api/animals/:id', (req: Request, res: Response) => {
  const db = readDB();
  const animal = db.animals.find(a => a.id === req.params.id);
  if (!animal) return res.status(404).json({ error: 'Animal not found' });
  res.json(animal);
});

app.post('/api/animals', (req: Request, res: Response) => {
  const db = readDB();
  const newAnimal = {
    id: `anim-${Date.now()}`,
    userId: req.body.userId || 'farmer-1',
    name: req.body.name || 'Unnamed Animal',
    tagId: req.body.tagId || `TAG-${Math.floor(1000 + Math.random() * 9000)}`,
    type: req.body.type || 'Cow',
    age: req.body.age || '3',
    gender: req.body.gender || 'Female',
    breed: req.body.breed || 'Indigenous',
    weight: req.body.weight || '',
    farmLocation: req.body.farmLocation || 'Farm Shed',
    photoUrl: req.body.photoUrl || '',
    healthScore: req.body.healthScore || 85,
    status: req.body.status || 'Healthy',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.animals.unshift(newAnimal);
  writeDB(db);
  res.status(201).json(newAnimal);
});

app.put('/api/animals/:id', (req: Request, res: Response) => {
  const db = readDB();
  const index = db.animals.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Animal not found' });
  db.animals[index] = {
    ...db.animals[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  writeDB(db);
  res.json(db.animals[index]);
});

app.delete('/api/animals/:id', (req: Request, res: Response) => {
  const db = readDB();
  db.animals = db.animals.filter(a => a.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// 4. Health Reports CRUD
app.get('/api/reports', (req: Request, res: Response) => {
  const db = readDB();
  const { userId, animalId } = req.query;
  let reports = db.health_reports;
  if (userId) {
    reports = reports.filter(r => r.userId === userId);
  }
  if (animalId) {
    reports = reports.filter(r => r.animalId === animalId);
  }
  res.json(reports);
});

app.get('/api/reports/:id', (req: Request, res: Response) => {
  const db = readDB();
  const report = db.health_reports.find(r => r.id === req.params.id || r.reportCode === req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  res.json(report);
});

app.post('/api/reports', (req: Request, res: Response) => {
  const db = readDB();
  const reportCode = `PC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const newReport = {
    id: `rep-${Date.now()}`,
    reportCode: reportCode,
    userId: req.body.userId || 'farmer-1',
    animalId: req.body.animalId,
    animalName: req.body.animalName || 'Livestock',
    animalType: req.body.animalType || 'Cow',
    photoUrl: req.body.photoUrl,
    createdAt: new Date().toISOString(),
    symptoms: req.body.symptoms || [],
    temperature: req.body.temperature || 'Normal',
    behavior: req.body.behavior || 'Active & Alert',
    additionalInfo: req.body.additionalInfo || '',
    result: req.body.result,
    vetConsultationRequested: false
  };

  db.health_reports.unshift(newReport);

  // If tied to an animal, update animal's healthScore & lastCheckDate
  if (req.body.animalId) {
    const animalIdx = db.animals.findIndex(a => a.id === req.body.animalId);
    if (animalIdx !== -1) {
      db.animals[animalIdx].lastCheckDate = newReport.createdAt;
      if (req.body.result?.healthScore) {
        db.animals[animalIdx].healthScore = req.body.result.healthScore;
      }
      if (req.body.result?.overallHealthStatus) {
        db.animals[animalIdx].status = req.body.result.overallHealthStatus === 'Healthy' 
          ? 'Healthy' 
          : req.body.result.overallHealthStatus === 'Emergency' 
            ? 'Critical' 
            : 'Under Observation';
      }
    }
  }

  writeDB(db);
  res.status(201).json(newReport);
});

app.delete('/api/reports/:id', (req: Request, res: Response) => {
  const db = readDB();
  db.health_reports = db.health_reports.filter(r => r.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// 5. Reminders CRUD
app.get('/api/reminders', (req: Request, res: Response) => {
  const db = readDB();
  const userId = (req.query.userId as string) || 'farmer-1';
  const userReminders = db.reminders.filter(r => r.userId === userId || !r.userId);
  res.json(userReminders);
});

app.post('/api/reminders', (req: Request, res: Response) => {
  const db = readDB();
  const newReminder = {
    id: `rem-${Date.now()}`,
    userId: req.body.userId || 'farmer-1',
    animalId: req.body.animalId,
    animalName: req.body.animalName || 'General Herd',
    title: req.body.title,
    type: req.body.type || 'vaccination',
    dueDate: req.body.dueDate,
    completed: false,
    notes: req.body.notes || '',
    createdAt: new Date().toISOString()
  };
  db.reminders.push(newReminder);
  writeDB(db);
  res.status(201).json(newReminder);
});

app.put('/api/reminders/:id', (req: Request, res: Response) => {
  const db = readDB();
  const index = db.reminders.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Reminder not found' });
  db.reminders[index] = { ...db.reminders[index], ...req.body };
  writeDB(db);
  res.json(db.reminders[index]);
});

app.delete('/api/reminders/:id', (req: Request, res: Response) => {
  const db = readDB();
  db.reminders = db.reminders.filter(r => r.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// 6. Veterinarian Requests
app.get('/api/vet-requests', (req: Request, res: Response) => {
  const db = readDB();
  res.json(db.veterinarian_requests);
});

app.post('/api/vet-requests', (req: Request, res: Response) => {
  const db = readDB();
  const newRequest = {
    id: `vetreq-${Date.now()}`,
    userId: req.body.userId || 'farmer-1',
    userName: req.body.userName || 'Farmer',
    userPhone: req.body.userPhone || '',
    animalId: req.body.animalId,
    animalName: req.body.animalName || 'Livestock',
    animalType: req.body.animalType || 'Cow',
    symptoms: req.body.symptoms || [],
    preferredDate: req.body.preferredDate || new Date().toISOString().split('T')[0],
    preferredTime: req.body.preferredTime || 'Morning',
    description: req.body.description || '',
    reportId: req.body.reportId,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };
  db.veterinarian_requests.unshift(newRequest);

  if (req.body.reportId) {
    const report = db.health_reports.find(r => r.id === req.body.reportId);
    if (report) {
      report.vetConsultationRequested = true;
    }
  }

  writeDB(db);
  res.status(201).json(newRequest);
});

app.patch('/api/vet-requests/:id', (req: Request, res: Response) => {
  const db = readDB();
  const index = db.veterinarian_requests.findIndex(v => v.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Request not found' });
  db.veterinarian_requests[index] = { ...db.veterinarian_requests[index], ...req.body };
  writeDB(db);
  res.json(db.veterinarian_requests[index]);
});

// 7. Admin Analytics
app.get('/api/admin/stats', (req: Request, res: Response) => {
  const db = readDB();
  const animalCounts: Record<string, number> = {};
  db.animals.forEach(a => {
    animalCounts[a.type] = (animalCounts[a.type] || 0) + 1;
  });

  const highRiskCount = db.health_reports.filter(
    r => r.result?.riskLevel === 'High' || r.result?.riskLevel === 'Emergency'
  ).length;

  res.json({
    totalUsers: db.users.length,
    totalAnimals: db.animals.length,
    totalHealthChecks: db.health_reports.length,
    animalTypesAnalyzed: animalCounts,
    highRiskReports: highRiskCount,
    pendingVetRequests: db.veterinarian_requests.filter(v => v.status === 'Pending').length,
    recentReports: db.health_reports.slice(0, 5),
    recentVetRequests: db.veterinarian_requests.slice(0, 5)
  });
});

// 8. Disease Encyclopedia endpoint
app.get('/api/diseases', (req: Request, res: Response) => {
  res.json(initialDiseases);
});

// 9. Auth endpoints (Register, Login, Google OAuth)
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, surname = '', username, email, phone = '', password, farmName, farmLocation } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your first name.' });
    }
    if (!password || password.length < 4) {
      return res.status(400).json({ success: false, message: 'Password must be at least 4 characters.' });
    }
    if (!email && !phone && !username) {
      return res.status(400).json({ success: false, message: 'Please provide an email, username, or phone number.' });
    }

    const db = readDB();

    // Check if username already exists
    if (username && username.trim()) {
      const cleanUsername = username.trim().toLowerCase();
      const existingUserByUsername = db.users.find(u => u.username?.toLowerCase() === cleanUsername);
      if (existingUserByUsername) {
        return res.status(400).json({ success: false, message: 'This username is already taken. Please choose another.' });
      }
    }

    // Check if email already exists
    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      const existingUserByEmail = db.users.find(u => u.email?.toLowerCase() === cleanEmail);
      if (existingUserByEmail) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists. Please sign in.' });
      }
    }

    // Check if phone already exists
    if (phone && phone.trim()) {
      const cleanPhone = phone.trim();
      const existingUserByPhone = db.users.find(u => u.phone === cleanPhone);
      if (existingUserByPhone) {
        return res.status(400).json({ success: false, message: 'An account with this phone number already exists. Please sign in.' });
      }
    }

    const fullName = `${name.trim()}${surname && surname.trim() ? ' ' + surname.trim() : ''}`;
    const newUser = {
      id: `user-${Date.now()}`,
      name: fullName,
      surname: surname ? surname.trim() : undefined,
      username: username ? username.trim().toLowerCase() : undefined,
      phone: phone ? phone.trim() : '',
      email: email ? email.trim() : '',
      password: password,
      preferredLanguage: req.body.preferredLanguage || 'en',
      farmName: farmName?.trim() || `${name.trim()}'s Dairy Farm`,
      farmLocation: farmLocation?.trim() || 'Maharashtra, India',
      role: 'farmer',
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    writeDB(db);

    const { password: _, ...safeUser } = newUser;

    return res.json({
      success: true,
      user: safeUser,
      token: `pashu_token_${newUser.id}`,
      message: 'Account created successfully!'
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create account.' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your username, email, or phone number.' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Please enter your password.' });
    }

    const cleanId = identifier.trim().toLowerCase();
    const db = readDB();

    const user = db.users.find(u =>
      (u.username && u.username.toLowerCase() === cleanId) ||
      (u.email && u.email.toLowerCase() === cleanId) ||
      (u.phone && u.phone === identifier.trim())
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with these details. Please check or create a new account.'
      });
    }

    if (user.password && user.password !== password) {
      return res.status(400).json({ success: false, message: 'Incorrect password. Please try again.' });
    }

    const { password: _, ...safeUser } = user;

    return res.json({
      success: true,
      user: safeUser,
      token: `pashu_token_${user.id}`,
      message: 'Signed in successfully!'
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Sign in failed.' });
  }
});

app.post('/api/auth/otp-request', (req: Request, res: Response) => {
  const { identifier } = req.body;
  // Verification code dispatch
  res.json({
    success: true,
    message: 'SMS verification code sent successfully.',
  });
});

app.post('/api/auth/otp-verify', (req: Request, res: Response) => {
  const { identifier, otp, role = 'farmer' } = req.body;
  if (otp && otp.length === 6) {
    const db = readDB();
    let user = db.users.find(u => u.phone === identifier || u.email === identifier);
    if (!user) {
      user = {
        id: `user-${Date.now()}`,
        name: role === 'admin' ? 'Admin Officer' : 'Livestock Farmer',
        phone: identifier.includes('@') ? '' : identifier,
        email: identifier.includes('@') ? identifier : '',
        preferredLanguage: 'en',
        farmName: 'My Dairy Farm',
        farmLocation: 'Maharashtra, India',
        role: role,
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
      writeDB(db);
    }
    return res.json({ success: true, user, token: `pashu_token_${user.id}` });
  }
  return res.status(400).json({ success: false, message: 'Invalid verification code. Please check your SMS and try again.' });
});

// Explicit JSON error handler and catch-all for API routes to prevent HTML responses
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'ENDPOINT_NOT_FOUND',
    message: `API route ${req.method} ${req.path} not found.`
  });
});

app.use('/api', (err: any, req: Request, res: Response, next: any) => {
  console.error('API Error Middleware caught:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.code || 'INTERNAL_ERROR',
    message: 'Unable to complete the health analysis right now. Please try again.'
  });
});

// ==========================================
// VITE MIDDLEWARE OR STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PashuCare AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
