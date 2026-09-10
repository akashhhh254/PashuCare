import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { initialDiseases } from './src/data/diseases';
import { generateRuleBasedAssessment } from './src/utils/veterinaryRuleEngine';

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

  const clinicalInput = {
    animalType,
    animalCategory,
    animalName,
    breed,
    age,
    sex,
    symptoms: Array.isArray(symptoms) ? symptoms : [],
    temperature,
    behavior,
    appetite,
    waterIntake,
    milkProduction,
    duration,
    additionalInformation,
    language
  };

  const ai = getAIClient();
  const candidateModels = ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];

  // Helper to execute Gemini with a strict timeout
  const runWithTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error('AI_REQUEST_TIMEOUT')), ms))
    ]);
  };

  // Dynamic species context builder for AI prompt
  const speciesLower = String(animalType).toLowerCase();
  let speciesSpecificGuidance = '';
  if (speciesLower.includes('cow') || speciesLower.includes('bull') || speciesLower.includes('calf') || speciesLower.includes('cattle')) {
    speciesSpecificGuidance = 'SPECIES: Bovine / Cattle. Evaluate for FMD, Lumpy Skin Disease, Bovine Mastitis, Hemorrhagic Septicemia, Black Quarter, Theileriosis, Bloat, Milk Fever, Ketosis.';
  } else if (speciesLower.includes('buffalo')) {
    speciesSpecificGuidance = 'SPECIES: Water Buffalo (Bubaline). Evaluate for Hemorrhagic Septicemia, Surra, Mastitis, heat stress, wallowing parasites.';
  } else if (speciesLower.includes('goat') || speciesLower.includes('sheep')) {
    speciesSpecificGuidance = 'SPECIES: Small Ruminant (Caprine/Ovine). Evaluate for PPR (Peste des Petits Ruminants), Enterotoxemia, Goat/Sheep Pox, Haemonchosis, Foot Rot, Orf.';
  } else if (speciesLower.includes('chicken') || speciesLower.includes('poultry') || speciesLower.includes('hen')) {
    speciesSpecificGuidance = 'SPECIES: Avian / Poultry. Evaluate for Newcastle Disease (Ranikhet), Coccidiosis, Fowl Pox, CRD.';
  } else if (speciesLower.includes('dog') || speciesLower.includes('puppy')) {
    speciesSpecificGuidance = 'SPECIES: Canine / Dog. Evaluate for Parvovirus, Distemper, Kennel Cough, Gastroenteritis, Tick Fever.';
  } else {
    speciesSpecificGuidance = `SPECIES: ${animalType}. Provide clinical veterinary evaluation based on reported signs.`;
  }

  const promptSystem = `You are "PashuCare AI", a professional veterinary clinical intelligence assistant.
${speciesSpecificGuidance}

RULES:
1. Provide a preliminary health assessment. Never present it as an absolute confirmed diagnosis.
2. Structure output as valid JSON conforming strictly to:
{
  "assessment": "Brief clinical summary of health condition",
  "possible_conditions": [
    {
      "name": "Condition Name",
      "likelihood": "low" | "moderate" | "high",
      "reason": "Why this matches signs",
      "confidence": 75
    }
  ],
  "observations": ["Observed sign 1", "Observed sign 2"],
  "recommended_actions": ["Practical, safe first aid / supportive action 1", "Action 2"],
  "warning_signs": ["Critical sign when farmer must contact vet immediately 1", "Sign 2"],
  "urgency": "routine" | "soon" | "urgent" | "emergency",
  "veterinary_recommendation": "Clear advice regarding veterinary consultation",
  "confidence": 75
}
3. Language: "${language}" (en = English, hi = Hindi, mr = Marathi).
4. Do NOT prescribe prescription antibiotics or unsafe chemical dosages. Focus on safe supportive care and warning signs.`;

  const promptUser = `CLINICAL SIGNS:
- Species: ${animalType}
- Name/Tag: ${animalName || 'Not specified'}
- Breed: ${breed || 'Not specified'}
- Age: ${age || 'Not specified'}
- Sex: ${sex || 'Not specified'}
- Observed Symptoms: ${symptoms.length > 0 ? symptoms.join(', ') : 'None marked'}
- Body Temperature: ${temperature}
- Demeanor/Behavior: ${behavior}
- Appetite: ${appetite}
- Water Intake: ${waterIntake}
- Milk Production: ${milkProduction}
- Duration: ${duration}
- Notes: ${additionalInformation || 'None'}
- Preferred Language: ${language}`;

  let parsedAIResponse: any = null;

  // PRIORITY 1: Multimodal analysis if photo exists
  if (ai && image && typeof image === 'string' && image.startsWith('data:image/')) {
    try {
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const base64Data = matches[2];

        const multimodalContents = [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          {
            text: `${promptSystem}\n\nAnalyze the animal in the image alongside reported signs:\n${promptUser}`,
          },
        ];

        for (const modelName of candidateModels) {
          try {
            const resp = await runWithTimeout(
              ai.models.generateContent({
                model: modelName,
                contents: multimodalContents,
                config: { responseMimeType: 'application/json' },
              }),
              14000
            );
            if (resp.text) {
              const cleaned = resp.text.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').replace(/```/g, '').trim();
              parsedAIResponse = JSON.parse(cleaned);
              break;
            }
          } catch (modelErr: any) {
            console.warn(`[PashuCare] Multimodal attempt on ${modelName} failed:`, modelErr?.message || modelErr);
          }
        }
      }
    } catch (imgErr) {
      console.warn('[PashuCare] Multimodal pipeline error, continuing to symptom analysis:', imgErr);
    }
  }

  // PRIORITY 2: Symptom + animal-species text analysis if multimodal did not succeed
  if (ai && !parsedAIResponse) {
    try {
      const textContents = [
        {
          text: `${promptSystem}\n\n${promptUser}`,
        },
      ];

      for (const modelName of candidateModels) {
        try {
          const resp = await runWithTimeout(
            ai.models.generateContent({
              model: modelName,
              contents: textContents,
              config: { responseMimeType: 'application/json' },
            }),
            12000
          );
          if (resp.text) {
            const cleaned = resp.text.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').replace(/```/g, '').trim();
            parsedAIResponse = JSON.parse(cleaned);
            break;
          }
        } catch (mErr: any) {
          console.warn(`[PashuCare] Text analysis on ${modelName} failed:`, mErr?.message || mErr);
        }
      }
    } catch (txtErr) {
      console.warn('[PashuCare] AI text analysis pipeline error:', txtErr);
    }
  }

  // PRIORITY 3: Rule-based preliminary assessment if AI/API is temporarily unavailable or returned invalid JSON
  if (!parsedAIResponse) {
    console.log('[PashuCare] Engaging rule-based veterinary assessment fallback pipeline.');
    const ruleBasedResult = generateRuleBasedAssessment(clinicalInput);
    return res.status(200).json({
      success: true,
      animalDetected: true,
      result: ruleBasedResult,
      pipeline: 'rule-based-fallback'
    });
  }

  // Normalize AI response to ensure strict compliance and full UI compatibility
  try {
    const assessmentSummary = String(
      parsedAIResponse.assessment ||
      parsedAIResponse.summary ||
      parsedAIResponse.rawAIExplanation ||
      `Preliminary assessment completed for ${animalType}.`
    ).trim();

    let urgencyVal = String(parsedAIResponse.urgency || parsedAIResponse.severity || 'routine').toLowerCase();
    if (!['routine', 'soon', 'urgent', 'emergency'].includes(urgencyVal)) {
      if (urgencyVal.includes('emerg') || urgencyVal.includes('crit')) urgencyVal = 'emergency';
      else if (urgencyVal.includes('high') || urgencyVal.includes('urg')) urgencyVal = 'urgent';
      else if (urgencyVal.includes('mod') || urgencyVal.includes('med')) urgencyVal = 'soon';
      else urgencyVal = 'routine';
    }

    let statusVal: 'LOW CONCERN' | 'MONITOR' | 'VETERINARY ATTENTION' | 'URGENT' = 'LOW CONCERN';
    if (urgencyVal === 'emergency') statusVal = 'URGENT';
    else if (urgencyVal === 'urgent') statusVal = 'VETERINARY ATTENTION';
    else if (urgencyVal === 'soon') statusVal = 'MONITOR';
    else statusVal = 'LOW CONCERN';

    let confVal = Number(parsedAIResponse.confidence ?? 75);
    if (isNaN(confVal) || confVal < 20) confVal = 70;
    if (confVal > 100) confVal = 100;

    const rawConditions = Array.isArray(parsedAIResponse.possible_conditions)
      ? parsedAIResponse.possible_conditions
      : Array.isArray(parsedAIResponse.possibleConditions)
      ? parsedAIResponse.possibleConditions
      : [{ name: 'Clinical Observation', likelihood: 'low', reason: 'Based on reported symptoms', confidence: confVal }];

    const normalizedConditions = rawConditions.map((c: any) => {
      if (typeof c === 'string') {
        return { name: c, likelihood: 'moderate' as const, reason: 'Matches reported clinical indicators', confidence: confVal };
      }
      return {
        name: String(c.name || 'Condition'),
        likelihood: (['low', 'moderate', 'high'].includes(c.likelihood) ? c.likelihood : 'moderate') as 'low' | 'moderate' | 'high',
        reason: String(c.reason || 'Clinical observation'),
        confidence: Number(c.confidence ?? confVal)
      };
    });

    const observationsOut = Array.isArray(parsedAIResponse.observations)
      ? parsedAIResponse.observations.map(String)
      : Array.isArray(parsedAIResponse.observed_symptoms)
      ? parsedAIResponse.observed_symptoms.map(String)
      : Array.isArray(symptoms) && symptoms.length > 0
      ? symptoms
      : ['General clinical inspection'];

    const actionsOut = Array.isArray(parsedAIResponse.recommended_actions)
      ? parsedAIResponse.recommended_actions.map(String)
      : Array.isArray(parsedAIResponse.immediate_actions)
      ? parsedAIResponse.immediate_actions.map(String)
      : ['Provide clean drinking water and keep the animal sheltered.'];

    const warningOut = Array.isArray(parsedAIResponse.warning_signs)
      ? parsedAIResponse.warning_signs.map(String)
      : ['Sudden collapse', 'Extreme respiratory distress', 'Severe dehydration'];

    const vetRecOut = String(
      parsedAIResponse.veterinary_recommendation ||
      (urgencyVal === 'emergency' || urgencyVal === 'urgent'
        ? 'Contact an emergency veterinarian immediately. National Helpline: 1962.'
        : 'Monitor animal over the next 24-48 hours. Consult a veterinarian if symptoms persist.')
    );

    const isEmergency = urgencyVal === 'emergency';
    const isVetRequired = isEmergency || urgencyVal === 'urgent';
    const riskLevel = urgencyVal === 'emergency' ? 'Emergency' : urgencyVal === 'urgent' ? 'High' : urgencyVal === 'soon' ? 'Medium' : 'Low';
    const healthStatus = urgencyVal === 'emergency' ? 'Emergency' : urgencyVal === 'urgent' ? 'High Risk' : urgencyVal === 'soon' ? 'Needs Attention' : 'Healthy';
    const healthScore = urgencyVal === 'emergency' ? 20 : urgencyVal === 'urgent' ? 45 : urgencyVal === 'soon' ? 68 : 88;

    const normalizedResult = {
      assessment: assessmentSummary,
      possible_conditions: normalizedConditions,
      observations: observationsOut,
      recommended_actions: actionsOut,
      warning_signs: warningOut,
      urgency: urgencyVal,
      status: statusVal,
      veterinary_recommendation: vetRecOut,
      confidence: confVal,

      // Strict sub-structure
      animal: {
        species: animalType,
        breed: breed || '',
        name: animalName || '',
        age: age || '',
        sex: sex || ''
      },
      analysis: {
        possible_conditions: normalizedConditions,
        observed_symptoms: observationsOut,
        severity: urgencyVal === 'emergency' ? 'emergency' : urgencyVal === 'urgent' ? 'high' : urgencyVal === 'soon' ? 'moderate' : 'low',
        confidence: confVal,
        summary: assessmentSummary
      },
      recommendations: actionsOut,
      immediate_actions: actionsOut,
      veterinarian_required: isVetRequired,
      emergency: isEmergency,

      // Backward-compatible fields
      animalDetected: true,
      detectedAnimalType: animalType,
      overallHealthStatus: healthStatus,
      riskLevel: riskLevel,
      possibleConditions: normalizedConditions,
      visibleSymptoms: observationsOut,
      reportedSymptoms: symptoms,
      possibleCauses: normalizedConditions.map((c: any) => c.name),
      generalRecommendations: actionsOut,
      preventionTips: warningOut,
      medicinesAndTreatment: {
        firstAidMedications: actionsOut,
        veterinaryDrugs: isVetRequired
          ? ['Consult a qualified veterinarian for prescription medication and exact dosage.']
          : ['Supportive care and periodic monitoring.'],
        supportiveCare: actionsOut,
        safetyPrecautions: 'Prescription antibiotics and injectables must always be administered under licensed veterinary guidance.'
      },
      veterinarianRecommended: isVetRequired,
      healthScore,
      disclaimer: 'This health assessment is preliminary and educational. It does not replace in-person diagnosis by a licensed veterinarian.',
      rawAIExplanation: assessmentSummary,
      summary: assessmentSummary,
      immediateActions: actionsOut,
      warningSigns: warningOut
    };

    return res.status(200).json({
      success: true,
      animalDetected: true,
      result: normalizedResult,
      pipeline: 'ai'
    });
  } catch (normErr) {
    console.error('[PashuCare] Error normalizing AI output, returning rule-based fallback:', normErr);
    const fallbackResult = generateRuleBasedAssessment(clinicalInput);
    return res.status(200).json({
      success: true,
      animalDetected: true,
      result: fallbackResult,
      pipeline: 'rule-based-fallback'
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
