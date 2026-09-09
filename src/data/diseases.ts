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
    medicinesAndTreatment: {
      firstAidMedications: [
        'लाल दवा (Potassium Permanganate 1:1000) या फिटकरी पानी (2% Alum) से मुंह और खुरों की रोजाना धुलाई करें।',
        'मुंह के छालों पर बोरो-ग्लिसरीन (Boro-Glycerine) या शहद-हल्दी का लेप लगाएं।',
        'पैरों के घावों पर लोरेक्सेन (Lorexane) या टॉपिक्योर (Topicure) एंटीसेप्टिक मैगट-रोधी स्प्रे छिड़कें।'
      ],
      veterinaryDrugs: [
        'एंटी-इंफ्लेमेटरी व दर्द निवारक: मेलोक्सिकैम (Melonex / Melonex Plus) इंजेक्शन या बोलस बुखार और दर्द कम करने के लिए।',
        'सेकेंडरी बैक्टीरियल संक्रमण रोकने के लिए एंटीबायोटिक: एनरोफ्लोक्सासिन (Enrofloxacin) या ऑक्सीटेट्रासाइक्लिन (Oxytetracycline) केवल पशु चिकित्सक के परामर्श से।',
        'लिवर टॉनिक और बी-कॉम्प्लेक्स (Belamyl / Tribivet) भूख और कमजोरी सुधारने के लिए।'
      ],
      supportiveCare: [
        'नरम व पतला दलिया (उबला हुआ गेहूं, मक्का या बाजरा) और मुलायम हरी घास दें ताकि चबाने में दर्द न हो।',
        'पशु को सूखे और हवादार स्थान पर रखें, फर्श पर चूना पाउडर छिड़कें।'
      ],
      safetyPrecautions: 'एंटीबायोटिक का अनावश्यक उपयोग न करें। दूध में दवा के अंश से बचने हेतु विथड्रॉल पीरियड (Withdrawal Period) का ध्यान रखें।'
    },
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
    medicinesAndTreatment: {
      firstAidMedications: [
        'त्वचा की गांठों व फूटे हुए घावों पर बीटाडीन (Povidone Iodine 5%) या नीम-हल्दी का लेप लगाएं।',
        'मक्खियों और कीड़ों से बचाव के लिए टॉपिक्योर स्प्रे (Topicure Spray) या हिमेक्स (Himax) मरहम लगाएं।',
        'इलेक्ट्रोलाइट्स व ओआरएस का घोल लगातार पीने के लिए दें।'
      ],
      veterinaryDrugs: [
        'बुखार व सूजन नियंत्रण: मेलोक्सिकैम + पैरासिटामोल (Melonex Plus Bolus / Injection) 10-15 ml।',
        'एंटी-एलर्जिक व खुजली रोधक: फेनिरामाइन मैलेट (Avil Vet Injection / Anistamin) 5-10 ml।',
        'रोग प्रतिरोधक क्षमता वर्धक: विटामिन ई + सेलेनियम (E-Care Se) और विटामिन ए (Vitablend) का इंजेक्शन।',
        'गंभीर संक्रमण में ब्रॉड स्पेक्ट्रम एंटीबायोटिक (Ceftiofur Sodium / Enrofloxacin) केवल डॉक्टर की देखरेख में।'
      ],
      supportiveCare: [
        'मच्छरों व डांस मक्खियों को भगाने के लिए गोठे में सूखे नीम के पत्तों का धुआं करें।',
        'आइसोलेशन में रखें ताकि स्वस्थ गोवंश में बीमारी न फैले।'
      ],
      safetyPrecautions: 'लम्पी एक वायरल बीमारी है, अतः केवल डॉक्टर द्वारा बताई गई सहायक दवाएं ही दें। कोई भी इंजेक्शन खुद न लगाएं।'
    },
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
    medicinesAndTreatment: {
      firstAidMedications: [
        'थनों की सूजन पर पहले दिन ठंडे पानी या बर्फ से सिंकाई करें, फिर मेस्टीलेप जेल (Mastilep Gel) लगाएं।',
        'दूध दुहने के बाद थनों को 0.5% पोविडोन आयोडीन टीट डिप (Teat Dip) घोल में डुबोएं।',
        'संक्रमित थन का खराब दूध दिन में 4-5 बार पूरी तरह निकाल कर सुरक्षित गड्ढे में फेंकें।'
      ],
      veterinaryDrugs: [
        'इंट्रामैमरी ट्यूब (Intramammary Infusion): पेंडिस्ट्रिन-एसएच (Pendistrin-SH) या क्लोक्सासिलिन (Cloxacillin) ट्यूब डॉक्टर द्वारा थन में चढ़ाई जाती है।',
        'सूजन व गांठ कम करने के लिए: सेराशियोपेप्टिडेज + मेलोक्सिकैम (Flamar / Melonex Bolus)।',
        'सिस्टेमिक एंटीबायोटिक: सेफ्ट्रिआक्सोन (Intracef) या सेफोटैक्सिम (डॉक्टर की सलाह पर)।',
        'दूध की अम्लता ठीक करने के लिए: ट्राइसोडियम साइट्रेट पाउडर (Masti-Plan / Mastikure Powder) 5-7 दिन।'
      ],
      supportiveCare: [
        'गोठे का फर्श हमेशा सूखा रखें और चूना (Lime) छिड़कें। दूध निकालने के बाद गाय-भैंस को कम से कम 30 मिनट तक बैठने न दें।'
      ],
      safetyPrecautions: 'एंटीबायोटिक दिए जाने वाले थन का दूध इंसानों के पीने या बच्चों को पिलाने के लिए उपयोग न करें।'
    },
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
    medicinesAndTreatment: {
      firstAidMedications: [
        'गले व जबड़े की सूजन को छूकर अधिक न दबाएं, पशु को शांत रखें और आराम दें।',
        'गले पर ठंडे पानी की पट्टी रखें।',
        'सावधानी: गले में रुकावट के कारण नाल (Drenching Bottle) से कोई भी तरल दवा या तेल जबरदस्ती न पिलाएं।'
      ],
      veterinaryDrugs: [
        'आपातकालीन एंटीबायोटिक: सल्फाडिमिडीन (Sulfadimidine 33.3% IV) या ऑक्सीटेट्रासाइक्लिन (Terramycin LA) तुरंत डॉक्टर से लगवाएं।',
        'गले की सूजन तुरंत कम करने हेतु: डेक्सामेथासोन (Dexamethasone) या फ्लुनिक्सिन मेग्लुमाइन (Flunixin Meglumine)।',
        'सलाइन ड्रिप (Normal Saline / Ringer Lactate) डिहाइड्रेशन रोकने के लिए।'
      ],
      supportiveCare: [
        'पशु की गर्दन सीधी रखें ताकि सांस लेने में आसानी हो। छांव वाले खुले स्थान में रखें।'
      ],
      safetyPrecautions: 'गलघोंटू 12 से 24 घंटे में जानलेवा हो सकता है। तुरंत 1962 टोल फ्री पर कॉल करें या नजदीकी पशु चिकित्सालय ले जाएं।'
    },
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
    medicinesAndTreatment: {
      firstAidMedications: [
        'सूजे हुए पुट्ठे या पैर को ठंडे स्थान पर रखें, पशु को अत्यधिक चलने न दें।'
      ],
      veterinaryDrugs: [
        'प्रारंभिक अवस्था में पेनिसिलिन (Procaine Penicillin) की उच्च खुराक डॉक्टर द्वारा नस/मांसपेशी में दी जाती है।',
        'तेज बुखार व असहनीय दर्द के लिए: एनालगिन / मेलोक्सिकैम इंजेक्शन।',
        'गैंग्रीन वाले हिस्से में हाइड्रोजन पेरोक्साइड (Hydrogen Peroxide) से डॉक्टर द्वारा सफाई।'
      ],
      supportiveCare: [
        'पशु को नरम बिछावन (पुआल/घास) पर लिटाएं और भरपूर साफ पानी उपलब्ध कराएं।'
      ],
      safetyPrecautions: 'यह अत्यंत घातक बैक्टीरिया जनित रोग है। पहले 12 घंटे में इलाज शुरू होना जीवन रक्षा के लिए अनिवार्य है।'
    },
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
    medicinesAndTreatment: {
      firstAidMedications: [
        'एंटी-ब्लोट दवा: ब्लोटोसिल (Bloatosil) या टिमपोल (Tympol) या अफरा-निल 100 ml तुरंत पिलाएं।',
        'घरेलू प्राथमिक उपचार: 250 मिली मीठा तेल (सरसों या अलसी का तेल) + 20-25 मिली तारपीन का तेल (Turpentine Oil) अच्छी तरह मिलाकर पिलाएं।',
        'मुंह में लकड़ी या रस्सी की लगाम लगाएं ताकि पशु लगातार मुंह चलाए और डकार आए।'
      ],
      veterinaryDrugs: [
        'गंभीर स्थिति में डॉक्टर द्वारा ट्रोकार एवं कैन्युला (Trocar & Cannula) की मदद से बाईं कोख से सीधे गैस निकाली जाती है।',
        'पेट के सूक्ष्मजीवों को सक्रिय करने के लिए: रुचामाक्स (Ruchamax) या हिमालयन बतीसा (Himalayan Batisa) पाउडर।',
        'पेट दर्द के लिए एंटी-स्पास्मोडिक: साइक्लोपाम वेट (Cyclopam Vet) या स्पैस्डिक इंजेक्शन।'
      ],
      supportiveCare: [
        'पशु के आगे के दोनों पैर ऊंची जगह पर रखें ताकि फेफड़ों पर दबाव कम हो।'
      ],
      safetyPrecautions: 'बाईं कोख ज्यादा फूलने पर और सांस रुकने की स्थिति में बिना देर किए पशु चिकित्सक को बुलाएं।'
    },
    whenToSeekVet: 'EMERGENCY if left flank is tightly ballooned and breathing is shallow. Veterinary trocarisation or stomach tubing is urgent to prevent asphyxiation.',
    severity: 'High'
  },
  {
    id: 'milk_fever',
    name: 'Milk Fever / Hypocalcemia',
    localNames: {
      hi: 'दुग्ध ज्वर / कैल्सियम की कमी',
      mr: 'दूध ताप / कॅल्शियम कमतरता',
    },
    affectedAnimals: ['Cow', 'Buffalo', 'Goat'],
    commonSymptoms: [
      'Animal sits on its chest with head tucked into flank (S-shaped neck curvature)',
      'Subnormal body temperature, cold ears, muzzle, and extremities',
      'Muscle tremors, staggering gait, and inability to stand',
      'Dry muzzle, dull eyes, dilated pupils, and cessation of defecation'
    ],
    possibleCauses: [
      'Acute sudden drop in blood calcium level within 24 to 72 hours after calving due to heavy colostrum production',
      'Imbalance of calcium and phosphorus in late pregnancy ration'
    ],
    prevention: [
      'Feed low-calcium diet before calving (dry period) and shift to high-calcium diet immediately after delivery',
      'Administer oral calcium gel within 6 hours before and after calving'
    ],
    generalCare: [
      'Prop cow up in sternal recumbency (on chest) with straw bales; never let her lie flat on her side',
      'Keep warm with dry gunny bags or blankets during cold weather'
    ],
    medicinesAndTreatment: {
      firstAidMedications: [
        'पशु के शरीर को गर्म रखने के लिए बोरी या कंबल ओढ़ाएं।',
        'यदि पशु होश में है तो ओरल कैल्शियम जेल (Cal-Up Gel / Ostovet Gel) धीरे-धीरे चटाएं।'
      ],
      veterinaryDrugs: [
        'आपातकालीन कैल्शियम: कैल्शियम बोरोरुकोनेट 25% (Mifex / Calboro 450 ml) पशु चिकित्सक द्वारा धीरे-धीरे नस (Slow IV) में चढ़ाया जाता है।',
        'फास्फोरस व मैग्नीशियम सप्लीमेंट (Tonophosphan / Novacoc) मांसपेशी में।'
      ],
      supportiveCare: [
        'गाय या भैंस को पेट के बल बैठाएं (छाती के बल), एक तरफ करवट न सोने दें ताकि अफरा न बने।'
      ],
      safetyPrecautions: 'आईवी कैल्शियम बहुत सावधानी से चढ़ाया जाता है क्योंकि तेज गति से हृदय गति रुक सकती है।'
    },
    whenToSeekVet: 'EMERGENCY: Call the veterinarian immediately. Intravenous calcium therapy provides rapid recovery within 1-2 hours.',
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
    medicinesAndTreatment: {
      firstAidMedications: [
        'मुंह के घावों पर ग्लिसरीन या फिटकरी का पानी लगाएं।',
        'ओआरएस (ORS) और ग्लूकोज का पानी लगातार पिलाएं ताकि दस्त से पानी की कमी न हो।'
      ],
      veterinaryDrugs: [
        'निमोनिया रोकने के लिए: एनरोफ्लोक्सासिन (Enrofloxacin 10%) या ऑक्सीटेट्रासाइक्लिन।',
        'बुखार व दर्द के लिए: मेलोक्सिकैम सिरप या इंजेक्शन।',
        'दस्त रोकने व पेट ठीक करने के लिए: नेबलोन (Neblon) पाउडर या मेट्रोनिडाजोल।'
      ],
      supportiveCare: [
        'मुलायम पत्तियां (शहतूत, सुबबूल) और दलिया दें।'
      ],
      safetyPrecautions: 'स्वस्थ बकरियों को तुरंत अलग करें और बाकी रेवड़ को पीपीआर का टीका लगवाएं।'
    },
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
