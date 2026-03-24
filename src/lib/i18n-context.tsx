import React, { createContext, useContext, useState, useCallback } from 'react';

export type Language = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml' | 'bn' | 'mr' | 'gu' | 'pa' | 'es' | 'fr' | 'de' | 'ar' | 'zh' | 'ja' | 'ko' | 'pt' | 'ru' | 'it';

export const LANGUAGES: Record<Language, string> = {
  en: 'English',
  hi: 'हिन्दी',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
  bn: 'বাংলা',
  mr: 'मराठी',
  gu: 'ગુજરાતી',
  pa: 'ਪੰਜਾਬੀ',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ar: 'العربية',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  pt: 'Português',
  ru: 'Русский',
  it: 'Italiano',
};

// Speech recognition language codes
export const SPEECH_LANG_CODES: Record<Language, string> = {
  en: 'en-US', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', kn: 'kn-IN',
  ml: 'ml-IN', bn: 'bn-IN', mr: 'mr-IN', gu: 'gu-IN', pa: 'pa-IN',
  es: 'es-ES', fr: 'fr-FR', de: 'de-DE', ar: 'ar-SA', zh: 'zh-CN',
  ja: 'ja-JP', ko: 'ko-KR', pt: 'pt-BR', ru: 'ru-RU', it: 'it-IT',
};

type TranslationKey = keyof typeof translations.en;

const translations = {
  en: {
    dashboard: 'Dashboard',
    addFood: 'Add Food',
    analytics: 'Analytics',
    recipes: 'Recipes',
    ecoScore: 'Eco Score',
    family: 'Family',
    notifications: 'Notifications',
    addFoodItem: 'Add Food Item',
    trackWhat: 'Track what goes into your fridge.',
    scanBarcode: 'Scan Barcode',
    scanDesc: 'Use your camera to auto-fetch product details',
    voiceInput: 'Voice Input',
    voiceDesc: 'Say the product name to auto-fill details',
    itemName: 'Item Name',
    quantity: 'Quantity',
    unit: 'Unit',
    expiryDate: 'Expiry Date',
    cost: 'Cost (₹)',
    category: 'Category',
    addToFridge: 'Add to Fridge',
    added: 'Added!',
    smartDefault: 'Leave blank for smart default',
    language: 'Language',
    listening: 'Listening...',
    tapToSpeak: 'Tap to speak',
    consume: 'Consume',
    delete: 'Delete',
    expires: 'Expires',
    expired: 'Expired',
    daysLeft: 'days left',
    loading: 'Loading…',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    addFood: 'खाना जोड़ें',
    analytics: 'विश्लेषण',
    recipes: 'रेसिपी',
    ecoScore: 'इको स्कोर',
    family: 'परिवार',
    notifications: 'सूचनाएं',
    addFoodItem: 'खाद्य पदार्थ जोड़ें',
    trackWhat: 'अपने फ्रिज में क्या जाता है ट्रैक करें।',
    scanBarcode: 'बारकोड स्कैन करें',
    scanDesc: 'उत्पाद विवरण स्वतः प्राप्त करने के लिए कैमरा उपयोग करें',
    voiceInput: 'आवाज़ से जोड़ें',
    voiceDesc: 'उत्पाद का नाम बोलकर विवरण भरें',
    itemName: 'वस्तु का नाम',
    quantity: 'मात्रा',
    unit: 'इकाई',
    expiryDate: 'समाप्ति तिथि',
    cost: 'लागत (₹)',
    category: 'श्रेणी',
    addToFridge: 'फ्रिज में जोड़ें',
    added: 'जोड़ा गया!',
    smartDefault: 'स्मार्ट डिफ़ॉल्ट के लिए खाली छोड़ें',
    language: 'भाषा',
    listening: 'सुन रहा है...',
    tapToSpeak: 'बोलने के लिए टैप करें',
    consume: 'उपभोग',
    delete: 'हटाएं',
    expires: 'समाप्ति',
    expired: 'समाप्त',
    daysLeft: 'दिन बाकी',
    loading: 'लोड हो रहा है…',
  },
  ta: {
    dashboard: 'டாஷ்போர்டு',
    addFood: 'உணவு சேர்',
    analytics: 'பகுப்பாய்வு',
    recipes: 'சமையல்',
    ecoScore: 'சுற்றுச்சூழல்',
    family: 'குடும்பம்',
    notifications: 'அறிவிப்புகள்',
    addFoodItem: 'உணவு பொருள் சேர்க்கவும்',
    trackWhat: 'உங்கள் குளிர்சாதனத்தில் என்ன உள்ளது என்பதை கண்காணிக்கவும்.',
    scanBarcode: 'பார்கோடு ஸ்கேன்',
    scanDesc: 'தயாரிப்பு விவரங்களை தானாக பெற கேமராவைப் பயன்படுத்தவும்',
    voiceInput: 'குரல் உள்ளீடு',
    voiceDesc: 'தயாரிப்பின் பெயரைச் சொல்லி விவரங்களை நிரப்பவும்',
    itemName: 'பொருளின் பெயர்',
    quantity: 'அளவு',
    unit: 'அலகு',
    expiryDate: 'காலாவதி தேதி',
    cost: 'விலை (₹)',
    category: 'வகை',
    addToFridge: 'குளிர்சாதனத்தில் சேர்',
    added: 'சேர்க்கப்பட்டது!',
    smartDefault: 'ஸ்மார்ட் இயல்புநிலைக்கு காலியாக விடவும்',
    language: 'மொழி',
    listening: 'கேட்கிறது...',
    tapToSpeak: 'பேச தட்டவும்',
    consume: 'பயன்படுத்து',
    delete: 'நீக்கு',
    expires: 'காலாவதி',
    expired: 'காலாவதியானது',
    daysLeft: 'நாட்கள் மீதம்',
    loading: 'ஏற்றுகிறது…',
  },
  te: {
    dashboard: 'డ్యాష్‌బోర్డ్', addFood: 'ఆహారం జోడించు', analytics: 'విశ్లేషణ', recipes: 'వంటకాలు', ecoScore: 'ఇకో స్కోర్', family: 'కుటుంబం', notifications: 'నోటిఫికేషన్లు', addFoodItem: 'ఆహార పదార్థం జోడించండి', trackWhat: 'మీ ఫ్రిజ్‌లో ఏమి ఉందో ట్రాక్ చేయండి.', scanBarcode: 'బార్‌కోడ్ స్కాన్', scanDesc: 'ఉత్పత్తి వివరాలను ఆటో-ఫెచ్ చేయడానికి కెమెరా ఉపయోగించండి', voiceInput: 'వాయిస్ ఇన్‌పుట్', voiceDesc: 'ఉత్పత్తి పేరు చెప్పి వివరాలు నింపండి', itemName: 'వస్తువు పేరు', quantity: 'పరిమాణం', unit: 'యూనిట్', expiryDate: 'గడువు తేదీ', cost: 'ధర (₹)', category: 'వర్గం', addToFridge: 'ఫ్రిజ్‌కి జోడించు', added: 'జోడించబడింది!', smartDefault: 'స్మార్ట్ డిఫాల్ట్ కోసం ఖాళీగా ఉంచండి', language: 'భాష', listening: 'వింటోంది...', tapToSpeak: 'మాట్లాడటానికి నొక్కండి', consume: 'వినియోగించు', delete: 'తొలగించు', expires: 'గడువు', expired: 'గడువు ముగిసింది', daysLeft: 'రోజులు మిగిలాయి', loading: 'లోడ్ అవుతోంది…',
  },
  kn: {
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', addFood: 'ಆಹಾರ ಸೇರಿಸಿ', analytics: 'ವಿಶ್ಲೇಷಣೆ', recipes: 'ಪಾಕವಿಧಾನ', ecoScore: 'ಇಕೋ ಸ್ಕೋರ್', family: 'ಕುಟುಂಬ', notifications: 'ಅಧಿಸೂಚನೆಗಳು', addFoodItem: 'ಆಹಾರ ವಸ್ತುವನ್ನು ಸೇರಿಸಿ', trackWhat: 'ನಿಮ್ಮ ಫ್ರಿಜ್‌ನಲ್ಲಿ ಏನಿದೆ ಎಂದು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.', scanBarcode: 'ಬಾರ್‌ಕೋಡ್ ಸ್ಕ್ಯಾನ್', scanDesc: 'ಉತ್ಪನ್ನ ವಿವರಗಳನ್ನು ಸ್ವಯಂ-ಪಡೆಯಲು ಕ್ಯಾಮೆರಾ ಬಳಸಿ', voiceInput: 'ಧ್ವನಿ ಇನ್‌ಪುಟ್', voiceDesc: 'ಉತ್ಪನ್ನದ ಹೆಸರು ಹೇಳಿ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ', itemName: 'ವಸ್ತುವಿನ ಹೆಸರು', quantity: 'ಪ್ರಮಾಣ', unit: 'ಘಟಕ', expiryDate: 'ಅವಧಿ ಮುಕ್ತಾಯ', cost: 'ವೆಚ್ಚ (₹)', category: 'ವರ್ಗ', addToFridge: 'ಫ್ರಿಜ್‌ಗೆ ಸೇರಿಸಿ', added: 'ಸೇರಿಸಲಾಗಿದೆ!', smartDefault: 'ಸ್ಮಾರ್ಟ್ ಡೀಫಾಲ್ಟ್‌ಗಾಗಿ ಖಾಲಿ ಬಿಡಿ', language: 'ಭಾಷೆ', listening: 'ಕೇಳುತ್ತಿದೆ...', tapToSpeak: 'ಮಾತನಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ', consume: 'ಬಳಸಿ', delete: 'ಅಳಿಸಿ', expires: 'ಅವಧಿ', expired: 'ಅವಧಿ ಮುಗಿದಿದೆ', daysLeft: 'ದಿನಗಳು ಉಳಿದಿವೆ', loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ…',
  },
  ml: {
    dashboard: 'ഡാഷ്‌ബോർഡ്', addFood: 'ഭക്ഷണം ചേർക്കുക', analytics: 'വിശകലനം', recipes: 'പാചകക്കുറിപ്പുകൾ', ecoScore: 'ഇകോ സ്കോർ', family: 'കുടുംബം', notifications: 'അറിയിപ്പുകൾ', addFoodItem: 'ഭക്ഷ്യ ഇനം ചേർക്കുക', trackWhat: 'നിങ്ങളുടെ ഫ്രിഡ്ജിൽ എന്താണ് ഉള്ളതെന്ന് ട്രാക്ക് ചെയ്യുക.', scanBarcode: 'ബാർകോഡ് സ്കാൻ', scanDesc: 'ഉൽപ്പന്ന വിവരങ്ങൾ സ്വയം ലഭിക്കാൻ ക്യാമറ ഉപയോഗിക്കുക', voiceInput: 'ശബ്ദ ഇൻപുട്ട്', voiceDesc: 'ഉൽപ്പന്നത്തിന്റെ പേര് പറഞ്ഞ് വിവരങ്ങൾ പൂരിപ്പിക്കുക', itemName: 'ഇനത്തിന്റെ പേര്', quantity: 'അളവ്', unit: 'യൂണിറ്റ്', expiryDate: 'കാലഹരണ തീയതി', cost: 'വില (₹)', category: 'വിഭാഗം', addToFridge: 'ഫ്രിഡ്ജിലേക്ക് ചേർക്കുക', added: 'ചേർത്തു!', smartDefault: 'സ്മാർട്ട് ഡിഫോൾട്ടിന് ശൂന്യമായി വിടുക', language: 'ഭാഷ', listening: 'കേൾക്കുന്നു...', tapToSpeak: 'സംസാരിക്കാൻ ടാപ്പ് ചെയ്യുക', consume: 'ഉപയോഗിക്കുക', delete: 'ഇല്ലാതാക്കുക', expires: 'കാലഹരണം', expired: 'കാലഹരണം കഴിഞ്ഞു', daysLeft: 'ദിവസങ്ങൾ ബാക്കി', loading: 'ലോഡ് ചെയ്യുന്നു…',
  },
  bn: {
    dashboard: 'ড্যাশবোর্ড', addFood: 'খাবার যোগ করুন', analytics: 'বিশ্লেষণ', recipes: 'রেসিপি', ecoScore: 'ইকো স্কোর', family: 'পরিবার', notifications: 'বিজ্ঞপ্তি', addFoodItem: 'খাদ্য আইটেম যোগ করুন', trackWhat: 'আপনার ফ্রিজে কী আছে ট্র্যাক করুন।', scanBarcode: 'বারকোড স্ক্যান', scanDesc: 'পণ্যের বিবরণ স্বয়ংক্রিয়ভাবে পেতে ক্যামেরা ব্যবহার করুন', voiceInput: 'ভয়েস ইনপুট', voiceDesc: 'পণ্যের নাম বলে বিবরণ পূরণ করুন', itemName: 'আইটেমের নাম', quantity: 'পরিমাণ', unit: 'একক', expiryDate: 'মেয়াদ শেষের তারিখ', cost: 'খরচ (₹)', category: 'বিভাগ', addToFridge: 'ফ্রিজে যোগ করুন', added: 'যোগ করা হয়েছে!', smartDefault: 'স্মার্ট ডিফল্টের জন্য ফাঁকা রাখুন', language: 'ভাষা', listening: 'শুনছি...', tapToSpeak: 'বলতে ট্যাপ করুন', consume: 'ব্যবহার করুন', delete: 'মুছুন', expires: 'মেয়াদ শেষ', expired: 'মেয়াদ শেষ হয়েছে', daysLeft: 'দিন বাকি', loading: 'লোড হচ্ছে…',
  },
  mr: {
    dashboard: 'डॅशबोर्ड', addFood: 'अन्न जोडा', analytics: 'विश्लेषण', recipes: 'पाककृती', ecoScore: 'इको स्कोर', family: 'कुटुंब', notifications: 'सूचना', addFoodItem: 'अन्न पदार्थ जोडा', trackWhat: 'तुमच्या फ्रिजमध्ये काय आहे ते ट्रॅक करा.', scanBarcode: 'बारकोड स्कॅन', scanDesc: 'उत्पादनाचे तपशील स्वयं मिळवण्यासाठी कॅमेरा वापरा', voiceInput: 'व्हॉइस इनपुट', voiceDesc: 'उत्पादनाचे नाव सांगून तपशील भरा', itemName: 'वस्तूचे नाव', quantity: 'प्रमाण', unit: 'एकक', expiryDate: 'कालबाह्य तारीख', cost: 'किंमत (₹)', category: 'श्रेणी', addToFridge: 'फ्रिजमध्ये जोडा', added: 'जोडले!', smartDefault: 'स्मार्ट डीफॉल्टसाठी रिकामे ठेवा', language: 'भाषा', listening: 'ऐकत आहे...', tapToSpeak: 'बोलण्यासाठी टॅप करा', consume: 'वापरा', delete: 'हटवा', expires: 'कालबाह्य', expired: 'कालबाह्य झाले', daysLeft: 'दिवस शिल्लक', loading: 'लोड होत आहे…',
  },
  gu: {
    dashboard: 'ડેશબોર્ડ', addFood: 'ખોરાક ઉમેરો', analytics: 'વિશ્લેષણ', recipes: 'રેસિપી', ecoScore: 'ઇકો સ્કોર', family: 'કુટુંબ', notifications: 'સૂચનાઓ', addFoodItem: 'ખોરાક વસ્તુ ઉમેરો', trackWhat: 'તમારા ફ્રિજમાં શું છે તે ટ્રેક કરો.', scanBarcode: 'બારકોડ સ્કેન', scanDesc: 'ઉત્પાદનની વિગતો ઓટો-ફેચ કરવા કેમેરાનો ઉપયોગ કરો', voiceInput: 'વૉઇસ ઇનપુટ', voiceDesc: 'ઉત્પાદનનું નામ બોલીને વિગતો ભરો', itemName: 'વસ્તુનું નામ', quantity: 'જથ્થો', unit: 'એકમ', expiryDate: 'સમાપ્તિ તારીખ', cost: 'ખર્ચ (₹)', category: 'શ્રેણી', addToFridge: 'ફ્રિજમાં ઉમેરો', added: 'ઉમેર્યું!', smartDefault: 'સ્માર્ટ ડિફોલ્ટ માટે ખાલી છોડો', language: 'ભાષા', listening: 'સાંભળે છે...', tapToSpeak: 'બોલવા ટેપ કરો', consume: 'વાપરો', delete: 'કાઢી નાખો', expires: 'સમાપ્તિ', expired: 'સમાપ્ત થયું', daysLeft: 'દિવસ બાકી', loading: 'લોડ થઈ રહ્યું છે…',
  },
  pa: {
    dashboard: 'ਡੈਸ਼ਬੋਰਡ', addFood: 'ਖਾਣਾ ਜੋੜੋ', analytics: 'ਵਿਸ਼ਲੇਸ਼ਣ', recipes: 'ਪਕਵਾਨ', ecoScore: 'ਈਕੋ ਸਕੋਰ', family: 'ਪਰਿਵਾਰ', notifications: 'ਸੂਚਨਾਵਾਂ', addFoodItem: 'ਖਾਣ ਪੀਣ ਦੀ ਚੀਜ਼ ਜੋੜੋ', trackWhat: 'ਆਪਣੇ ਫਰਿੱਜ ਵਿੱਚ ਕੀ ਹੈ ਟ੍ਰੈਕ ਕਰੋ।', scanBarcode: 'ਬਾਰਕੋਡ ਸਕੈਨ', scanDesc: 'ਉਤਪਾਦ ਵੇਰਵੇ ਆਟੋ-ਫੈਚ ਕਰਨ ਲਈ ਕੈਮਰਾ ਵਰਤੋ', voiceInput: 'ਆਵਾਜ਼ ਇਨਪੁੱਟ', voiceDesc: 'ਉਤਪਾਦ ਦਾ ਨਾਮ ਬੋਲ ਕੇ ਵੇਰਵੇ ਭਰੋ', itemName: 'ਚੀਜ਼ ਦਾ ਨਾਮ', quantity: 'ਮਾਤਰਾ', unit: 'ਇਕਾਈ', expiryDate: 'ਮਿਆਦ ਖਤਮ ਹੋਣ ਦੀ ਤਾਰੀਖ', cost: 'ਕੀਮਤ (₹)', category: 'ਸ਼੍ਰੇਣੀ', addToFridge: 'ਫਰਿੱਜ ਵਿੱਚ ਜੋੜੋ', added: 'ਜੋੜਿਆ ਗਿਆ!', smartDefault: 'ਸਮਾਰਟ ਡਿਫਾਲਟ ਲਈ ਖਾਲੀ ਛੱਡੋ', language: 'ਭਾਸ਼ਾ', listening: 'ਸੁਣ ਰਿਹਾ ਹੈ...', tapToSpeak: 'ਬੋਲਣ ਲਈ ਟੈਪ ਕਰੋ', consume: 'ਵਰਤੋ', delete: 'ਮਿਟਾਓ', expires: 'ਮਿਆਦ', expired: 'ਮਿਆਦ ਖਤਮ', daysLeft: 'ਦਿਨ ਬਾਕੀ', loading: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…',
  },
  es: {
    dashboard: 'Panel', addFood: 'Agregar', analytics: 'Análisis', recipes: 'Recetas', ecoScore: 'Eco Puntos', family: 'Familia', notifications: 'Notificaciones', addFoodItem: 'Agregar alimento', trackWhat: 'Rastrea lo que hay en tu refrigerador.', scanBarcode: 'Escanear código', scanDesc: 'Usa tu cámara para obtener detalles del producto', voiceInput: 'Entrada de voz', voiceDesc: 'Di el nombre del producto para completar los detalles', itemName: 'Nombre del artículo', quantity: 'Cantidad', unit: 'Unidad', expiryDate: 'Fecha de caducidad', cost: 'Costo (₹)', category: 'Categoría', addToFridge: 'Agregar al refrigerador', added: '¡Agregado!', smartDefault: 'Dejar en blanco para valor predeterminado', language: 'Idioma', listening: 'Escuchando...', tapToSpeak: 'Toca para hablar', consume: 'Consumir', delete: 'Eliminar', expires: 'Caduca', expired: 'Caducado', daysLeft: 'días restantes', loading: 'Cargando…',
  },
  fr: {
    dashboard: 'Tableau de bord', addFood: 'Ajouter', analytics: 'Analyses', recipes: 'Recettes', ecoScore: 'Éco Score', family: 'Famille', notifications: 'Notifications', addFoodItem: 'Ajouter un aliment', trackWhat: 'Suivez ce qui entre dans votre réfrigérateur.', scanBarcode: 'Scanner le code', scanDesc: 'Utilisez votre caméra pour récupérer les détails du produit', voiceInput: 'Saisie vocale', voiceDesc: 'Dites le nom du produit pour remplir les détails', itemName: "Nom de l'article", quantity: 'Quantité', unit: 'Unité', expiryDate: "Date d'expiration", cost: 'Coût (₹)', category: 'Catégorie', addToFridge: 'Ajouter au réfrigérateur', added: 'Ajouté !', smartDefault: 'Laisser vide pour valeur par défaut', language: 'Langue', listening: 'Écoute...', tapToSpeak: 'Appuyez pour parler', consume: 'Consommer', delete: 'Supprimer', expires: 'Expire', expired: 'Expiré', daysLeft: 'jours restants', loading: 'Chargement…',
  },
  de: {
    dashboard: 'Dashboard', addFood: 'Hinzufügen', analytics: 'Analyse', recipes: 'Rezepte', ecoScore: 'Öko-Score', family: 'Familie', notifications: 'Benachrichtigungen', addFoodItem: 'Lebensmittel hinzufügen', trackWhat: 'Verfolgen Sie, was in Ihren Kühlschrank kommt.', scanBarcode: 'Barcode scannen', scanDesc: 'Verwenden Sie Ihre Kamera, um Produktdetails abzurufen', voiceInput: 'Spracheingabe', voiceDesc: 'Sagen Sie den Produktnamen, um Details auszufüllen', itemName: 'Artikelname', quantity: 'Menge', unit: 'Einheit', expiryDate: 'Ablaufdatum', cost: 'Kosten (₹)', category: 'Kategorie', addToFridge: 'Zum Kühlschrank hinzufügen', added: 'Hinzugefügt!', smartDefault: 'Leer lassen für Standardwert', language: 'Sprache', listening: 'Hört zu...', tapToSpeak: 'Tippen zum Sprechen', consume: 'Verbrauchen', delete: 'Löschen', expires: 'Läuft ab', expired: 'Abgelaufen', daysLeft: 'Tage übrig', loading: 'Laden…',
  },
  ar: {
    dashboard: 'لوحة القيادة', addFood: 'إضافة طعام', analytics: 'التحليلات', recipes: 'وصفات', ecoScore: 'النقاط البيئية', family: 'العائلة', notifications: 'الإشعارات', addFoodItem: 'إضافة مادة غذائية', trackWhat: 'تتبع ما يوجد في ثلاجتك.', scanBarcode: 'مسح الباركود', scanDesc: 'استخدم الكاميرا لجلب تفاصيل المنتج تلقائياً', voiceInput: 'إدخال صوتي', voiceDesc: 'قل اسم المنتج لملء التفاصيل', itemName: 'اسم العنصر', quantity: 'الكمية', unit: 'الوحدة', expiryDate: 'تاريخ انتهاء الصلاحية', cost: 'التكلفة (₹)', category: 'الفئة', addToFridge: 'أضف إلى الثلاجة', added: 'تمت الإضافة!', smartDefault: 'اتركه فارغاً للقيمة الافتراضية', language: 'اللغة', listening: 'يستمع...', tapToSpeak: 'اضغط للتحدث', consume: 'استهلاك', delete: 'حذف', expires: 'ينتهي', expired: 'منتهي الصلاحية', daysLeft: 'أيام متبقية', loading: 'جاري التحميل…',
  },
  zh: {
    dashboard: '仪表板', addFood: '添加食物', analytics: '分析', recipes: '食谱', ecoScore: '环保评分', family: '家庭', notifications: '通知', addFoodItem: '添加食品', trackWhat: '跟踪你冰箱里的食物。', scanBarcode: '扫描条码', scanDesc: '使用相机自动获取产品详情', voiceInput: '语音输入', voiceDesc: '说出产品名称自动填写详情', itemName: '物品名称', quantity: '数量', unit: '单位', expiryDate: '过期日期', cost: '费用 (₹)', category: '类别', addToFridge: '添加到冰箱', added: '已添加！', smartDefault: '留空使用智能默认值', language: '语言', listening: '正在听...', tapToSpeak: '点击说话', consume: '消费', delete: '删除', expires: '过期', expired: '已过期', daysLeft: '天剩余', loading: '加载中…',
  },
  ja: {
    dashboard: 'ダッシュボード', addFood: '食品追加', analytics: '分析', recipes: 'レシピ', ecoScore: 'エコスコア', family: '家族', notifications: '通知', addFoodItem: '食品を追加', trackWhat: '冷蔵庫の中身を追跡しましょう。', scanBarcode: 'バーコードスキャン', scanDesc: 'カメラで商品情報を自動取得', voiceInput: '音声入力', voiceDesc: '商品名を話して詳細を入力', itemName: '商品名', quantity: '数量', unit: '単位', expiryDate: '賞味期限', cost: '費用 (₹)', category: 'カテゴリ', addToFridge: '冷蔵庫に追加', added: '追加しました！', smartDefault: 'スマートデフォルトは空白のまま', language: '言語', listening: '聞いています...', tapToSpeak: 'タップして話す', consume: '消費', delete: '削除', expires: '期限', expired: '期限切れ', daysLeft: '日残り', loading: '読み込み中…',
  },
  ko: {
    dashboard: '대시보드', addFood: '음식 추가', analytics: '분석', recipes: '레시피', ecoScore: '에코 점수', family: '가족', notifications: '알림', addFoodItem: '식품 추가', trackWhat: '냉장고에 무엇이 있는지 추적하세요.', scanBarcode: '바코드 스캔', scanDesc: '카메라로 제품 정보를 자동으로 가져오세요', voiceInput: '음성 입력', voiceDesc: '제품 이름을 말해서 정보를 입력하세요', itemName: '항목 이름', quantity: '수량', unit: '단위', expiryDate: '유통기한', cost: '비용 (₹)', category: '카테고리', addToFridge: '냉장고에 추가', added: '추가됨!', smartDefault: '스마트 기본값을 위해 비워두세요', language: '언어', listening: '듣고 있습니다...', tapToSpeak: '탭하여 말하기', consume: '소비', delete: '삭제', expires: '만료', expired: '만료됨', daysLeft: '일 남음', loading: '로딩 중…',
  },
  pt: {
    dashboard: 'Painel', addFood: 'Adicionar', analytics: 'Análise', recipes: 'Receitas', ecoScore: 'Eco Score', family: 'Família', notifications: 'Notificações', addFoodItem: 'Adicionar alimento', trackWhat: 'Acompanhe o que entra na sua geladeira.', scanBarcode: 'Escanear código', scanDesc: 'Use sua câmera para buscar detalhes do produto', voiceInput: 'Entrada de voz', voiceDesc: 'Diga o nome do produto para preencher os detalhes', itemName: 'Nome do item', quantity: 'Quantidade', unit: 'Unidade', expiryDate: 'Data de validade', cost: 'Custo (₹)', category: 'Categoria', addToFridge: 'Adicionar à geladeira', added: 'Adicionado!', smartDefault: 'Deixe em branco para padrão inteligente', language: 'Idioma', listening: 'Ouvindo...', tapToSpeak: 'Toque para falar', consume: 'Consumir', delete: 'Excluir', expires: 'Expira', expired: 'Expirado', daysLeft: 'dias restantes', loading: 'Carregando…',
  },
  ru: {
    dashboard: 'Панель', addFood: 'Добавить', analytics: 'Аналитика', recipes: 'Рецепты', ecoScore: 'Эко балл', family: 'Семья', notifications: 'Уведомления', addFoodItem: 'Добавить продукт', trackWhat: 'Отслеживайте содержимое холодильника.', scanBarcode: 'Сканировать', scanDesc: 'Используйте камеру для получения информации о продукте', voiceInput: 'Голосовой ввод', voiceDesc: 'Назовите продукт для автозаполнения', itemName: 'Название', quantity: 'Количество', unit: 'Единица', expiryDate: 'Срок годности', cost: 'Стоимость (₹)', category: 'Категория', addToFridge: 'Добавить в холодильник', added: 'Добавлено!', smartDefault: 'Оставьте пустым для значения по умолчанию', language: 'Язык', listening: 'Слушаю...', tapToSpeak: 'Нажмите чтобы говорить', consume: 'Потребить', delete: 'Удалить', expires: 'Истекает', expired: 'Просрочено', daysLeft: 'дней осталось', loading: 'Загрузка…',
  },
  it: {
    dashboard: 'Pannello', addFood: 'Aggiungi', analytics: 'Analisi', recipes: 'Ricette', ecoScore: 'Eco Punteggio', family: 'Famiglia', notifications: 'Notifiche', addFoodItem: 'Aggiungi alimento', trackWhat: 'Tieni traccia di cosa c\'è nel tuo frigorifero.', scanBarcode: 'Scansiona codice', scanDesc: 'Usa la fotocamera per ottenere i dettagli del prodotto', voiceInput: 'Input vocale', voiceDesc: 'Dì il nome del prodotto per compilare i dettagli', itemName: 'Nome articolo', quantity: 'Quantità', unit: 'Unità', expiryDate: 'Data di scadenza', cost: 'Costo (₹)', category: 'Categoria', addToFridge: 'Aggiungi al frigorifero', added: 'Aggiunto!', smartDefault: 'Lascia vuoto per valore predefinito', language: 'Lingua', listening: 'Ascoltando...', tapToSpeak: 'Tocca per parlare', consume: 'Consuma', delete: 'Elimina', expires: 'Scade', expired: 'Scaduto', daysLeft: 'giorni rimasti', loading: 'Caricamento…',
  },
};

interface I18nContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: TranslationKey) => string;
  speechLang: string;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
  speechLang: 'en-US',
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language') as Language;
    return saved && LANGUAGES[saved] ? saved : 'en';
  });

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    localStorage.setItem('app-language', l);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[lang]?.[key] || translations.en[key] || key;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, speechLang: SPEECH_LANG_CODES[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
