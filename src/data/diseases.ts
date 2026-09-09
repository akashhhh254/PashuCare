import { DiseaseInfo } from '../types';

export const initialDiseases: DiseaseInfo[] = [
  {
    id: 'fmd',
    name: 'Foot and Mouth Disease (FMD)',
    localNames: {
      hi: 'खुरपका-मुंहपका रोग (FMD)',
      mr: 'लाळ्या खुरकूत रोग (FMD)',
    },
    affectedAnimals: ['Cow', 'Buffalo', 'Goat', 'Sheep'],
    commonSymptoms: [
      'Blisters and painful erosions on mouth, tongue, dental pad, and hooves',
      'Excessive ropey drooling and salivation',
      'High fever (104°F - 106°F)',
      'Severe lameness and reluctance to stand',
      'Drastic drop in milk yield in milch animals'
    ],
    possibleCauses: [
      'Aphthovirus infection belonging to the Picornaviridae family',
      'Highly contagious through direct contact, contaminated feed, water, and aerosols',
      'Commonly spreads at animal fairs and shared grazing lands'
    ],
    prevention: [
      'Timely vaccination every 6 months under National Animal Disease Control Program (NADCP)',
      'Isolate affected animals immediately from the healthy herd',
      'Disinfect sheds, feed troughs, and footpaths with 4% sodium carbonate or 1:1000 potassium permanganate solution'
    ],
    generalCare: [
      'Wash mouth sores with mild alum or 1% potassium permanganate solution',
      'Apply boroglycerine paste to soothe oral lesions',
      'Provide soft, nutritious gruel, cooked porridge, or fresh tender grass that requires minimal chewing',
      'Keep feet clean and dry; dress foot sores with antiseptic neem ointment'
    ],
    whenToSeekVet: 'Contact your veterinary doctor immediately upon noticing salivation or mouth blisters. FMD is a notified disease requiring official herd management and secondary infection prevention.',
    severity: 'High'
  },
  {
    id: 'lsd',
    name: 'Lumpy Skin Disease (LSD)',
    localNames: {
      hi: 'लम्पी स्किन डिजीज (LSD)',
      mr: 'लम्पी त्वचा रोग (LSD)',
    },
    affectedAnimals: ['Cow', 'Buffalo'],
    commonSymptoms: [
      'Firm, round, painful cutaneous nodules (2-5 cm) all over skin and head',
      'High fever lasting 1 to 3 days',
      'Enlarged superficial lymph nodes',
      'Watery to purulent eye and nasal discharge',
      'Edema / swelling of brisket and lower legs',
      'Sudden decrease in lactation'
    ],
    possibleCauses: [
      'Capripoxvirus (Lumpy skin disease virus)',
      'Transmitted biologically and mechanically by biting insects: mosquitoes, flies (Stomoxys), and ticks',
      'Direct contact or shared water troughs during hot, humid seasons'
    ],
    prevention: [
      'Goat Pox vaccine or homologous LSD vaccine as guided by state veterinary departments',
      'Strict vector control: use insect nets, repellent sprays, and smoke dried neem leaves in the barn',
      'Quarantine newly purchased cows and buffaloes for at least 21 days'
    ],
    generalCare: [
      'Isolate affected animal in a well-ventilated, fly-proof shed',
      'Clean skin nodules and burst scabs with diluted Betadine or turmeric-neem paste to repel flies',
      'Provide electrolyte water, multivitamin supplements, and fresh green forage'
    ],
    whenToSeekVet: 'Call the veterinary medical officer immediately upon spotting round skin lumps or high fever. Early administration of antipyretics and supportive therapy prevents secondary bacterial complications.',
    severity: 'High'
  },
  {
    id: 'mastitis',
    name: 'Bovine Mastitis (Udder Inflammation)',
    localNames: {
      hi: 'थनैला रोग (Mastitis)',
      mr: 'स्तनदाह / कासदाह रोग',
    },
    affectedAnimals: ['Cow', 'Buffalo', 'Goat', 'Sheep'],
    commonSymptoms: [
      'Swollen, hot, painful, or hard quarters of the udder',
      'Abnormal milk: watery, bloody, yellowish, or containing clots and flakes',
      'Animal resists milking or suckling by calf due to pain',
      'Decreased milk volume; fever in severe acute cases'
    ],
    possibleCauses: [
      'Bacterial invasion through the teat canal (Staphylococcus aureus, Streptococcus, E. coli)',
      'Poor milking hygiene, wet muddy floor bedding, or incomplete milking',
      'Teat injuries or machine milking faults'
    ],
    prevention: [
      'Follow clean milking procedures: wash teats with clean warm water and dry before milking',
      'Perform post-milking teat dip with 0.5% iodophor solution',
      'Keep shed floors clean, dry, and lime-dusted; avoid letting cows lie down immediately after milking for 30 minutes',
      'Regular dry cow therapy under veterinary guidance'
    ],
    generalCare: [
      'Strip out affected quarter milk frequently (4-6 times daily) into a separate vessel and discard safely',
      'Apply cold water compresses or ice packs during acute swelling, followed by mild warm fomentation if recommended',
      'Never mix infected milk into the commercial supply'
    ],
    whenToSeekVet: 'Consult a veterinary doctor promptly for milk culture sensitivity testing and targeted intramammary antibiotic infusions before the udder quarter suffers permanent atrophy.',
    severity: 'Medium'
  },
  {
    id: 'hs',
    name: 'Hemorrhagic Septicemia (HS / Galghontu)',
    localNames: {
      hi: 'गलघोंटू (Hemorrhagic Septicemia)',
      mr: 'घटसर्प रोग',
    },
    affectedAnimals: ['Buffalo', 'Cow'],
    commonSymptoms: [
      'Sudden high fever (105°F - 107°F)',
      'Severe, hot, painful swelling around throat, neck, brisket, and dewlap',
      'Heavy, noisy, snoring respiration with extended neck and tongue out',
      'Severe depression, shivering, profuse salivation, and collapse'
    ],
    possibleCauses: [
      'Pasteurella multocida bacteria',
      'Stress factors like monsoon onset, heavy plowing work, starvation, or transport',
      'Ingestion of contaminated soil or feed'
    ],
    prevention: [
      'Annual pre-monsoon vaccination in May-June (HS Alum precipitated or Oil adjuvant vaccine)',
      'Avoid grazing animals in low-lying waterlogged pastures during first rains'
    ],
    generalCare: [
      'Ensure complete physical rest in a shaded, well-ventilated enclosure',
      'Do not force-feed by drenching bottle as choking risk is extremely high'
    ],
    whenToSeekVet: 'EMERGENCY: Galghontu is rapidly fatal within 12-24 hours. Call the veterinary emergency team immediately at the first sign of throat swelling or labored breathing for intravenous antibacterial treatment.',
    severity: 'Emergency'
  },
  {
    id: 'bq',
    name: 'Black Quarter (BQ / Chuchiya)',
    localNames: {
      hi: 'लंगड़ा बुखार / जहरबाद (Black Quarter)',
      mr: 'फऱ्या रोग (Black Quarter)',
    },
    affectedAnimals: ['Cow', 'Buffalo', 'Sheep'],
    commonSymptoms: [
      'Sudden severe lameness, usually in heavy muscles of hindquarters or shoulder',
      'Hot, painful swelling that later becomes cold, painless, and produces a characteristic crackling/crepitant sound when pressed',
      'High fever, tremors, refusal to feed, and severe prostration'
    ],
    possibleCauses: [
      'Clostridium chauvoei bacterial spores residing in soil',
      'Enters through ingestion or minor muscle bruises during grazing',
      'Common in healthy young animals aged 6 months to 2 years'
    ],
    prevention: [
      'Annual vaccination before monsoon season',
      'Safe deep burial of deceased animals with quicklime to avoid contaminating pastures'
    ],
    generalCare: [
      'Isolate animal in dry isolation shed with ample clean drinking water'
    ],
    whenToSeekVet: 'EMERGENCY: Rapidly fatal without immediate intervention. Veterinary doctor must administer high doses of penicillin/antibiotics in early stages before irreversible muscular gangrene occurs.',
    severity: 'Emergency'
  },
  {
    id: 'bloat',
    name: 'Bloat / Ruminal Tympany',
    localNames: {
      hi: 'आफरा / पेट फूलना (Bloat)',
      mr: 'पोटफुगी / अफरा',
    },
    affectedAnimals: ['Cow', 'Buffalo', 'Goat', 'Sheep'],
    commonSymptoms: [
      'Severe distension of the left flank (sound like a drum when tapped)',
      'Restlessness, kicking at the belly, frequent lying down and getting up',
      'Labored mouth-breathing, tongue hanging out, and groaning',
      'Cessation of rumination and defecation'
    ],
    possibleCauses: [
      'Excessive consumption of lush young legumes (lucerne, berseem, clover)',
      'Sudden gorge of concentrated grains, potatoes, or sour fermented silage',
      'Esophageal obstruction (choke by turnip or fruit)'
    ],
    prevention: [
      'Feed dry roughage or straw before letting cattle graze on lush green legumes',
      'Gradually introduce grain concentrates over 1-2 weeks; never feed in sudden bulk'
    ],
    generalCare: [
      'Keep the animal standing with front legs elevated on an incline to relieve diaphragm pressure',
      'Keep mouth open gently with a bit or stick to stimulate belching',
      'Administer 200-300 ml sweet oil or linseed oil with 20 ml turpentine oil under phone consultation'
    ],
    whenToSeekVet: 'EMERGENCY if left flank is tightly ballooned and breathing is shallow. Veterinary trocarisation or stomach tubing is urgent to prevent asphyxiation.',
    severity: 'High'
  },
  {
    id: 'ppr',
    name: 'Peste des Petits Ruminants (PPR / Goat Plague)',
    localNames: {
      hi: 'बकरी प्लेग (PPR)',
      mr: 'शेळ्यांमधील प्लेग (PPR रोग)',
    },
    affectedAnimals: ['Goat', 'Sheep'],
    commonSymptoms: [
      'Sudden high fever, dullness, and sneezing',
      'Serous then crusted eye and nasal discharge gluing eyelids shut',
      'Erosive sores inside mouth, foul odor, and difficulty feeding',
      'Severe watery, foul-smelling diarrhea leading to rapid dehydration',
      'Pneumonia with labored breathing and coughing'
    ],
    possibleCauses: [
      'Morbillivirus infection related to rinderpest virus',
      'Transmission through inhalation of respiratory droplets or direct contact'
    ],
    prevention: [
      'PPR vaccine confers 3-year immunity; vaccinate all goats and sheep above 3 months of age',
      'Strict quarantine of newly introduced goats for 30 days'
    ],
    generalCare: [
      'Clean crusts from eyes and nostrils with warm saline',
      'Provide oral rehydration salts (ORS) and clean lukewarm water continuously',
      'Soft palatable greens like tender mulberry leaves or mashed gruel'
    ],
    whenToSeekVet: 'Urgent veterinary intervention is essential to administer supportive fluid therapy, broad-spectrum cover for secondary respiratory infections, and herd quarantine.',
    severity: 'High'
  }
];

export const sampleVeterinaryDirectory = [
  {
    id: 'vet-1',
    name: 'Dr. Ramesh Patil (M.V.Sc Medicine)',
    role: 'Senior Livestock Development Officer',
    clinicName: 'Government Taluka Veterinary Polyclinic',
    location: 'District Cattle Welfare Campus, Baramati / Pune',
    phone: '+91 98230 45678',
    distance: '3.8 km away',
    availableTime: '08:30 AM - 04:30 PM (Emergency on-call 24x7)',
    rating: 4.9,
    services: ['Emergency Surgery', 'AI Pregnancy Diagnostics', 'Vaccination Drive', 'Teleconsultation']
  },
  {
    id: 'vet-2',
    name: 'Dr. Sunita Deshmukh (B.V.Sc & A.H)',
    role: 'Veterinary Surgeon & Dairy Health Specialist',
    clinicName: 'Kisan Pashu Arogya Kendra & Mobile Dispensary',
    location: 'Main Bazar Road, Sangli / Satara Zone',
    phone: '+91 94220 12390',
    distance: '6.2 km away',
    availableTime: '09:00 AM - 06:00 PM',
    rating: 4.8,
    services: ['Mobile Farm Visits', 'Mastitis Screenings', 'Deworming & Nutrition Plans', 'Ultrasonography']
  },
  {
    id: 'vet-3',
    name: 'Dr. Anil Verma (M.V.Sc Surgery)',
    role: 'Livestock Field Specialist',
    clinicName: 'Pashu Dhan Sewa Kendra',
    location: 'Bhiwani / Rohtak Regional Agri Corridor',
    phone: '+91 98120 78912',
    distance: '8.5 km away',
    availableTime: '08:00 AM - 07:00 PM',
    rating: 4.7,
    services: ['Bovine Lameness', 'Calving Assistance', 'General Health Checkups']
  }
];
