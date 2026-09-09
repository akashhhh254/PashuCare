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

// 2. AI Animal Health Vision Analysis
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const {
      image,
      animalType,
      symptoms = [],
      temperature = 'Normal',
      behavior = 'Active & Alert',
      additionalInformation = '',
      language = 'en'
    } = req.body;

    const ai = getAIClient();
    if (!ai) {
      return res.status(400).json({
        error: 'AI_NOT_CONFIGURED',
        message: 'The Gemini AI API key is not configured. Please add your GEMINI_API_KEY in the AI Studio Settings > Secrets panel before initiating AI vision analysis.',
      });
    }

    if (!image && (!symptoms || symptoms.length === 0) && !additionalInformation) {
      return res.status(400).json({
        error: 'MISSING_INPUT',
        message: 'Please provide an animal image or select at least one observed symptom to analyze.',
      });
    }

    // Build the Multimodal Prompt
    const systemPrompt = `You are "PashuCare AI", an expert veterinary diagnostic assistant specialized in rural livestock health for Cows, Buffaloes, Goats, and Sheep.
Your primary goal is to help farmers detect early signs of common livestock illnesses (such as Foot and Mouth Disease / FMD, Lumpy Skin Disease / LSD, Bovine Mastitis, Hemorrhagic Septicemia / HS, Black Quarter / BQ, Bloat / Tympany, Peste des Petits Ruminants / PPR, Enterotoxemia, etc.).

CRITICAL SAFETY & MEDICAL INSTRUCTIONS:
1. NEVER claim a 100% confirmed diagnosis. Always use cautious terms: "Possible condition", "Preliminary assessment", "AI confidence".
2. If symptoms suggest acute, rapidly fatal or dangerous diseases (e.g. severe bloat with distended flank, throat swelling / HS, high acute fever with sudden lameness / BQ, acute respiratory distress, heavy bleeding), mark "emergency": true and "riskLevel": "Emergency" or "High".
3. PROVIDE PRACTICAL MEDICINES & TREATMENT GUIDELINES:
   - First-aid & immediate supplies: Provide safe first-aid remedies (e.g. Potassium Permanganate 1:1000 / Alum mouth wash for blisters, Boro-glycerine, Himax / Topicure wound sprays, ORS electrolytes for dehydration, Bloatosil / sweet mustard oil for bloat, cold compresses for mastitis).
   - Standard Veterinary medications: List standard veterinary drugs normally prescribed or administered by the doctor for these conditions (e.g., antipyretics/painkillers like Meloxicam/Paracetamol, antihistaminics like Avil/Pheniramine, prescription antibiotic classes like Enrofloxacin/Ceftriaxone, intramammary infusions for mastitis, Calcium Borogluconate 25% for milk fever) so the farmer understands what treatment is needed.
   - Always include a clear safety note that prescription antibiotics and injections must be administered under veterinary guidance.
4. If an image is provided:
   - Check if the image contains an animal (specifically cow, buffalo, goat, sheep, or livestock).
   - If the image is a human, object, car, scenery, or unrelated animal (e.g., cat, bird, snake), set "animalDetected": false and explain in simple friendly language that only supported livestock (Cow, Buffalo, Goat, Sheep) can be analyzed.
   - Check image quality: is it clear, well-lit, and focused on the animal or affected area?
5. Combine image observations with user-provided symptoms, temperature, and behavior.
6. Calculate an informational "healthScore" between 10 and 100 (100 = completely healthy, <50 = serious illness/emergency, 50-75 = needs attention/mild-moderate issue).
7. Respond ONLY in structured JSON adhering to the exact schema specified.
8. Translate all descriptive strings (reasons, causes, recommendations, prevention, medicines) into the requested language: "${language}" (en = English, hi = Hindi, mr = Marathi). Always keep the disease and medicine names recognizable (e.g. bilingual like "खुरपका-मुंहपका (FMD)" or "मेलोक्सिकैम (Melonex)").`;

    const userPromptText = `ANIMAL TO ANALYZE:
- Selected Animal Category: ${animalType || 'Not specified'}
- Reported Symptoms: ${symptoms.length > 0 ? symptoms.join(', ') : 'None explicitly checked'}
- Estimated Body Temperature: ${temperature}
- Demeanor / Behavior: ${behavior}
- Farmer's Observations: ${additionalInformation || 'None provided'}
- Preferred Output Language: ${language}

Analyze the photo and reported signs. Return a valid JSON object matching this structure:
{
  "animalDetected": true,
  "detectedAnimalType": "Cow / Buffalo / Goat / Sheep / Unknown",
  "imageQuality": {
    "sufficient": true,
    "reason": "Brief feedback on clarity/lighting"
  },
  "overallHealthStatus": "Healthy" | "Needs Attention" | "High Risk" | "Emergency",
  "riskLevel": "Low" | "Medium" | "High" | "Emergency",
  "possibleConditions": [
    {
      "name": "Condition Name",
      "confidence": 75,
      "reason": "Simple explanation based on visible signs and symptoms"
    }
  ],
  "visibleSymptoms": ["List of physical signs detected in the photo, or state none if clean"],
  "reportedSymptoms": ["List of symptoms confirmed by farmer"],
  "possibleCauses": ["Possible environmental, bacterial, viral, or nutritional factors without asserting certainty"],
  "generalRecommendations": ["Safe supportive care actions for the farmer"],
  "preventionTips": ["Herd biosecurity and vaccination guidance"],
  "medicinesAndTreatment": {
    "firstAidMedications": ["List of safe immediate first aid medicines and supplies in ${language}"],
    "veterinaryDrugs": ["List of standard veterinary medicines to discuss with veterinarian in ${language}"],
    "safetyPrecautions": "Clear guidance on veterinary prescription and milk/meat withdrawal"
  },
  "veterinarianRecommended": true,
  "emergency": false,
  "healthScore": 75,
  "disclaimer": "This AI assessment is for preliminary informational purposes only and is not a substitute for diagnosis or treatment by a qualified veterinarian."
}`;

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

    // Call Gemini 3.8 Flash model
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let resultJSON: any;
    try {
      resultJSON = JSON.parse(responseText);
    } catch (parseError) {
      // Fallback cleanup if model wrapped in markdown
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      resultJSON = JSON.parse(cleaned);
    }

    // Check if animal wasn't detected
    if (resultJSON.animalDetected === false) {
      return res.status(200).json({
        success: false,
        animalDetected: false,
        message: language === 'hi' 
          ? 'अपलोड की गई फोटो में समर्थित पशु (गाय, भैंस, बकरी या भेड़) नहीं दिख रहा है। कृपया पशु के प्रभावित हिस्से की स्पष्ट फोटो लगाएं।'
          : language === 'mr'
          ? 'अपलोड केलेल्या फोटोमध्ये समर्थित जनावर (गाय, म्हैस, शेळी किंवा मेंढी) आढळले नाही. कृपया जनावराचा स्पष्ट फोटो जोडा.'
          : 'The uploaded image does not appear to contain a supported animal. Please upload a clear photo of a cow, buffalo, goat, or sheep.',
        result: resultJSON
      });
    }

    // Ensure mandatory fields exist
    if (!resultJSON.disclaimer) {
      resultJSON.disclaimer = 'This AI assessment is for preliminary informational purposes only and is not a substitute for diagnosis or treatment by a qualified veterinarian.';
    }

    return res.status(200).json({
      success: true,
      animalDetected: true,
      result: resultJSON,
    });
  } catch (error: any) {
    console.error('AI Vision Analysis error:', error);
    return res.status(500).json({
      error: 'ANALYSIS_FAILED',
      message: error.message || 'An unexpected error occurred while communicating with the AI service. Please try again.',
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

app.post('/api/auth/google', (req: Request, res: Response) => {
  try {
    const { credential, email, name, picture } = req.body;
    let userEmail = email;
    let userName = name;
    let userPicture = picture;

    // If credential JWT string is present from Google Identity Services
    if (credential && typeof credential === 'string') {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          userEmail = payload.email || userEmail;
          userName = payload.name || userName;
          userPicture = payload.picture || userPicture;
        }
      } catch (decodeErr) {
        console.warn('Could not decode Google JWT credential directly:', decodeErr);
      }
    }

    if (!userEmail) {
      userEmail = 'akashthakare157@gmail.com';
    }
    if (!userName) {
      const prefix = userEmail.split('@')[0];
      userName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }

    const db = readDB();
    let user = db.users.find(u => u.email?.toLowerCase() === userEmail?.toLowerCase());
    if (!user) {
      user = {
        id: `google-${Date.now()}`,
        name: userName,
        phone: '',
        email: userEmail,
        preferredLanguage: 'en',
        farmName: `${userName.split(' ')[0]}'s Livestock Farm`,
        farmLocation: 'Maharashtra, India',
        role: userEmail.includes('admin') ? 'admin' : 'farmer',
        photoUrl: userPicture || undefined,
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
      writeDB(db);
    } else if (userPicture && !user.photoUrl) {
      user.photoUrl = userPicture;
      writeDB(db);
    }

    return res.json({
      success: true,
      user,
      token: `pashu_google_token_${user.id}`
    });
  } catch (err: any) {
    console.error('Google auth error:', err);
    return res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
});

app.post('/api/auth/otp-request', (req: Request, res: Response) => {
  const { identifier } = req.body;
  // Demo OTP simulation
  res.json({
    success: true,
    message: 'OTP sent successfully! In demo mode, enter code: 123456',
    code: '123456'
  });
});

app.post('/api/auth/otp-verify', (req: Request, res: Response) => {
  const { identifier, otp, role = 'farmer' } = req.body;
  if (otp === '123456' || otp === '999999') {
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
  return res.status(400).json({ success: false, message: 'Invalid OTP code. Please use 123456' });
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
