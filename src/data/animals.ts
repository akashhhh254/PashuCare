import { AnimalCategory } from '../types';

export interface AnimalSpeciesDef {
  id: string;
  name: string;
  category: AnimalCategory;
  emoji: string;
  hindiName: string;
  marathiName: string;
  isPopular?: boolean;
  isDairyMammal?: boolean; // Eligible for milk production questions
  typicalVitals?: {
    normalTempRange?: string;
    temperatureUnit?: string;
  };
}

export interface AnimalCategoryDef {
  id: AnimalCategory;
  label: string;
  hindiLabel: string;
  marathiLabel: string;
  iconName: string;
  emoji: string;
  description: string;
}

export const ANIMAL_CATEGORIES: AnimalCategoryDef[] = [
  {
    id: 'livestock',
    label: 'Livestock',
    hindiLabel: 'पशुधन',
    marathiLabel: 'पशुधन',
    iconName: 'Cow',
    emoji: '🐄',
    description: 'Cattle, equines, camelids, swine, small ruminants'
  },
  {
    id: 'poultry',
    label: 'Poultry',
    hindiLabel: 'कुक्कुट / मुर्गी',
    marathiLabel: 'कुक्कुटपालन',
    iconName: 'Egg',
    emoji: '🐓',
    description: 'Chickens, ducks, turkeys, quails, waterfowl'
  },
  {
    id: 'pets',
    label: 'Pets & Companions',
    hindiLabel: 'पालतू जानवर',
    marathiLabel: 'पाळीव प्राणी',
    iconName: 'Dog',
    emoji: '🐕',
    description: 'Dogs, cats, rabbits, domestic rodents'
  },
  {
    id: 'birds',
    label: 'Birds & Aviary',
    hindiLabel: 'पक्षी',
    marathiLabel: 'पक्षी',
    iconName: 'Feather',
    emoji: '🦜',
    description: 'Parrots, songbirds, pigeons, birds of prey'
  },
  {
    id: 'wildlife',
    label: 'Wildlife & Exotic',
    hindiLabel: 'वन्यजीव',
    marathiLabel: 'वन्यजीव',
    iconName: 'Trees',
    emoji: '🦁',
    description: 'Protected fauna, herbivores, carnivores, primates'
  },
  {
    id: 'reptiles',
    label: 'Reptiles',
    hindiLabel: 'सरीसृप',
    marathiLabel: 'सरपटणारे प्राणी',
    iconName: 'Activity',
    emoji: '🦎',
    description: 'Lizards, snakes, turtles, tortoises, crocodilians'
  },
  {
    id: 'amphibians',
    label: 'Amphibians',
    hindiLabel: 'उभयचर',
    marathiLabel: 'उभयचर प्राणी',
    iconName: 'Droplet',
    emoji: '🐸',
    description: 'Frogs, toads, salamanders'
  },
  {
    id: 'aquatic',
    label: 'Aquatic & Fish',
    hindiLabel: 'जलीय जीव / मछली',
    marathiLabel: 'जलचर / मासे',
    iconName: 'Fish',
    emoji: '🐟',
    description: 'Freshwater fish, pond fish, koi, ornamental fish'
  },
  {
    id: 'other',
    label: 'Other / Custom',
    hindiLabel: 'अन्य जीव',
    marathiLabel: 'इतर प्राणी',
    iconName: 'HelpCircle',
    emoji: '✨',
    description: 'Enter custom animal or unlisted species'
  }
];

export const ALL_SPECIES: AnimalSpeciesDef[] = [
  // LIVESTOCK
  { id: 'cow', name: 'Cow', category: 'livestock', emoji: '🐄', hindiName: 'गाय', marathiName: 'गाय', isPopular: true, isDairyMammal: true },
  { id: 'buffalo', name: 'Buffalo', category: 'livestock', emoji: '🐃', hindiName: 'भैंस', marathiName: 'म्हैस', isPopular: true, isDairyMammal: true },
  { id: 'goat', name: 'Goat', category: 'livestock', emoji: '🐐', hindiName: 'बकरी', marathiName: 'शेळी', isPopular: true, isDairyMammal: true },
  { id: 'sheep', name: 'Sheep', category: 'livestock', emoji: '🐑', hindiName: 'भेड़', marathiName: 'मेंढी', isPopular: true, isDairyMammal: true },
  { id: 'bull', name: 'Bull', category: 'livestock', emoji: '🐂', hindiName: 'बैल', marathiName: 'बैल' },
  { id: 'calf', name: 'Calf', category: 'livestock', emoji: '🐮', hindiName: 'बछड़ा / बछड़ी', marathiName: 'वासरू' },
  { id: 'pig', name: 'Pig', category: 'livestock', emoji: '🐖', hindiName: 'सूअर', marathiName: 'डुक्कर' },
  { id: 'horse', name: 'Horse', category: 'livestock', emoji: '🐎', hindiName: 'घोड़ा', marathiName: 'घोडा', isPopular: true },
  { id: 'donkey', name: 'Donkey', category: 'livestock', emoji: '🫏', hindiName: 'गधा', marathiName: 'गाढव' },
  { id: 'mule', name: 'Mule', category: 'livestock', emoji: '🐴', hindiName: 'खच्चर', marathiName: 'खेचर' },
  { id: 'camel', name: 'Camel', category: 'livestock', emoji: '🐪', hindiName: 'ऊंट', marathiName: 'उंट', isDairyMammal: true },
  { id: 'yak', name: 'Yak', category: 'livestock', emoji: '🐂', hindiName: 'याक', marathiName: 'याक', isDairyMammal: true },
  { id: 'llama', name: 'Llama', category: 'livestock', emoji: '🦙', hindiName: 'लामा', marathiName: 'लामा' },
  { id: 'alpaca', name: 'Alpaca', category: 'livestock', emoji: '🦙', hindiName: 'अल्पाका', marathiName: 'अल्पाका' },

  // POULTRY
  { id: 'chicken', name: 'Chicken', category: 'poultry', emoji: '🐓', hindiName: 'मुर्गी', marathiName: 'कोंबडी', isPopular: true },
  { id: 'hen', name: 'Hen', category: 'poultry', emoji: '🐔', hindiName: 'मुर्गी', marathiName: 'कोंबडी' },
  { id: 'rooster', name: 'Rooster', category: 'poultry', emoji: '🐓', hindiName: 'मुर्गा', marathiName: 'कोंबडा' },
  { id: 'duck', name: 'Duck', category: 'poultry', emoji: '🦆', hindiName: 'बतख', marathiName: 'बदक' },
  { id: 'goose', name: 'Goose', category: 'poultry', emoji: '🪿', hindiName: 'कलहंस', marathiName: 'हंस' },
  { id: 'turkey', name: 'Turkey', category: 'poultry', emoji: '🦃', hindiName: 'टर्की', marathiName: 'टर्की' },
  { id: 'quail', name: 'Quail', category: 'poultry', emoji: '🐦', hindiName: 'बटेर', marathiName: 'लावार' },
  { id: 'pigeon_poultry', name: 'Pigeon', category: 'poultry', emoji: '🕊️', hindiName: 'कबूतर', marathiName: 'कबुतर' },
  { id: 'guinea_fowl', name: 'Guinea Fowl', category: 'poultry', emoji: '🦃', hindiName: 'गिनी फाउल / तीतर', marathiName: 'गिनी फाउल' },

  // PETS
  { id: 'dog', name: 'Dog', category: 'pets', emoji: '🐕', hindiName: 'कुत्ता', marathiName: 'कुत्रा', isPopular: true },
  { id: 'cat', name: 'Cat', category: 'pets', emoji: '🐈', hindiName: 'बिल्ली', marathiName: 'मांजर', isPopular: true },
  { id: 'rabbit', name: 'Rabbit', category: 'pets', emoji: '🐇', hindiName: 'खरगोश', marathiName: 'ससा' },
  { id: 'hamster', name: 'Hamster', category: 'pets', emoji: '🐹', hindiName: 'हैम्स्टर', marathiName: 'हॅमस्टर' },
  { id: 'guinea_pig', name: 'Guinea Pig', category: 'pets', emoji: '🐹', hindiName: 'गिनी पिग', marathiName: 'गिनी पिग' },
  { id: 'ferret', name: 'Ferret', category: 'pets', emoji: '🦡', hindiName: 'फेरेट', marathiName: 'फेरेट' },

  // BIRDS
  { id: 'parrot', name: 'Parrot', category: 'birds', emoji: '🦜', hindiName: 'तोता', marathiName: 'पोपट' },
  { id: 'sparrow', name: 'Sparrow', category: 'birds', emoji: '🐦', hindiName: 'गौरैया', marathiName: 'चिमणी' },
  { id: 'crow', name: 'Crow', category: 'birds', emoji: '🐦‍⬛', hindiName: 'कौआ', marathiName: 'कावळा' },
  { id: 'eagle', name: 'Eagle', category: 'birds', emoji: '🦅', hindiName: 'चील / बाज', marathiName: 'गरुड' },
  { id: 'owl', name: 'Owl', category: 'birds', emoji: '🦉', hindiName: 'उल्लू', marathiName: 'घुबड' },
  { id: 'peacock', name: 'Peacock', category: 'birds', emoji: '🦚', hindiName: 'मोर', marathiName: 'मोर' },
  { id: 'other_bird', name: 'Other Bird', category: 'birds', emoji: '🕊️', hindiName: 'अन्य पक्षी', marathiName: 'इतर पक्षी' },

  // WILDLIFE
  { id: 'elephant', name: 'Elephant', category: 'wildlife', emoji: '🐘', hindiName: 'हाथी', marathiName: 'हत्ती' },
  { id: 'deer', name: 'Deer', category: 'wildlife', emoji: '🦌', hindiName: 'हिरण', marathiName: 'हरिण' },
  { id: 'lion', name: 'Lion', category: 'wildlife', emoji: '🦁', hindiName: 'शेर', marathiName: 'सिंह' },
  { id: 'tiger', name: 'Tiger', category: 'wildlife', emoji: '🐅', hindiName: 'बाघ', marathiName: 'वाघ' },
  { id: 'leopard', name: 'Leopard', category: 'wildlife', emoji: '🐆', hindiName: 'तेंदुआ', marathiName: 'बिबट्या' },
  { id: 'cheetah', name: 'Cheetah', category: 'wildlife', emoji: '🐆', hindiName: 'चीता', marathiName: 'चित्ता' },
  { id: 'bear', name: 'Bear', category: 'wildlife', emoji: '🐻', hindiName: 'भालू', marathiName: 'अस्वल' },
  { id: 'wolf', name: 'Wolf', category: 'wildlife', emoji: '🐺', hindiName: 'भेड़िया', marathiName: 'लांडगा' },
  { id: 'fox', name: 'Fox', category: 'wildlife', emoji: '🦊', hindiName: 'लोमड़ी', marathiName: 'कोल्हा' },
  { id: 'monkey', name: 'Monkey', category: 'wildlife', emoji: '🐒', hindiName: 'बंदर', marathiName: 'माकड' },
  { id: 'gorilla', name: 'Gorilla', category: 'wildlife', emoji: '🦍', hindiName: 'गोरिल्ला', marathiName: 'गोरिला' },
  { id: 'zebra', name: 'Zebra', category: 'wildlife', emoji: '🦓', hindiName: 'ज़ेबरा', marathiName: 'झेंब्रा' },
  { id: 'giraffe', name: 'Giraffe', category: 'wildlife', emoji: '🦒', hindiName: 'जिराफ़', marathiName: 'जिराफ' },
  { id: 'rhinoceros', name: 'Rhinoceros', category: 'wildlife', emoji: '🦏', hindiName: 'गैंडा', marathiName: 'गेंडा' },
  { id: 'hippopotamus', name: 'Hippopotamus', category: 'wildlife', emoji: '🦛', hindiName: 'दरियाई घोड़ा', marathiName: 'पाणघोडा' },
  { id: 'wild_boar', name: 'Wild Boar', category: 'wildlife', emoji: '🐗', hindiName: 'जंगली सूअर', marathiName: 'रानडुक्कर' },
  { id: 'other_wildlife', name: 'Other Wildlife', category: 'wildlife', emoji: '🐾', hindiName: 'अन्य वन्यजीव', marathiName: 'इतर वन्यजीव' },

  // REPTILES
  { id: 'snake', name: 'Snake', category: 'reptiles', emoji: '🐍', hindiName: 'सांप', marathiName: 'साप' },
  { id: 'lizard', name: 'Lizard', category: 'reptiles', emoji: '🦎', hindiName: 'छिपकली', marathiName: 'पाल' },
  { id: 'turtle', name: 'Turtle', category: 'reptiles', emoji: '🐢', hindiName: 'कछुआ (जल)', marathiName: 'कासव' },
  { id: 'tortoise', name: 'Tortoise', category: 'reptiles', emoji: '🐢', hindiName: 'कछुआ (स्थल)', marathiName: 'कासव' },
  { id: 'crocodile', name: 'Crocodile', category: 'reptiles', emoji: '🐊', hindiName: 'मगरमच्छ', marathiName: 'मगर' },
  { id: 'alligator', name: 'Alligator', category: 'reptiles', emoji: '🐊', hindiName: 'घड़ियाल / एलीगेटर', marathiName: 'घडियाळ' },

  // AMPHIBIANS
  { id: 'frog', name: 'Frog', category: 'amphibians', emoji: '🐸', hindiName: 'मेंढक', marathiName: 'बेडूक' },
  { id: 'toad', name: 'Toad', category: 'amphibians', emoji: '🐸', hindiName: 'टोड / मेंढक', marathiName: 'टोड' },
  { id: 'salamander', name: 'Salamander', category: 'amphibians', emoji: '🦎', hindiName: 'सलामेंडर', marathiName: 'सॅलॅमँडर' },

  // AQUATIC
  { id: 'fish', name: 'Fish', category: 'aquatic', emoji: '🐟', hindiName: 'मछली', marathiName: 'मासा' },
  { id: 'koi', name: 'Koi', category: 'aquatic', emoji: '🐠', hindiName: 'कोई मछली', marathiName: 'कोई मासा' },
  { id: 'goldfish', name: 'Goldfish', category: 'aquatic', emoji: '🐡', hindiName: 'गोल्डफिश', marathiName: 'गोल्डफिश' },
  { id: 'other_aquatic', name: 'Other Aquatic Animal', category: 'aquatic', emoji: '🐙', hindiName: 'अन्य जलीय जीव', marathiName: 'इतर जलचर' },

  // OTHER
  { id: 'other_custom', name: 'Custom / Other Animal', category: 'other', emoji: '✨', hindiName: 'अन्य कोई पशु / जीव', marathiName: 'इतर कोणताही प्राणी' }
];

export const POPULAR_SPECIES = ALL_SPECIES.filter((s) => s.isPopular);

export function getSpeciesById(id: string): AnimalSpeciesDef | undefined {
  return ALL_SPECIES.find((s) => s.id.toLowerCase() === id.toLowerCase() || s.name.toLowerCase() === id.toLowerCase());
}

export function searchSpecies(query: string, categoryFilter?: AnimalCategory | 'all'): AnimalSpeciesDef[] {
  const cleanQ = query.trim().toLowerCase();
  return ALL_SPECIES.filter((species) => {
    if (categoryFilter && categoryFilter !== 'all' && species.category !== categoryFilter) {
      return false;
    }
    if (!cleanQ) return true;
    return (
      species.name.toLowerCase().includes(cleanQ) ||
      species.hindiName.toLowerCase().includes(cleanQ) ||
      species.marathiName.toLowerCase().includes(cleanQ) ||
      species.category.toLowerCase().includes(cleanQ)
    );
  });
}

// Animal-specific dynamic symptoms
export interface SymptomPreset {
  id: string;
  label: string;
  category: 'general' | 'digestive' | 'respiratory' | 'skin_coat' | 'motor' | 'specific';
  applicableCategories?: AnimalCategory[];
}

export const COMPREHENSIVE_SYMPTOMS: SymptomPreset[] = [
  // Universal
  { id: 'fever', label: 'Fever / High Body Temperature', category: 'general' },
  { id: 'lethargy', label: 'Weakness / Lethargy / Dullness', category: 'general' },
  { id: 'anorexia', label: 'Loss of Appetite / Not Eating', category: 'digestive' },
  { id: 'coughing', label: 'Coughing', category: 'respiratory', applicableCategories: ['livestock', 'pets', 'wildlife'] },
  { id: 'dyspnea', label: 'Difficulty Breathing / Panting', category: 'respiratory' },
  { id: 'nasal_discharge', label: 'Nasal Discharge (Runny nose)', category: 'respiratory', applicableCategories: ['livestock', 'pets', 'poultry', 'birds', 'wildlife'] },
  { id: 'eye_discharge', label: 'Eye Discharge / Redness / Swelling', category: 'general' },
  { id: 'skin_lesions', label: 'Wounds / Lesions / Ulcers / Lumps', category: 'skin_coat' },
  { id: 'hair_feather_loss', label: 'Hair, Feather or Scale Loss', category: 'skin_coat' },
  { id: 'itching', label: 'Excessive Scratching / Itching / Rubbing', category: 'skin_coat' },
  { id: 'swelling', label: 'Body Swelling / Edema', category: 'general' },
  { id: 'diarrhea', label: 'Diarrhea / Loose or Watery Stools', category: 'digestive' },
  { id: 'vomiting', label: 'Vomiting / Regurgitation', category: 'digestive', applicableCategories: ['pets', 'birds', 'poultry', 'wildlife'] },
  { id: 'lameness', label: 'Difficulty Walking / Limping / Lameness', category: 'motor', applicableCategories: ['livestock', 'pets', 'wildlife', 'poultry'] },
  { id: 'abnormal_behavior', label: 'Abnormal Behavior / Restlessness / Circling', category: 'general' },

  // Dairy & Ruminant specific
  { id: 'reduced_milk', label: 'Sudden Drop in Milk Production', category: 'specific', applicableCategories: ['livestock'] },
  { id: 'udder_swelling', label: 'Udder Swelling / Pain / Hot to touch (Mastitis)', category: 'specific', applicableCategories: ['livestock'] },
  { id: 'salivation', label: 'Excessive Drooling / Frothing at Mouth', category: 'specific', applicableCategories: ['livestock', 'pets', 'wildlife'] },
  { id: 'bloat', label: 'Abdominal Swelling / Gas / Bloat', category: 'digestive', applicableCategories: ['livestock'] },

  // Poultry & Bird specific
  { id: 'egg_drop', label: 'Drop in Egg Production / Soft-shell Eggs', category: 'specific', applicableCategories: ['poultry', 'birds'] },
  { id: 'ruffled_feathers', label: 'Ruffled Feathers / Drooping Wings', category: 'specific', applicableCategories: ['poultry', 'birds'] },
  { id: 'comb_wattle_pale', label: 'Pale or Discolored Comb / Wattle', category: 'specific', applicableCategories: ['poultry'] },

  // Aquatic specific
  { id: 'fin_rot', label: 'Fin Rot / Clamped Fins / Floating on side', category: 'specific', applicableCategories: ['aquatic'] },
  { id: 'gasping_surface', label: 'Gasping for Air at Water Surface', category: 'specific', applicableCategories: ['aquatic'] },
  { id: 'white_spots', label: 'White Spots (Ich) or Fungal Growth on scales', category: 'specific', applicableCategories: ['aquatic'] },

  // Reptile & Amphibian specific
  { id: 'abnormal_shedding', label: 'Incomplete Shedding / Retained Skin', category: 'specific', applicableCategories: ['reptiles'] },
  { id: 'lethargy_cold', label: 'Inability to move / Hypothermia', category: 'specific', applicableCategories: ['reptiles', 'amphibians'] },
  { id: 'skin_discoloration', label: 'Discolored or Slimey Skin Patches', category: 'specific', applicableCategories: ['amphibians'] }
];

export function getSymptomsForCategory(category: AnimalCategory): SymptomPreset[] {
  return COMPREHENSIVE_SYMPTOMS.filter((s) => {
    if (!s.applicableCategories) return true;
    return s.applicableCategories.includes(category);
  });
}
