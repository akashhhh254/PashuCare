import { Language } from '../types';

export interface RuleBasedInput {
  animalType: string;
  animalCategory?: string;
  animalName?: string;
  breed?: string;
  age?: string;
  sex?: string;
  symptoms?: string[];
  temperature?: string;
  behavior?: string;
  appetite?: string;
  waterIntake?: string;
  milkProduction?: string;
  duration?: string;
  additionalInformation?: string;
  language?: Language;
}

export function generateRuleBasedAssessment(input: RuleBasedInput) {
  const lang = input.language || 'en';
  const species = input.animalType || 'Livestock';
  const speciesLower = species.toLowerCase();
  const symptoms = (input.symptoms || []).map(s => s.trim());
  const symptomsLower = symptoms.map(s => s.toLowerCase());
  const notes = (input.additionalInformation || '').toLowerCase();
  const temp = input.temperature || 'Normal';
  const behavior = input.behavior || 'Active & Alert';
  const appetite = input.appetite || 'Normal';
  const water = input.waterIntake || 'Normal';
  const milk = input.milkProduction || 'Normal';
  const duration = input.duration || '1-2 days';

  // Helper to check if text or symptoms contains terms
  const has = (...terms: string[]) => {
    return terms.some(t => {
      const tl = t.toLowerCase();
      return symptomsLower.some(s => s.includes(tl)) || notes.includes(tl);
    });
  };

  const isBovine = speciesLower.includes('cow') || speciesLower.includes('bull') || speciesLower.includes('calf') || speciesLower.includes('cattle') || speciesLower.includes('buffalo');
  const isCaprine = speciesLower.includes('goat') || speciesLower.includes('sheep') || speciesLower.includes('lamb');
  const isPoultry = speciesLower.includes('chicken') || speciesLower.includes('hen') || speciesLower.includes('poultry') || speciesLower.includes('duck') || speciesLower.includes('bird');
  const isCanine = speciesLower.includes('dog') || speciesLower.includes('puppy');
  const isFeline = speciesLower.includes('cat') || speciesLower.includes('kitten');

  // Determine urgency, conditions, actions, and observations
  let urgency: 'routine' | 'soon' | 'urgent' | 'emergency' = 'routine';
  let conditions: Array<{ name: string; likelihood: 'low' | 'moderate' | 'high'; reason: string; confidence: number }> = [];
  let observations: string[] = [];
  let immediateActions: string[] = [];
  let warningSigns: string[] = [];
  let summaryText = '';
  let vetRecommendation = '';

  // 1. Gather Clinical Observations
  if (symptoms.length > 0) {
    observations.push(lang === 'hi' ? `चिन्हित लक्षण: ${symptoms.join(', ')}` : lang === 'mr' ? `नोंदवलेली लक्षणे: ${symptoms.join(', ')}` : `Reported signs: ${symptoms.join(', ')}`);
  }
  if (temp.includes('Fever') || temp.includes('Warm') || temp.includes('Hot')) {
    observations.push(lang === 'hi' ? `तापमान: ${temp} (ज्वर/ताप की संभावना)` : lang === 'mr' ? `तापमान: ${temp} (ताप संभाव्य)` : `Elevated body temperature (${temp})`);
  }
  if (behavior.includes('Lying') || behavior.includes('Dull') || behavior.includes('Unable') || behavior.includes('Restless')) {
    observations.push(lang === 'hi' ? `व्यवहार: ${behavior}` : lang === 'mr' ? `वर्तन: ${behavior}` : `Altered demeanor/activity: ${behavior}`);
  }
  if (appetite.includes('Reduced') || appetite.includes('off')) {
    observations.push(lang === 'hi' ? `भूख: ${appetite}` : lang === 'mr' ? `भूक: ${appetite}` : `Appetite status: ${appetite}`);
  }
  if (milk.includes('Reduced') || milk.includes('Drop')) {
    observations.push(lang === 'hi' ? `दूध उत्पादन: गिरावट देखी गई` : lang === 'mr' ? `दूध उत्पादन: घट नोंदवली` : `Milk yield reduction noted`);
  }
  if (observations.length === 0) {
    observations.push(lang === 'hi' ? 'सामान्य शारीरिक अवलोकन' : lang === 'mr' ? 'सामान्य निरीक्षण' : 'General clinical observation');
  }

  // 2. Clinical Evaluation Matrix
  const isInsufficientInfo = symptoms.length === 0 && !notes.trim();

  if (isInsufficientInfo) {
    urgency = 'routine';
    conditions.push({
      name: lang === 'hi' ? 'अधूरी जानकारी - निरंतर निगरानी आवश्यक' : lang === 'mr' ? 'अपुऱ्या माहितीमुळे निरीक्षण आवश्यक' : 'Inconclusive - Regular Observation Advised',
      likelihood: 'low',
      reason: lang === 'hi' ? 'विशिष्ट रोग लक्षणों का उल्लेख नहीं किया गया है।' : lang === 'mr' ? 'विशिष्ट रोगाची लक्षणे स्पष्ट नाहीत.' : 'No specific acute signs or lesions were indicated.',
      confidence: 60
    });
    summaryText = lang === 'hi'
      ? 'विश्वसनीय मूल्यांकन के लिए अधिक जानकारी की आवश्यकता है। कृपया तापमान, जुगाली, आहार या किसी दिखाई देने वाले घाव का विवरण जोड़ें।'
      : lang === 'mr'
      ? 'विश्वसनीय मूल्यांकनासाठी अधिक माहिती आवश्यक आहे. कृपया तापमान, रवंथ, खुराक किंवा जखमांची माहिती द्या.'
      : 'More information is needed for a reliable assessment. Provide body temperature, cud chewing observations, feed intake, or photograph for specific differential assessment.';
    immediateActions = [
      lang === 'hi' ? 'पशु का डिजिटल थर्मामीटर से गुदा तापमान (Rectal Temperature) मापें।' : 'Measure animal rectal temperature with a digital veterinary thermometer.',
      lang === 'hi' ? 'जांचें कि पशु जुगाली (Rumination) सामान्य रूप से कर रहा है या नहीं।' : 'Observe whether the animal is chewing its cud (rumination) normally.',
      lang === 'hi' ? 'पशु को साफ, हवादार और सूखा आश्रय प्रदान करें।' : 'Provide a clean, dry, well-ventilated resting shelter with clean water.'
    ];
    warningSigns = [
      lang === 'hi' ? '24 घंटे से अधिक समय तक चारा-पानी बंद रहना।' : 'Complete refusal of feed or water for over 24 hours.',
      lang === 'hi' ? 'अचानक बैठने के बाद खड़े होने में असमर्थता।' : 'Inability to stand up or sudden collapse.',
      lang === 'hi' ? 'तेज बुखार या शरीर/कानों का असामान्य रूप से ठंडा होना।' : 'High persistent fever or subnormal body temperature.'
    ];
  }
  // Check for Life Threats (Emergency)
  else if (has('bloat', 'swollen stomach', 'gas', 'tympan', 'अफरा', 'पोट फुगणे') || (has('breathing', 'difficulty breathing', 'सांस', 'श्वास') && behavior.includes('Lying'))) {
    urgency = 'emergency';
    conditions.push({
      name: lang === 'hi' ? 'तीव्र अफरा / गैस जमाव (Acute Ruminal Bloat)' : lang === 'mr' ? 'तीव्र पोट फुगणे (Acute Bloat)' : 'Acute Ruminal Bloat / Respiratory Distress',
      likelihood: 'high',
      reason: lang === 'hi' ? 'बाईं कोख में सूजन, सांस लेने में तकलीफ और बेचैनी के संकेत।' : lang === 'mr' ? 'डाव्या बाजूला पोट फुगणे व श्वास घेण्यास त्रास.' : 'Left flank distension and laboured breathing indicate acute gas accumulation or respiratory crisis.',
      confidence: 88
    });
    summaryText = lang === 'hi'
      ? 'यह एक आपातकालीन स्थिति है। पशु को बैठने न दें और तुरंत आपातकालीन पशु चिकित्सक को बुलाएं।'
      : lang === 'mr'
      ? 'ही आणीबाणीची स्थिती आहे. जनावराला बसू देऊ नका व त्वरित पशुवैद्यकीय मदत घ्या.'
      : 'Urgent medical emergency. Distended abdomen with laboured respiration threatens diaphragm collapse. Keep animal standing with front quarters elevated.';
    immediateActions = [
      lang === 'hi' ? 'पशु को चलने दें और खड़ा रखें, आगे के पैरों को ऊंचाई पर रखें।' : 'Keep animal standing with head and forequarters slightly elevated.',
      lang === 'hi' ? 'मुंह में लकड़ी या रस्सी की लगाम लगाएं ताकि लार व गैस निकलने में मदद मिले।' : 'Place a wooden gag or bit across the mouth to encourage salivation and gas release.',
      lang === 'hi' ? 'तुरंत नजदीकी पशु चिकित्सालय या हेल्पलाइन 1962 पर कॉल करें।' : 'Contact immediate veterinary emergency helpline (1962).'
    ];
    warningSigns = [
      lang === 'hi' ? 'जीभ बाहर निकलना और नीली पड़ना' : 'Cyanosis / blue or pale tongue and gums',
      lang === 'hi' ? 'पशु का लड़खड़ाकर गिरना' : 'Staggering, severe groaning, or sudden collapse'
    ];
  }
  // Check Bovine FMD (Foot & Mouth)
  else if (isBovine && has('mouth', 'saliva', 'salivation', 'drool', 'tongue', 'hoof', 'blister', 'erosion', 'लार', 'मुंह', 'खुर', 'खुरपका')) {
    urgency = 'urgent';
    conditions.push({
      name: lang === 'hi' ? 'खुरपका-मुंहपका रोग (Foot and Mouth Disease - FMD)' : lang === 'mr' ? 'लाळ्या खुरकूत (Foot & Mouth Disease - FMD)' : 'Foot and Mouth Disease (FMD / खुरपका-मुंहपका)',
      likelihood: 'high',
      reason: lang === 'hi' ? 'मुंह से अत्यधिक लार टपकना, मुंह या खुरों में छाले और लंगड़ापन।' : lang === 'mr' ? 'तोंडातून लाळ गळणे, खुर आणि तोंडावर फोड येणे.' : 'Profuse ropy salivation and erosions on oral mucosa and interdigital spaces.',
      confidence: 90
    });
    summaryText = lang === 'hi'
      ? 'लक्षण खुरपका-मुंहपका (FMD) की ओर संकेत करते हैं। यह एक अत्यधिक संक्रामक विषाणु रोग है। पशु को तुरंत अलग करें।'
      : lang === 'mr'
      ? 'लक्षणे लाळ्या खुरकूत (FMD) दर्शवतात. हा संसर्गजन्य रोग असल्याने जनावराला त्वरित वेगळे ठेवा.'
      : 'Signs strongly indicate suspected Foot and Mouth Disease (FMD). Highly contagious viral disease requiring immediate herd isolation and strict biosecurity.';
    immediateActions = [
      lang === 'hi' ? 'रोगी पशु को तुरंत बाकी स्वस्थ पशुओं से अलग (Isolate) करें।' : 'Isolate the affected animal immediately from the herd.',
      lang === 'hi' ? 'मुंह के छालों को पोटाश (KMNO4 1:1000) या बोरोग्लिसरीन से हल्के हाथों से धोएं।' : 'Wash mouth lesions gently with mild 1:1000 potassium permanganate or boroglycerin.',
      lang === 'hi' ? 'खुरों को साफ और सूखा रखें, कॉपर सल्फेट (2%) घोल का फुट-बाथ इस्तेमाल करें।' : 'Keep feet clean and dry; treat foot lesions with antiseptic to prevent fly strike (maggots).',
      lang === 'hi' ? 'मुलायम दलिया, गुड़ और सुपाच्य चारा दें।' : 'Provide soft gruel (cooked broken wheat or rice porridge with jaggery).'
    ];
    warningSigns = [
      lang === 'hi' ? 'खुरों में कीड़े (Maggots) पड़ना' : 'Maggot infestation in hoof clefts',
      lang === 'hi' ? 'तेज बुखार के साथ बछड़ों में अचानक मृत्यु' : 'High fever or acute mortality in calves',
      lang === 'hi' ? 'दूध में अचानक 90% से अधिक गिरावट' : 'Complete cessation of lactation'
    ];
  }
  // Check Bovine Lumpy Skin Disease (LSD)
  else if (isBovine && has('nodule', 'lump', 'skin', 'bump', 'गांठ', 'लंपी', 'त्वचा')) {
    urgency = 'urgent';
    conditions.push({
      name: lang === 'hi' ? 'लंपी त्वचा रोग (Lumpy Skin Disease - LSD)' : lang === 'mr' ? 'लम्पी त्वचा रोग (Lumpy Skin Disease)' : 'Lumpy Skin Disease (LSD / लंपी त्वचा रोग)',
      likelihood: 'high',
      reason: lang === 'hi' ? 'शरीर पर गोल गांठें (Nodules), बुखार और पैरों में सूजन।' : lang === 'mr' ? 'अंगावर गाठी, ताप आणि पायांवर सूज.' : 'Firm circumscribed cutaneous nodules across head, neck, and limbs with fever.',
      confidence: 88
    });
    summaryText = lang === 'hi'
      ? 'त्वचा पर गांठें लंपी त्वचा रोग (LSD) का संकेत हैं। यह मच्छरों, मक्खियों और चिचड़ियों से फैलता है।'
      : lang === 'mr'
      ? 'त्वचेवरील गाठी लम्पी रोगाची लक्षणे दर्शवतात. डास आणि गोचीड नियंत्रण तातडीने करा.'
      : 'Observations match Lumpy Skin Disease (LSD). Vector-borne capripoxvirus requires strict fly/tick control and supportive wound care.';
    immediateActions = [
      lang === 'hi' ? 'मच्छर और मक्खियों को भगाने के लिए नीम के पत्तों का धुआं करें।' : 'Control vector flies and mosquitoes around shed using neem smoke or herbal sprays.',
      lang === 'hi' ? 'फूटने वाली गांठों पर नीम का तेल या पोवीडोन आयोडीन मलहम लगाएं।' : 'Apply povidone-iodine ointment or neem oil on ruptured nodules to prevent secondary flies.',
      lang === 'hi' ? 'इलेक्ट्रोलाइट्स युक्त पानी और गिलोय/हल्दी युक्त सुपाच्य आहार दें।' : 'Administer electrolyte fluids with turmeric and herbal supportive diet.'
    ];
    warningSigns = [
      lang === 'hi' ? 'गांठों में कीड़े पड़ना' : 'Fly strike / maggots developing in skin lesions',
      lang === 'hi' ? 'गले और फेफड़ों में सूजन से सांस लेने में कठिनाई' : 'Severe respiratory distress or laryngeal edema'
    ];
  }
  // Check Bovine Mastitis (Udder Swelling)
  else if (isBovine && (has('udder', 'milk', 'swelling', 'thanal', 'mastitis', 'थनैला', 'स्तन', 'दूध') || milk.includes('Reduced'))) {
    urgency = 'urgent';
    conditions.push({
      name: lang === 'hi' ? 'थनैला रोग (Bovine Mastitis)' : lang === 'mr' ? 'स्तनदाह / मस्टायटिस (Mastitis)' : 'Bovine Mastitis (थनैला रोग)',
      likelihood: 'high',
      reason: lang === 'hi' ? 'अयन (Udder) में सूजन, कड़ापन या दूध में थक्के/रंग बदलना।' : lang === 'mr' ? 'कास सुजणे, कडक होणे किंवा दुधात गुठळ्या.' : 'Udder inflammation, heat, tenderness, and abnormal milk secretion.',
      confidence: 86
    });
    summaryText = lang === 'hi'
      ? 'अयन में सूजन और दूध में बदलाव थनैला (Mastitis) का संकेत है। दूध की गुणवत्ता बचाने के लिए तत्काल उपचार आवश्यक है।'
      : lang === 'mr'
      ? 'कास सुजणे व दुधातील बदल मस्टायटिस दर्शवतात. तातडीने पशुवैद्यकीय सल्ला घ्या.'
      : 'Signs strongly indicate Bovine Mastitis. Bacterial intramammary infection requires early veterinary evaluation to preserve quarter lactation.';
    immediateActions = [
      lang === 'hi' ? 'संक्रमित थन का सारा खराब दूध एक अलग बर्तन में दुहकर नष्ट करें।' : 'Strip affected quarter completely and safely discard infected milk.',
      lang === 'hi' ? 'गर्म सूजन होने पर बर्फ की सिकाई करें, यदि सूजन पुरानी हो तो गुनगुने पानी में नमक डालकर सिकाई करें।' : 'Apply cold water compresses if udder is hot and acutely swollen.',
      lang === 'hi' ? 'पशु के बैठने की जगह को सूखा, चूना छिड़का और साफ रखें।' : 'Keep floor dry, hygienic, and dusted with slaked lime.'
    ];
    warningSigns = [
      lang === 'hi' ? 'थन काला या ठंडा पड़ना (Gangrenous Mastitis)' : 'Cold, dark/blue discoloration of teat (gangrene)',
      lang === 'hi' ? 'दूध में खून या मवाद आना' : 'Profuse bloody or purulent milk discharge'
    ];
  }
  // Check Goat / Sheep PPR
  else if (isCaprine && has('fever', 'diarrhea', 'mouth', 'cough', 'nasal', 'दस्त', 'ताप', 'बकरी')) {
    urgency = 'urgent';
    conditions.push({
      name: lang === 'hi' ? 'बकरी प्लेग (PPR - Peste des Petits Ruminants)' : lang === 'mr' ? 'शेळी-मेंढी प्लेग (PPR)' : 'PPR (Peste des Petits Ruminants / Goat Plague)',
      likelihood: 'high',
      reason: lang === 'hi' ? 'बुखार, नाक-आंखों से स्राव, मुंह में छाले और बदबूदार दस्त।' : lang === 'mr' ? 'ताप, तोंडात फोड, नाकातून स्त्राव व जुलाब.' : 'Classic triad of pyrexia, catarrhal oculonasal discharge, necrotizing stomatitis, and diarrhea.',
      confidence: 85
    });
    summaryText = lang === 'hi'
      ? 'लक्षण पीपीआर (PPR) की ओर संकेत करते हैं। यह बकरियों और भेड़ों में एक गंभीर विषाणुजनित रोग है।'
      : lang === 'mr'
      ? 'लक्षणे पीपीआर दर्शवतात. हा शेळ्या-मेंढ्यांमधील गंभीर संसर्गजन्य आजार आहे.'
      : 'Signs suggestive of PPR (Peste des Petits Ruminants). High mortality if dehydration and secondary pneumonia are left unmanaged.';
    immediateActions = [
      lang === 'hi' ? 'ओआरएस (ORS) या नमक-चीनी का घोल बार-बार पिलाएं ताकि डिहाइड्रेशन न हो।' : 'Administer oral rehydration solution (ORS) every 3-4 hours.',
      lang === 'hi' ? 'पशु को गर्म, सूखे और हवादार स्थान पर रखें।' : 'Isolate in a warm, clean, draft-free pen.',
      lang === 'hi' ? 'मुंह के छालों पर बोरोग्लिसरीन लगाएं।' : 'Clean mouth with warm saline and apply boroglycerin.'
    ];
    warningSigns = [
      lang === 'hi' ? 'तेज सांस और फेफड़ों से घुरघुराहट' : 'Severe dyspnea / pneumonia rattle',
      lang === 'hi' ? 'अत्यधिक कमजोरी और आंखें अंदर धंसना' : 'Sunken eyes and inability to stand'
    ];
  }
  // Check Canine Parvovirus
  else if (isCanine && (has('vomit', 'diarrhea', 'blood', 'उल्टी', 'दस्त') || behavior.includes('Lying') || appetite.includes('off'))) {
    urgency = 'urgent';
    conditions.push({
      name: lang === 'hi' ? 'कैनाइन पार्वोवायरस संक्रमण (Canine Parvovirus Enteritis)' : lang === 'mr' ? 'पार्व्होव्हायरस संसर्ग (Canine Parvovirus)' : 'Canine Parvoviral Enteritis (Suspected)',
      likelihood: 'high',
      reason: lang === 'hi' ? 'उल्टी, खून मिश्रित दस्त, तेज कमजोरी और भूख न लगना।' : lang === 'mr' ? 'उलट्या, रक्ताचे जुलाब व तीव्र अशक्तपणा.' : 'Acute gastrointestinal signs, hemorrhagic diarrhea, and severe dehydration.',
      confidence: 86
    });
    summaryText = lang === 'hi'
      ? 'कुत्ते में उल्टी और दस्त पार्वोवायरस का संकेत हो सकते हैं। इसे तुरंत पशु चिकित्सक के पास ले जाएं।'
      : lang === 'mr'
      ? 'उलट्या व जुलाब पार्व्होचे लक्षण असू शकतात. त्वरित पशुवैद्यकाकडे घेऊन जा.'
      : 'Suspected acute enteritis / Parvovirus. Requires prompt in-clinic veterinary evaluation and intravenous fluid support.';
    immediateActions = [
      lang === 'hi' ? 'पशु को ठोस खाना न दें। उसे गर्म और शांत जगह पर रखें।' : 'Withhold solid food temporarily; keep patient in a warm, quiet environment.',
      lang === 'hi' ? 'पशु चिकित्सक के पास तुरंत ले जाएं (आईवी फ्लुइड्स की आवश्यकता हो सकती है)।' : 'Transport immediately to a veterinary clinic for IV fluid therapy.'
    ];
    warningSigns = [
      lang === 'hi' ? 'खून की उल्टी या अत्यधिक बदबूदार खूनी दस्त' : 'Severe bloody vomiting or foul-smelling hemorrhagic stool',
      lang === 'hi' ? 'पशु का बिल्कुल ठंडा पड़ना' : 'Hypothermia / cold paws and collapse'
    ];
  }
  // Check Respiratory Infection / Cough / Pneumonia
  else if (has('cough', 'nasal', 'discharge', 'respiratory', 'खांसी', 'छींक', 'खोकला')) {
    urgency = 'soon';
    conditions.push({
      name: lang === 'hi' ? 'श्वसन तंत्र संक्रमण / ब्रोंकाइटिस (Respiratory Tract Infection)' : lang === 'mr' ? 'श्वसन नलिका संसर्ग (Respiratory Infection)' : 'Bovine Respiratory Complex / Bronchitis',
      likelihood: 'moderate',
      reason: lang === 'hi' ? 'खांसी, नाक से स्राव और हल्के बुखार के लक्षण।' : lang === 'mr' ? 'खोकला, नाकातून पाणी व हलका ताप.' : 'Nasal exudate and persistent cough indicate upper or lower respiratory irritation.',
      confidence: 76
    });
    summaryText = lang === 'hi'
      ? 'श्वसन संक्रमण के लक्षण दिखाई दे रहे हैं। ठंडी हवा और धूल से बचाएं।'
      : lang === 'mr'
      ? 'श्वसन संसर्गाची लक्षणे दिसत आहेत. थंड वारे आणि धुळीपासून जनावराचा बचाव करा.'
      : 'Clinical signs point to upper respiratory tract involvement. Monitor lung sounds and breathing rate closely.';
    immediateActions = [
      lang === 'hi' ? 'पशु को तेज ठंडी हवा और नमी से बचाएं।' : 'Protect animal from cold drafts, damp floors, and dust.',
      lang === 'hi' ? 'भाप की सिकाई (नीलगिरी के तेल के साथ) नाक के लिए लाभदायक होती है।' : 'Provide warm humidified environment or herbal steam inhalation.'
    ];
    warningSigns = [
      lang === 'hi' ? 'मुंह खोलकर सांस लेना और खर्र-खर्र की आवाज' : 'Open-mouth breathing and grunting sound',
      lang === 'hi' ? 'नाक से गाढ़ा पीला या बदबूदार मवाद बहना' : 'Purulent, foul-smelling nasal discharge'
    ];
  }
  // Check Skin / Parasite / Itching
  else if (has('skin', 'itch', 'scratch', 'hair', 'mange', 'tick', 'खुजली', 'बाल झड़ना', 'खाज')) {
    urgency = 'soon';
    conditions.push({
      name: lang === 'hi' ? 'परजीवी त्वचा संक्रमण / खाज (Parasitic Dermatitis / Mange)' : lang === 'mr' ? 'त्वचा संसर्ग / खरुज (Dermatitis / Mange)' : 'Parasitic Dermatitis / Mange (खुजली)',
      likelihood: 'moderate',
      reason: lang === 'hi' ? 'अत्यधिक खुजली, बाल झड़ना और त्वचा पर पपड़ी।' : lang === 'mr' ? 'अंगाला खाज, केस गळणे व खवले.' : 'Pruritus, alopecia, and crusting are characteristic of ectoparasitic infestation.',
      confidence: 78
    });
    summaryText = lang === 'hi'
      ? 'त्वचा की समस्या चिचड़ी, जूं या फंगल संक्रमण के कारण हो सकती है।'
      : lang === 'mr'
      ? 'त्वचेची समस्या गोचीड किंवा बुरशीजन्य संसर्गामुळे असू शकते.'
      : 'Ectoparasitic or dermatological condition suspected. Requires topical management and shed sanitation.';
    immediateActions = [
      lang === 'hi' ? 'पशु को नीम के काढ़े या औषधीय साबुन से नहलाएं।' : 'Wash affected areas with lukewarm neem water or veterinary antiseptic cleanser.',
      lang === 'hi' ? 'बाड़े की दीवारों और फर्श पर चूने का लेप लगाएं ताकि परजीवी नष्ट हों।' : 'Disinfect shed walls and crevices with lime wash to destroy hidden mites/ticks.'
    ];
    warningSigns = [
      lang === 'hi' ? 'खुजलाने से घाव होना और मक्खियां बैठना' : 'Open bleeding excoriations with fly risk',
      lang === 'hi' ? 'त्वचा से बदबूदार स्राव आना' : 'Secondary deep bacterial pyoderma'
    ];
  }
  // Default General Indigestion / Heat Stress / Mild Malady
  else {
    urgency = temp.includes('High') || behavior.includes('Lying') ? 'soon' : 'routine';
    conditions.push({
      name: lang === 'hi' ? 'साधारण अपच / मौसम परिवर्तन प्रभाव (Simple Indigestion / Weather Stress)' : lang === 'mr' ? 'अपचन / हवामान बदल (Indigestion / Stress)' : 'Simple Indigestion / Environmental Stress',
      likelihood: 'moderate',
      reason: lang === 'hi' ? 'आहार परिवर्तन, मौसम या हल्के तनाव के कारण सुस्ती।' : lang === 'mr' ? 'आहारातील बदल किंवा हवामानातील ताणामुळे अशक्तपणा.' : 'Non-specific mild dullness likely secondary to dietary alteration, transient bloat, or weather shift.',
      confidence: 72
    });
    summaryText = lang === 'hi'
      ? 'पशु में हल्के सुस्ती या अपच के संकेत हैं। सुपाच्य चारा दें और तापमान व गोबर की निगरानी रखें।'
      : lang === 'mr'
      ? 'जनावरामध्ये हलकी सुस्ती किंवा अपचनाची लक्षणे आहेत. सुपाच्य चारा द्या व लक्ष ठेवा.'
      : 'General preliminary observation indicates mild digestive or environmental stress. Provide balanced hydration and observe ruminating patterns.';
    immediateActions = [
      lang === 'hi' ? 'पशु को ताजा, साफ पानी और पाचक गुड़-अजवाइन का काढ़ा दें।' : 'Offer fresh clean water and easily digestible warm feed gruel.',
      lang === 'hi' ? 'गोबर की बनावट और जुगाली की दर पर नजर रखें।' : 'Monitor manure consistency, urination, and rumination rate over the next 24 hours.'
    ];
    warningSigns = [
      lang === 'hi' ? 'लगातार 48 घंटे तक चारा न खाना' : 'Persistent anorexia exceeding 48 hours',
      lang === 'hi' ? 'अचानक तेज बुखार आना' : 'Sudden onset of high fever (> 103°F / 39.5°C)'
    ];
  }

  // Determine Overall Status string according to Part 5:
  // "LOW CONCERN or MONITOR or VETERINARY ATTENTION or URGENT"
  let status: 'LOW CONCERN' | 'MONITOR' | 'VETERINARY ATTENTION' | 'URGENT' = 'LOW CONCERN';
  if (urgency === 'emergency') status = 'URGENT';
  else if (urgency === 'urgent') status = 'VETERINARY ATTENTION';
  else if (urgency === 'soon') status = 'MONITOR';
  else status = 'LOW CONCERN';

  // Vet Recommendation text
  vetRecommendation = (urgency === 'emergency' || urgency === 'urgent')
    ? (lang === 'hi'
        ? 'पशु को तुरंत नजदीकी पशु चिकित्सालय में दिखाएं या 1962 टोल-फ्री हेल्पलाइन पर संपर्क करें।'
        : lang === 'mr'
        ? 'जनावराला त्वरित जवळच्या पशुवैद्यकीय दवाखान्यात दाखवा किंवा १९६२ वर संपर्क करा.'
        : 'Consult a licensed veterinary professional promptly for in-person clinical diagnosis and treatment. In India, call 1962 (Toll-Free).')
    : (lang === 'hi'
        ? 'पशु की 24-48 घंटे निगरानी रखें। यदि स्थिति न सुधरे तो पशु चिकित्सक से परामर्श लें।'
        : lang === 'mr'
        ? '२४-४८ तास लक्ष ठेवा. सुधारणा न झाल्यास पशुवैद्यकांचा सल्ला घ्या.'
        : 'Monitor the animal over the next 24-48 hours. If symptoms persist or worsen, schedule a veterinary visit.');

  const confidenceScore = conditions[0]?.confidence || 75;
  const healthScore = urgency === 'emergency' ? 25 : urgency === 'urgent' ? 45 : urgency === 'soon' ? 68 : 88;
  const riskLevel = urgency === 'emergency' ? 'Emergency' : urgency === 'urgent' ? 'High' : urgency === 'soon' ? 'Medium' : 'Low';
  const overallHealthStatus = urgency === 'emergency' ? 'Emergency' : urgency === 'urgent' ? 'High Risk' : urgency === 'soon' ? 'Needs Attention' : 'Healthy';

  return {
    assessment: summaryText,
    possible_conditions: conditions,
    observations,
    recommended_actions: immediateActions,
    warning_signs: warningSigns,
    urgency,
    status,
    veterinary_recommendation: vetRecommendation,
    confidence: confidenceScore,

    // Strict schema representation
    animal: {
      species,
      breed: input.breed || '',
      name: input.animalName || '',
      age: input.age || '',
      sex: input.sex || ''
    },
    analysis: {
      possible_conditions: conditions,
      observed_symptoms: observations,
      severity: urgency === 'emergency' ? 'emergency' : urgency === 'urgent' ? 'high' : urgency === 'soon' ? 'moderate' : 'low',
      confidence: confidenceScore,
      summary: summaryText
    },
    recommendations: immediateActions,
    immediate_actions: immediateActions,
    veterinarian_required: urgency === 'emergency' || urgency === 'urgent',
    emergency: urgency === 'emergency',

    // Backward-compatible fields
    animalDetected: true,
    detectedAnimalType: species,
    overallHealthStatus,
    riskLevel,
    possibleConditions: conditions.map(c => ({
      name: c.name,
      confidence: c.confidence,
      reason: c.reason
    })),
    visibleSymptoms: observations,
    reportedSymptoms: symptoms,
    possibleCauses: conditions.map(c => c.name),
    generalRecommendations: immediateActions,
    preventionTips: warningSigns,
    medicinesAndTreatment: {
      firstAidMedications: immediateActions,
      veterinaryDrugs: [
        lang === 'hi'
          ? 'एंटीबायोटिक्स या विशेष दवाओं के लिए कृपया पंजीकृत पशु चिकित्सक से नुस्खा प्राप्त करें।'
          : 'Prescription antibiotics and injectables must always be prescribed by a licensed veterinarian.'
      ],
      supportiveCare: immediateActions,
      safetyPrecautions: 'Never administer prescription human medicines or unverified dosages to livestock.'
    },
    veterinarianRecommended: urgency === 'emergency' || urgency === 'urgent',
    healthScore,
    disclaimer: 'This preliminary health assessment is generated based on veterinary guidelines. It is not a clinical diagnosis and does not replace examination by a licensed veterinarian.',
    rawAIExplanation: summaryText,
    summary: summaryText,
    immediateActions,
    warningSigns
  };
}
