/**
 * Backend Translation Utility
 * Handles dynamic data translation and query parameter reverse-mapping.
 * Supports locales: en, ta, hi, sv, no.
 */

const dictionary = {
  // Categories
  "Urban Outerwear": {
    ta: "நகர்ப்புற வெளிப்புற ஆடைகள்",
    hi: "शहरी बाहरी वस्त्र",
    sv: "Urbana ytterkläder",
    no: "Urbane ytterklær"
  },
  "Tech Wear": {
    ta: "தொழில்நுட்ப ஆடைகள்",
    hi: "टेक वियर",
    sv: "Tekniska kläder",
    no: "Tekniske klær"
  },
  "TechWear": {
    ta: "தொழில்நுட்ப ஆடைகள்",
    hi: "टेक वियर",
    sv: "Tekniska kläder",
    no: "Tekniske klær"
  },
  "Footwear": {
    ta: "காலணிகள்",
    hi: "जूते",
    sv: "Skodon",
    no: "Fottøy"
  },
  "Accessories": {
    ta: "துணைக்கருவிகள்",
    hi: "सहायक उपकरण",
    sv: "Tillbehör",
    no: "Tilbehør"
  },
  "Streetwear": {
    ta: "தெரு ஆடைகள்",
    hi: "स्ट्रीटवियर",
    sv: "Streetwear",
    no: "Streetwear"
  },
  "Formal": {
    ta: "முறைசார்ந்த",
    hi: "औपचारिक",
    sv: "Formell",
    no: "Formell"
  },
  "Knitwear": {
    ta: "பின்னலாடை",
    hi: "निटवियर",
    sv: "Strikkade kläder",
    no: "Strikkevarer"
  },
  "Urban fashion that pushes boundaries.": {
    ta: "எல்லைகளைத் தள்ளும் நகர்ப்புற ஃபேஷன்.",
    hi: "शहरी फैशन जो सीमाओं को पार करता है।",
    sv: "Urbant mode som tänjer på gränserna.",
    no: "Urban mote som tøyer grenser."
  },
  "Where function meets futurism.": {
    ta: "செயல்பாடு எதிர்காலவாதத்தை சந்திக்கும் இடம்.",
    hi: "जहां कार्य भविष्यवाद से मिलता है।",
    sv: "Där funktion möter futurism.",
    no: "Der funksjon møter futurisme."
  },
  "Limited drops to everyday essentials.": {
    ta: "அன்றாட அத்தியாவசிய பொருட்களுக்கான வரையறுக்கப்பட்ட வெளியீடுகள்.",
    hi: "रोजमर्रा की जरूरी चीजों के लिए सीमित ड्रॉप्स।",
    sv: "Begränsade släpp till vardagliga nödvändigheter.",
    no: "Begrensede drops til hverdagslige nødvendigheter."
  },
  "Tailored perfection for the distinguished.": {
    ta: "தனித்துவமானவர்களுக்கான வடிவமைக்கப்பட்ட முழுமை.",
    hi: "प्रतिष्ठित लोगों के लिए अनुरूप पूर्णता।",
    sv: "Skräddarsydd perfektion för den kräsne.",
    no: "Skreddersydd perfeksjon for den kresne."
  },
  "Watches, wallets, and finishing touches.": {
    ta: "கடிகாரங்கள், பணப்பைகள் மற்றும் இறுதித் தொடுதல்கள்.",
    hi: "घड़ियाँ, वॉलेट और अंतिम स्पर्श।",
    sv: "Klockor, plånböcker och sista detaljerna.",
    no: "Klokker, lommebøker og siste detaljer."
  },
  "Premium merino, cashmere, and wool.": {
    ta: "பிரீமியம் மெரினோ, காஷ்மீர் மற்றும் கம்பளி.",
    hi: "प्रीमियम मेरिनो, कश्मीरी और ऊन।",
    sv: "Premium merino, kashmir och ull.",
    no: "Premium merino, kasjmir og ull."
  },
  "Shop by Category": {
    ta: "வகை வாரியாக ஷாப் செய்யுங்கள்",
    hi: "श्रेणी के अनुसार खरीदारी करें",
    sv: "Handla efter kategori",
    no: "Handle etter kategori"
  },
  "Category": {
    ta: "வகை",
    hi: "श्रेणी",
    sv: "Kategori",
    no: "Kategori"
  },
  "Explore our curated collections, crafted with meticulous attention to detail.": {
    ta: "விவரங்களுக்கு உன்னிப்பாகக் கவனத்துடன் வடிவமைக்கப்பட்ட எங்கள் நிர்வகிக்கப்பட்ட தொகுப்புகளை ஆராயுங்கள்.",
    hi: "विवरणों पर सावधानीपूर्वक ध्यान देकर तैयार किए गए हमारे क्यूरेटेड संग्रहों का अन्वेषण करें।",
    sv: "Utforska våra kurerade kollektioner, skapade med noggrann känsla för detaljer.",
    no: "Utforsk våre kuraterte kolleksjoner, laget med omhu for detaljer."
  },
  "Products": {
    ta: "தயாரிப்புகள்",
    hi: "उत्पाद",
    sv: "Produkter",
    no: "Produkter"
  },
  "Explore": {
    ta: "ஆராய்ந்து பாருங்கள்",
    hi: "अन्वेषण करें",
    sv: "Utforska",
    no: "Utforsk"
  },
  "Looking for something specific?": {
    ta: "குறிப்பிட்ட ஏதாவது தேடுகிறீர்களா?",
    hi: "क्या आप कुछ खास ढूंढ रहे हैं?",
    sv: "Letar du efter något specifikt?",
    no: "Ser du etter noe spesifikt?"
  },
  "Browse All Products": {
    ta: "அனைத்து தயாரிப்புகளையும் உலாவுக",
    hi: "सभी उत्पाद ब्राउज़ करें",
    sv: "Visa alla produkter",
    no: "Bla gjennom alle produkter"
  },
  "Suits & Blazers": {
    ta: "சூட்கள் & பிளேசர்கள்",
    hi: "सूट और ब्लेज़र",
    sv: "Kostymer & blazrar",
    no: "Dresser og blazere"
  },
  "General": {
    ta: "பொதுவானது",
    hi: "सामान्य",
    sv: "Allmänt",
    no: "Generelt"
  },
  "Uncategorized": {
    ta: "வகைப்படுத்தப்படாதது",
    hi: "अवर्गीकृत",
    sv: "Okategoriserad",
    no: "Ukategorisert"
  },

  // Tags
  "Casual": {
    ta: "சாதாரண",
    hi: "अनौपचारिक",
    sv: "Casual",
    no: "Uformelt"
  },
  "Outerwear": {
    ta: "வெளிப்புற ஆடைகள்",
    hi: "बाहरी वस्त्र",
    sv: "Ytterkläder",
    no: "Yttertøy"
  },
  "Sportswear": {
    ta: "விளையாட்டு ஆடைகள்",
    hi: "खेलकूद के कपड़े",
    sv: "Sportkläder",
    no: "Sportsklær"
  },
  "Winter": {
    ta: "குளிர்காலம்",
    hi: "शीतकालीन",
    sv: "Vinter",
    no: "Vinter"
  },
  "Formal": {
    ta: "முறைசார்ந்த",
    hi: "औपचारिक",
    sv: "Formell",
    no: "Formell"
  },
  "Streetwear": {
    ta: "தெரு ஆடைகள்",
    hi: "स्ट्रीटवियर",
    sv: "Streetwear",
    no: "Streetwear"
  },

  // Brands
  "Stealth Gear": {
    ta: "ஸ்டெல்த் கியர்",
    hi: "स्टील्थ गियर",
    sv: "Stealth Gear",
    no: "Stealth Gear"
  },
  "Obsidian Tech": {
    ta: "அப்சிடியன் டெக்",
    hi: "ऑब्सीडियन टेक",
    sv: "Obsidian Tech",
    no: "Obsidian Tech"
  },
  "Phantom Pro": {
    ta: "பாண்டம் ப்ரோ",
    hi: "फैंटम प्रो",
    sv: "Phantom Pro",
    no: "Phantom Pro"
  },
  "Urban Style": {
    ta: "நகர்ப்புற பாணி",
    hi: "शहरी शैली",
    sv: "Urban Style",
    no: "Urban Style"
  },
  "Velvet Luxe": {
    ta: "வெல்வெட் லக்ஸ்",
    hi: "वेलवेट लक्स",
    sv: "Velvet Luxe",
    no: "Velvet Luxe"
  },

  // Colors
  "Black": {
    ta: "கருப்பு",
    hi: "काला",
    sv: "Svart",
    no: "Svart"
  },
  "White": {
    ta: "வெள்ளை",
    hi: "सफ़ेद",
    sv: "Vit",
    no: "Hvit"
  },
  "Red": {
    ta: "சிவப்பு",
    hi: "लाल",
    sv: "Röd",
    no: "Rød"
  },
  "Blue": {
    ta: "நீலம்",
    hi: "नीला",
    sv: "Blå",
    no: "Blå"
  },
  "Green": {
    ta: "பச்சை",
    hi: "हरा",
    sv: "Grön",
    no: "Grønn"
  },
  "Yellow": {
    ta: "மஞ்சள்",
    hi: "पीला",
    sv: "Gul",
    no: "Gul"
  },
  "Orange": {
    ta: "ஆரஞ்சு",
    hi: "नारंगी",
    sv: "Orange",
    no: "Oransje"
  },
  "Purple": {
    ta: "ஊதா",
    hi: "बैंगनी",
    sv: "Lila",
    no: "Lilla"
  },
  "Pink": {
    ta: "இளஞ்சிவப்பு",
    hi: "गुलाबी",
    sv: "Rosa",
    no: "Rosa"
  },
  "Grey": {
    ta: "சாம்பல்",
    hi: "धूसर",
    sv: "Grå",
    no: "Grå"
  },
  "Gray": {
    ta: "சாம்பல்",
    hi: "धूसर",
    sv: "Grå",
    no: "Grå"
  },
  "Silver": {
    ta: "வெள்ளி",
    hi: "चांदी",
    sv: "Silver",
    no: "Sølv"
  },
  "Gold": {
    ta: "தங்கம்",
    hi: "सोना",
    sv: "Guld",
    no: "Gull"
  },

  // Product Names
  "Joggers": {
    ta: "ஜாகர்ஸ்",
    hi: "जॉगर्स",
    sv: "Joggingbyxor",
    no: "Joggebukser"
  },
  "Carbon Fiber Belt": {
    ta: "கார்பன் ஃபைபர் பெல்ட்",
    hi: "कार्बन फाइबर बेल्ट",
    sv: "Kolfiberbälte",
    no: "Karbonfiberbelte"
  },
  "Foot Heals": {
    ta: "கால் ஹீல்ஸ்",
    hi: "फुट हील्स",
    sv: "Foot Heals",
    no: "Foot Heals"
  },
  "Midnight Velvet Blazer": {
    ta: "மிட்நைட் வெல்வெட் பிளேசர்",
    hi: "मिडनाइट वेलवेट ब्लेज़र",
    sv: "Midnight Sammetsblazer",
    no: "Midnight Fløyelsblazer"
  },
  "Titanium Chronograph Watch": {
    ta: "டைட்டானியம் குரோனோகிராஃப் வாட்ச்",
    hi: "टाइटेनियम क्रोनोग्रफ़ घड़ी",
    sv: "Titanium Kronografklocka",
    no: "Titanium Kronografklokke"
  },
  "Neon Stealth Hoodie V1": {
    ta: "நியான் ஸ்டெல்த் ஹூடி வி1",
    hi: "नियोन स्टील्थ हुडी वी1",
    sv: "Neon Stealth Huvtröja V1",
    no: "Neon Stealth Hettegenser V1"
  },
  "Neon Stealth Hoodie V2": {
    ta: "நியான் ஸ்டெல்த் ஹூடி வி2",
    hi: "नियोन स्टील्थ हुडी वी2",
    sv: "Neon Stealth Huvtröja V2",
    no: "Neon Stealth Hettegenser V2"
  },
  "Obsidian Tech Jacket": {
    ta: "அப்சிடியன் தொழில்நுட்ப ஜாக்கெட்",
    hi: "ऑब्सीडियन टेक जैकेट",
    sv: "Obsidian Tech-jacka",
    no: "Obsidian Tech-jakke"
  },
  "Phantom Runner Pro": {
    ta: "பாண்டம் ரன்னர் ப்ரோ",
    hi: "फैंटम रनर प्रो",
    sv: "Phantom Runner Pro",
    no: "Phantom Runner Pro"
  },
  "Velvet Blazer": {
    ta: "வெல்வெட் பிளேசர்",
    hi: "वेलवेट ब्लेज़र",
    sv: "Sammetsblazer",
    no: "Fløyelsblazer"
  },
  "Blazer Velvet": {
    ta: "வெல்வெட் பிளேசர்",
    hi: "वेलवेट ब्लेज़र",
    sv: "Sammetsblazer",
    no: "Fløyelsblazer"
  },
  "Titanium Watch": {
    ta: "டைட்டானியம் கடிகாரம்",
    hi: "टाइटेनियम घड़ी",
    sv: "Titanur",
    no: "Titanklokke"
  },
  "Watch Titanium": {
    ta: "டைட்டானியம் கடிகாரம்",
    hi: "टाइटेनियम घड़ी",
    sv: "Titanur",
    no: "Titanklokke"
  },
  "Silk Squares": {
    ta: "பட்டு சதுரங்கள்",
    hi: "सिल्क स्क्वायर",
    sv: "Silkesdukar",
    no: "Silketørklær"
  },
  "Leather Wallet": {
    ta: "தோல் பணப்பை",
    hi: "लेदर वॉलेट",
    sv: "Läderplånbok",
    no: "Skinnlommebok"
  },
  "Wallet Leather": {
    ta: "தோல் பணப்பை",
    hi: "लेदर वॉलेट",
    sv: "Läderplånbok",
    no: "Skinnlommebok"
  },
  "Merino Turtleneck": {
    ta: "மெரினோ டர்டில்நெக்",
    hi: "मेरिनो टर्टलनेक",
    sv: "Merino Polotröja",
    no: "Merino Pologenser"
  },
  "Turtleneck Merino": {
    ta: "மெரினோ டர்டில்நெக்",
    hi: "मेरिनो टर्टलनेक",
    sv: "Merino Polotröja",
    no: "Merino Pologenser"
  },
  "Artisan Sunglasses": {
    ta: "கைவினைஞர் சன்கிளாசஸ்",
    hi: "कारीगर धूप का चश्मा",
    sv: "Artisan Solglasögon",
    no: "Artisan Solbriller"
  },
  "Sunglasses Artisan": {
    ta: "கைவினைஞர் சன்கிளாசஸ்",
    hi: "कारीगर धूप का चश्मा",
    sv: "Artisan Solglasögon",
    no: "Artisan Solbriller"
  },
  "Carbon Belt": {
    ta: "கார்பன் பெல்ட்",
    hi: "कार्बन बेल्ट",
    sv: "Kolfiberbälte",
    no: "Karbonbelte"
  },
  "Belt Carbon": {
    ta: "கார்பன் பெல்ட்",
    hi: "कार्बन बेल्ट",
    sv: "Kolfiberbälte",
    no: "Karbonbelte"
  },
  "Cargo Pants": {
    ta: "கார்கோ பேண்ட்ஸ்",
    hi: "कार्गो पैंट",
    sv: "Cargobyxor",
    no: "Cargobukser"
  },
  "Pants Cargo": {
    ta: "கார்கோ பேண்ட்ஸ்",
    hi: "कार्गो पैंट",
    sv: "Cargobyxor",
    no: "Cargobukser"
  },

  // Descriptions
  "High-visibility urban style with advanced weather resistance and breathable tech fabric.": {
    ta: "மேம்பட்ட வானிலை எதிர்ப்பு மற்றும் சுவாசிக்கக்கூடிய தொழில்நுட்ப துணியுடன் கூடிய உயர்-தெரிவு நகர்ப்புற பாணி.",
    hi: "उन्नत मौसम प्रतिरोध और सांस लेने योग्य तकनीकी कपड़े के साथ उच्च-दृश्यता वाली शहरी शैली।",
    sv: "Hög synlighet i urban stil med avancerad väderbeständighet och andningsbart tekniskt tyg.",
    no: "Urban stil med høy synlighet, avansert værbestandighet og pustende teknisk stoff."
  },
  "Enhanced stealth aesthetic combined with premium neon accents. Ergonomic hood, water-repellent zippers.": {
    ta: "பிரீமியம் நியான் உச்சரிப்புகளுடன் கூடிய மேம்பட்ட ஸ்டெல்த் அழகியல். பணிச்சூழலியல் ஹூட், நீர்-விரட்டி சிப்பர்கள்.",
    hi: "प्रीमियम नियोन लहजे के साथ संयुक्त उन्नत चुपके सौंदर्य। एर्गोनोमिक हुड, जल-विकर्षक ज़िपर।",
    sv: "Förbättrad stealth-estetik i kombination med premium neonaccenter. Ergonomisk huva, vattenavvisande dragkedjor.",
    no: "Forbedret stealth-estetikk kombinert med premium neon-detaljer. Ergonomisk hette, vannavstøtande glidelåser."
  },
  "Architectural design meets high performance. Windproof, waterproof shell with modular utility pocketing.": {
    ta: "கட்டடக்கலை வடிவமைப்பு உயர் செயல்திறனை சந்திக்கிறது. மாடுலர் பயன்பாட்டு பாக்கெட்டுகளுடன் காற்றுப்புகா, நீர்ப்புகா ஷெல்.",
    hi: "वास्तुकला डिजाइन उच्च प्रदर्शन से मिलता है। मॉड्यूलर उपयोगिता पॉकेटिंग के साथ विंडप्रूफ, वाटरप्रूफ शेल।",
    sv: "Arkitektonisk design möter hög prestanda. Vindtätt, vattentätt skal med modulära fickor.",
    no: "Arkitektonisk design møter høy ytelse. Vindtett, vanntett skall med modulære lommer."
  },
  "Ultra-light reactive foam cushioning for responsive street navigation. Breathable knit construction.": {
    ta: "சுறுசுறுப்பான தெரு வழிசெலுத்தலுக்கு அதி-இலகுவான எதிர்வினை நுரை குஷனிங். சுவாசிக்கக்கூடிய பின்னல் கட்டுமானம்.",
    hi: "उत्तरदायी सड़क नेविगेशन के लिए अल्ट्रा-लाइट प्रतिक्रियाशील फोम कुशनिंग। सांस लेने योग्य बुनना निर्माण।",
    sv: "Ultralätt reaktiv skumdämpning för responsiv streetnavigation. Stickad konstruktion med god andningsförmåga.",
    no: "Ultralett reaktiv skumdemping for responsiv gatenavigering. Pustende strikket konstruksjon."
  },
  "Plush premium velvet with satin lapels. Tailored slim fit for formal distinction.": {
    ta: "சாடின் லேபல்களுடன் கூடிய பிரீமியம் வெல்வெட். முறைசார்ந்த தனித்துவத்திற்கு ஏற்றவாறு தைக்கப்பட்ட ஸ்லிம் ஃபிட்.",
    hi: "साटन अंचल के साथ आलीशान प्रीमियम मखमल। औपचारिक विशिष्टता के लिए सिलवाया स्लिम फिट।",
    sv: "Lyxig premiumsammet med satinslag. Skräddarsydd slim fit för formell elegans.",
    no: "Luksuriøs premium fløyel med satengslag. Skreddersydd slim fit for formell eleganse."
  },
  "Precision automatic movement housed in brushed titanium grade 5. Minimalist design, sapphire crystal.": {
    ta: "பிரஷ் செய்யப்பட்ட டைட்டானியம் தரம் 5 இல் உள்ள துல்லியமான தானியங்கி இயக்கம். குறைந்தபட்ச வடிவமைப்பு, நீலக்கற்கள் கண்ணாடி.",
    hi: "ब्रश किए गए टाइटेनियम ग्रेड 5 में सटीक स्वचालित आंदोलन। न्यूनतम डिजाइन, नीलम क्रिस्टल।",
    sv: "Automatiskt precisionsurverk i borstad titan av grad 5. Minimalistisk design, safirglas.",
    no: "Automatisk presisjonsurverk i børstet titan grad 5. Minimalistisk design, safirglass."
  },
  "100% mulberry silk with hand-rolled edges. Artisan prints inspired by geometric geometry.": {
    ta: "கை உருட்டப்பட்ட விளிம்புகளுடன் கூடிய 100% மல்பெரி பட்டு. வடிவியல் வடிவவியலால் ஈர்க்கப்பட்ட கைவினைஞர் அச்சிட்டுகள்.",
    hi: "हाथ से लुढ़के किनारों के साथ 100% शहतूत रेशम। ज्यामितीय ज्यामिति से प्रेरित कारीगर प्रिंट।",
    sv: "100 % mullbärssilke med handrullade kanter. Konstnärliga tryck inspirerade av geometri.",
    no: "100 % morbærsilke med håndrullede kanter. Kunstneriske trykk inspirert av geometri."
  },
  "Full-grain vegetable tanned leather with RFID blocking tech. Sleek layout for cash and cards.": {
    ta: "RFID தடுப்பு தொழில்நுட்பத்துடன் கூடிய முழு தானிய காய்கறி பதனிடப்பட்ட தோல். பணம் மற்றும் அட்டைகளுக்கான நேர்த்தியான அமைப்பு.",
    hi: "आरएफआईडी ब्लॉकिंग तकनीक के साथ पूर्ण-अनाज सब्जी टैन्ड लेदर। नकद और कार्ड के लिए चिकना लेआउट।",
    sv: "Fullnarvigt vegetabiliskt garvat läder med RFID-blockeringsteknik. Elegant layout för kontanter och kort.",
    no: "Fullnarvet vegetabilsk garvet skinn med RFID-blokkeringsteknologi. Elegant oppsett for kontanter og kort."
  },
  "Extrafine Italian merino wool. Temperature regulating, itch-free comfort, and clean ribbed silhouette.": {
    ta: "அதிநவீன இத்தாலிய மெரினோ கம்பளி. வெப்பநிலை ஒழுங்குபடுத்தல், அரிப்பு இல்லாத ஆறுதல் மற்றும் சுத்தமான ரிப்பட் நிழல்.",
    hi: "अति सूक्ष्म इतालवी मेरिनो ऊन। तापमान विनियमन, खुजली मुक्त आराम, और साफ धारीदार सिल्हूट।",
    sv: "Extrafin italiensk merinoull. Temperaturreglerande, klifri komfort och ren ribbad silhuett.",
    no: "Ekstrafin italiensk merinoull. Temperaturregulerende, kløfri komfort og ren ribbet silhuett."
  },
  "Handcrafted acetate frames with polarized scratch-resistant lenses. Timeless silhouette with modern bevels.": {
    ta: "துருவப்படுத்தப்பட்ட கீறல்-எதிர்ப்பு லென்ஸ்கள் கொண்ட கையால் செய்யப்பட்ட அசிடேட் பிரேம்கள். நவீன பெவல்களுடன் கூடிய காலமற்ற நிழல்.",
    hi: "ध्रुवीकृत खरोंच-प्रतिरोधी लेंस के साथ हस्तनिर्मित एसीटेट फ्रेम। आधुनिक बेवल के साथ कालातीत सिल्हूट।",
    sv: "Handgjorda acetatbågar med polariserade reptåliga linser. Tidlös silhuett med moderna fasningar.",
    no: "Håndlagde acetatinnfatninger med polariserte ripebestandige glass. Tidløs silhuett med moderne faser."
  },
  "Woven carbon fibers with surgical steel buckle. Indestructible core, micro-adjustable fit.": {
    ta: "அறுவைசிகிச்சை எஃகு கொக்கியுடன் கூடிய நெய்த கார்பன் இழைகள். அழிக்க முடியாத கோர், மைக்ரோ-அட்ஜஸ்டபிள் பொருத்தம்.",
    hi: "सर्जिकल स्टील बकल के साथ बुने हुए कार्बन फाइबर। अविनाशी कोर, सूक्ष्म-समायोज्य फिट।",
    sv: "Vävda kolfibrer med kirurgiskt stålspänne. Oförstörbar kärna, mikrojusterbar passform.",
    no: "Vevde karbonfibre med spenne i kirurgisk stål. Uknuselig kjerne, mikrojusterbar passform."
  },
  "Stretch tactical canvas with ergonomic pockets. Reinforced seat and knees for durability.": {
    ta: "பணிச்சூழலியல் பாக்கெட்டுகளுடன் கூடிய நீட்டிக்கப்பட்ட தந்திரோபாய கேன்வாஸ். நீடித்த உழைப்புக்காக வலுவூட்டப்பட்ட இருக்கை மற்றும் முழங்கால்கள்.",
    hi: "एर्गोनोमिक पॉकेट के साथ स्ट्रेच टैक्टिकल कैनवास। स्थायित्व के लिए प्रबलित सीट और घुटने।",
    sv: "Taktisk stretchcanvas med ergonomiska fickor. Förstärkt stuss och förstärkta knän för extra slitstyrka.",
    no: "Taktisk stretch-canvas med ergonomiske lommer. Forsterket sete og knær for ekstra slitestyrke."
  },
  "Joggers are no longer just your lazy-day essentials. From casual coffee runs to airport looks, jogger pants now rule streetwear and everyday fashion. With so many styles—slim fit joggers, baggy joggers, and even denim joggers—these pants are designed to keep you comfy without compromising style.": {
    ta: "ஜாகர்கள் இனி உங்கள் ஓய்வு நேர அத்தியாவசிய உடை மட்டுமல்ல. சாதாரண காபி பயணங்கள் முதல் விமான நிலையத் தோற்றங்கள் வரை, ஜாகர் பேன்ட்கள் இப்போது ஸ்ட்ரீட்வேர் மற்றும் அன்றாட ஃபேஷனில் ஆதிக்கம் செலுத்துகின்றன. ஸ்லிம் ஃபிட் ஜாகர்கள், பேகி ஜாகர்கள், மற்றும் டெனிம் ஜாகர்கள் எனப் பல ஸ்டைல்களில் கிடைக்கும் இந்தப் பேன்ட்கள், ஸ்டைலில் எந்த சமரசமும் செய்யாமல் உங்களை வசதியாக வைத்திருக்க வடிவமைக்கப்பட்டுள்ளன.",
    hi: "जॉगर्स अब सिर्फ आपके आलस के दिनों की जरूरत नहीं रह गए हैं। कैजुअल कॉफी रन से लेकर एयरपोर्ट लुक तक, जॉगर पैंट अब स्ट्रीटवियर और रोजमर्रा के फैशन पर राज करते हैं। इतने सारे स्टाइल के साथ - स्लिम फिट जॉगर्स, ढीले जॉगर्स और यहां तक कि डेनिम जॉगर्स - ये पैंट बिना स्टाइल से समझौता किए आपको आरामदायक रखने के लिए डिज़ाइन किए गए हैं।",
    sv: "Joggers är inte längre bara dina slappa favoritplagg. Från vardagliga kaffestunder till flygplatslooker dominerar joggingbyxor nu streetwear och vardagsmode. Med så många stilar – slim fit-joggers, baggy-joggers och till och med denim-joggers – är dessa byxor designade för att hålla dig bekväm utan att kompromissa med stilen.",
    no: "Joggebukser er ikke lenger bare de slappe favorittplaggene dine. Fra uformelle kaffeturer til flyplasslooker, joggebukser dominerer nå streetwear og hverdagsmote. Med så mange stilarter – slim fit-joggers, baggy-joggers og til og med denim-joggers – er disse buksene designet for å holde deg komfortabel uten å gå på akkord med stilen."
  },
  "Matte carbon fiber buckle with high-tensile nylon web strap.": {
    ta: "உயர்தர நைலான் வலை பட்டையுடன் கூடிய மேட் கார்பன் ஃபைபர் கொக்கி.",
    hi: "उच्च-तन्यता वाले नायलॉन वेब पट्टा के साथ मैट कार्बन फाइबर बकल।",
    sv: "Matte kolfiberspänne med hög draghållfasthet nylonband.",
    no: "Matt karbonfiberspenne med nylonbånd med høy strekkfasthet."
  },
  "Reinforced ripstop cargo pants with ergonomic zipper pockets.": {
    ta: "பணிச்சூழலியல் ஜிப்பர் பாக்கெட்டுகளுடன் கூடிய வலுவூட்டப்பட்ட ரிப்ஸ்டாப் கார்கோ பேண்ட்.",
    hi: "एर्गोनोमिक जिपर जेब के साथ प्रबलित रिपस्टॉप कार्गो पैंट।",
    sv: "Förstärkta ripstop-cargobyxor med ergonomiska dragkedjefickor.",
    no: "Forsterkede ripstop-cargobukser med ergonomiske glidelåslommer."
  },
  "Luxurious velvet blazer tailored for a modern slim silhouette.": {
    ta: "நவீன மெலிதான நிழற்படத்திற்காக வடிவமைக்கப்பட்ட ஆடம்பரமான வெல்வெட் பிளேசர்.",
    hi: "आधुनिक स्लिम सिल्हूट के लिए तैयार किया गया शानदार मखमल ब्लेज़र।",
    sv: "Lyxig sammetsblazer skräddarsydd för en modern slank silhuett.",
    no: "Luksuriøs fløyelsblazer skreddersydd for en moderne slank silhuett."
  },
  "Grade 5 titanium case with Swiss automatic chronograph movement.": {
    ta: "சுவிஸ் தானியங்கி குரோனோகிராஃப் இயக்கத்துடன் கூடிய தரம் 5 டைட்டானியம் கேஸ்.",
    hi: "स्विस स्वचालित क्रोनोग्रफ़ आंदोलन के साथ ग्रेड 5 टाइटेनियम केस।",
    sv: "Grad 5 titanboett med schweiziskt automatiskt kronografverk.",
    no: "Grad 5 titanurkasse med sveitsisk automatisk kronografurverk."
  },
  "Redefining Luxury for the Modern Era": {
    ta: "நவீன சகாப்தத்திற்கு ஆடம்பரத்தை மறுவரையறை செய்தல்",
    hi: "आधुनिक युग के लिए विलासिता को फिर से परिभाषित करना",
    sv: "Omdefinierar lyx för den moderna eran",
    no: "Omdefinerer luksus for den moderne tidsalder"
  },
  "Our Story": {
    ta: "எங்கள் கதை",
    hi: "हमारी कहानी",
    sv: "Vår historia",
    no: "Vår historie"
  },
  "GR Groups isn't just an e-commerce platform—it's a movement. We believe luxury should be accessible, authentic, and ahead of its time. Every product in our catalog is handpicked to meet the highest standards of quality and design.": {
    ta: "GR குரூப்ஸ் என்பது ஒரு மின் வணிக தளம் மட்டுமல்ல - இது ஒரு இயக்கம். ஆடம்பரம் அணுகக்கூடியதாக, உண்மையானதாக மற்றும் அதன் காலத்திற்கு முந்தியதாக இருக்க வேண்டும் என்று நாங்கள் நம்புகிறோம். எங்கள் பட்டியலில் உள்ள ஒவ்வொரு தயாரிப்பும் தரம் மற்றும் வடிவமைப்பின் மிக உயர்ந்த தரங்களை பூர்த்தி செய்ய தேர்ந்தெடுக்கப்பட்டவை.",
    hi: "GR ग्रुप्स सिर्फ एक ई-कॉमर्स प्लेटफॉर्म नहीं है - यह एक आंदोलन है। हमारा मानना है कि विलासिता सुलभ, प्रामाणिक और अपने समय से आगे होनी चाहिए। हमारी सूची में प्रत्येक उत्पाद गुणवत्ता और डिजाइन के उच्चतम मानकों को पूरा करने के लिए चुना गया है।",
    sv: "GR Groups är inte bara en e-handelsplattform – det är en rörelse. Vi anser att lyx ska vara tillgänglig, autentisk och före sin tid. Varje produkt i vår katalog är handplockad för att möta de högsta standarderna för kvalitet och design.",
    no: "GR Groups er ikke bare en e-handelsplattform – det er en bevegelse. Vi mener at luksus skal være tilgjengelig, autentisk og forut for sin tid. Hvert produkt i vår katalog er håndplukket for å møte de høyeste standardene for kvalitet og design."
  },
  "Our Mission": {
    ta: "எங்கள் நோக்கம்",
    hi: "हमारा मिशन",
    sv: "Vårt uppdrag",
    no: "Vår misjon"
  },
  "To bridge the gap between high fashion and everyday style. We partner directly with designers and artisans worldwide to bring you pieces that tell a story—each item crafted with precision, purpose, and passion.": {
    ta: "உயர் ஃபேஷன் மற்றும் அன்றாட பாணிக்கு இடையிலான இடைவெளியைக் குறைப்பது. உலகெங்கிலும் உள்ள வடிவமைப்பாளர்கள் மற்றும் கைவினைஞர்களுடன் நாங்கள் நேரடியாக கூட்டுசேர்ந்து உங்களுக்கு ஒரு கதையைச் சொல்லும் துண்டுகளைக் கொண்டு வருகிறோம் - ஒவ்வொரு பொருளும் துல்லியம், நோக்கம் மற்றும் ஆர்வத்துடன் வடிவமைக்கப்பட்டுள்ளன.",
    hi: "हाई फैशन और रोजमर्रा की शैली के बीच की खाई को पाटना। हम दुनिया भर के डिजाइनरों और कारीगरों के साथ सीधे साझेदारी करते हैं ताकि आपके लिए ऐसी चीजें ला सकें जो एक कहानी बयां करती हैं - प्रत्येक वस्तु सटीकता, उद्देश्य और जुनून के साथ तैयार की जाती है।",
    sv: "Att överbrygga klyftan mellan exklusivt mode och vardagsstil. Vi samarbetar direkt med designers och hantverkare över hela världen för att ge dig plagg som berättar en historia – varje artikel skapad med precision, syfte och passion.",
    no: "Å bygge bro mellom high fashion og hverdagsstil. Vi samarbeider direkte med designere og håndverkere over hele verden for å gi deg plagg som forteller en historie – hver artikkel laget med presisjon, formål og lidenskap."
  },
  "Happy Customers": {
    ta: "மகிழ்ச்சியான வாடிக்கையாளர்கள்",
    hi: "खुश ग्राहक",
    sv: "Nöjda kunder",
    no: "Fornøyde kunder"
  },
  "Countries Shipped": {
    ta: "நாடுகளுக்கு அனுப்பப்பட்டது",
    hi: "देशों में शिप किया गया",
    sv: "Länder skickade till",
    no: "Land sendt til"
  },
  "Premium Brands": {
    ta: "பிரீமியம் பிராண்டுகள்",
    hi: "प्रीमियम ब्रांड",
    sv: "Premiumvarumärken",
    no: "Premium merkevarer"
  },
  "Satisfaction Rate": {
    ta: "திருப்தி விகிதம்",
    hi: "संतुष्टि दर",
    sv: "Kundnöjdhet",
    no: "Kundetilfredshet"
  },
  "Our Journey": {
    ta: "எங்கள் பயணம்",
    hi: "हमारी यात्रा",
    sv: "Vår resa",
    no: "Vår reise"
  },
  "The Beginning": {
    ta: "ஆரம்பம்",
    hi: "शुरुआत",
    sv: "Början",
    no: "Begynnelsen"
  },
  "GR Groups was born from a passion for luxury fashion, launching our first curated collection of streetwear and accessories.": {
    ta: "GR குரூப்ஸ் ஆடம்பர ஃபேஷன் மீதான ஆர்வத்திலிருந்து பிறந்தது, தெரு ஆடைகள் மற்றும் ஆபரணங்களின் எங்கள் முதல் நிர்வகிக்கப்பட்ட தொகுப்பை அறிமுகப்படுத்தியது.",
    hi: "GR ग्रुप्स का जन्म लक्ज़री फैशन के जुनून से हुआ था, जिसने स्ट्रीटवियर और एक्सेसरीज़ के हमारे पहले क्यूरेटेड कलेक्शन को लॉन्च किया था।",
    sv: "GR Groups föddes ur en passion för lyxmode och lanserade vår första kurerade kollektion av streetwear och tillbehör.",
    no: "GR Groups ble født ut av en lidenskap for luksusmote, og lanserte vår første kuraterte kolleksjon av streetwear og tilbehør."
  },
  "Going Global": {
    ta: "உலகளாவிய ரீதியில் விரிவடைதல்",
    hi: "ग्लोबल होना",
    sv: "Gå globalt",
    no: "Bli global"
  },
  "We expanded to 20+ countries, partnering with exclusive artisan brands from Italy, Japan, and Scandinavia.": {
    ta: "இத்தாலி, ஜப்பான் மற்றும் ஸ்காண்டிநேவியாவைச் சேர்ந்த பிரத்தியேக கைவினைஞர் பிராண்டுகளுடன் கூட்டுசேர்ந்து, 20 க்கும் மேற்பட்ட நாடுகளுக்கு நாங்கள் விரிவுபடுத்தினோம்.",
    hi: "हम 20 से अधिक देशों में विस्तारित हुए, इटली, जापान और स्कैंडिनेविया के विशेष कारीगर ब्रांडों के साथ साझेदारी की।",
    sv: "Vi expanderade till 20+ länder och samarbetade med exklusiva hantverksvarumärken från Italien, Japan och Skandinavien.",
    no: "Vi utvidet til 20+ land, og samarbeidet med eksklusive håndverksmerker fra Italia, Japan og Skandinavia."
  },
  "Tech Innovation": {
    ta: "தொழில்நுட்ப கண்டுபிடிப்பு",
    hi: "तकनीकी नवाचार",
    sv: "Teknisk innovation",
    no: "Teknologisk innovasjon"
  },
  "Launched our AI-powered styling recommendations and augmented reality try-on features.": {
    ta: "எங்கள் AI-இயங்கும் ஸ்டைலிங் பரிந்துரைகள் மற்றும் ஆக்மென்டட் ரியாலிட்டி ட்ரை-ஆன் அம்சங்களை அறிமுகப்படுத்தினோம்.",
    hi: "हमारी एआई-संचालित स्टाइलिंग सिफारिशें और संवर्धित वास्तविकता ट्राई-ऑन सुविधाएं लॉन्च कीं।",
    sv: "Lanserade våra AI-drivna stylingrekommendationer och try-on-funktioner i förstärkt verklighet.",
    no: "Lanserte våre AI-drevne stylinganbefalinger og prøvefunksjoner i utvidet virkelighet."
  },
  "Community First": {
    ta: "சமூகம் முதலில்",
    hi: "कम्युनिटी फर्स्ट",
    sv: "Gemenskapen först",
    no: "Fellesskap først"
  },
  "Introduced our members-only Elite program, offering early access drops and personalized experiences.": {
    ta: "எங்கள் உறுப்பினர்களுக்கு மட்டுமேயான எலைட் திட்டத்தை அறிமுகப்படுத்தினோம், ஆரம்ப அணுகல் மற்றும் தனிப்பயனாக்கப்பட்ட அனுபவங்களை வழங்கினோம்.",
    hi: "हमारे केवल सदस्यों के लिए एलीट कार्यक्रम की शुरुआत की, जो शुरुआती पहुंच और व्यक्तिगत अनुभव प्रदान करता है।",
    sv: "Introducerade vårt Elite-program endast för medlemmar, vilket erbjuder drops med tidig tillgång och personliga upplevelser.",
    no: "Introduserte vårt Elite-program kun for medlemmer, som tilbyr tidlig tilgang til drops og personlige opplevelser."
  },
  "Sustainability": {
    ta: "நிலைத்தன்மை",
    hi: "सतत विकास",
    sv: "Hållbarhet",
    no: "Bærekraft"
  },
  "Committed to carbon-neutral shipping and partnered with eco-conscious brands worldwide.": {
    ta: "கார்பன்-நடுநிலை கப்பல் போக்குவரத்துக்கு உறுதியளித்ததுடன், உலகளவில் சுற்றுச்சூழல் உணர்வுள்ள பிராண்டுகளுடன் கூட்டு சேர்ந்தோம்.",
    hi: "कार्बन-तटस्थ शिपिंग के लिए प्रतिबद्ध और दुनिया भर में पर्यावरण के अनुकूल ब्रांडों के साथ साझेदारी की।",
    sv: "Engagerade oss i koldioxidneutral frakt och samarbetade med miljömedvetna varumärken över hela världen.",
    no: "Forpliktet oss til karbonnøytral frakt og samarbeidet med miljøbevisste merkevarer over hele verden."
  },
  "Ready to experience GR Groups?": {
    ta: "GR குரூப்ஸை அனுபவிக்க தயாரா?",
    hi: "GR ग्रुप्स का अनुभव करने के लिए तैयार हैं?",
    sv: "Redo att uppleva GR Groups?",
    no: "Klar til å oppleve GR Groups?"
  },
  "Join thousands of customers who've already elevated their style.": {
    ta: "ஏற்கனவே தங்கள் பாணியை உயர்த்திய ஆயிரக்கணக்கான வாடிக்கையாளர்களுடன் சேருங்கள்.",
    hi: "उन हजारों ग्राहकों में शामिल हों जिन्होंने पहले से ही अपनी शैली को ऊंचा किया है.",
    sv: "Gör som tusentals kunder som redan har lyft sin stil.",
    no: "Bli med tusenvis av kunder som allerede har løftet stilen sin."
  },
  "Start Shopping": {
    ta: "ஷாப்பிங் செய்ய தொடங்கவும்",
    hi: "खरीदारी शुरू करें",
    sv: "Börja handla",
    no: "Begynn å handle"
  },
  "Loading Our Story...": {
    ta: "எங்கள் கதையை ஏற்றுகிறது...",
    hi: "हमारी कहानी लोड हो रही है...",
    sv: "Laddar vår historia...",
    no: "Laster vår historie..."
  },
  "Silk Pocket Square Set": {
    ta: "பட்டு பாக்கெட் சதுர தொகுப்பு",
    hi: "रेशम पॉकेट स्क्वायर सेट",
    sv: "Sidennäsduksset",
    no: "Silkelommetørklesett"
  },
  "Monogram Leather Wallet": {
    ta: "மோனோகிராம் தோல் பணப்பை",
    hi: "मोनोग्राम लेदर वॉलेट",
    sv: "Monogram läderplånbok",
    no: "Monogram skinnlommebok"
  },
  "Merino Wool Turtleneck": {
    ta: "மெரினோ கம்பளி டர்டில்நெக்",
    hi: "मेरिनो ऊनी टर्टलनेक",
    sv: "Merinoullspolotröja",
    no: "Merinoull pologenser"
  },
  "Dhoties": {
    ta: "வேஷ்டிகள்",
    hi: "धोती",
    sv: "Dhotis",
    no: "Dhotier"
  },
  "Hoodie": {
    ta: "ஹூடி",
    hi: "हुडी",
    sv: "Huvtröja",
    no: "Hettegenser"
  },
  "Shirts": {
    ta: "சட்டைகள்",
    hi: "शर्ट",
    sv: "Skjortor",
    no: "Skjorter"
  },
  "Casual vs Formal": {
    ta: "சாதாரண vs முறைசார்ந்த",
    hi: "कैजुअल बनाम औपचारिक",
    sv: "Avspänd vs Formell",
    no: "Uformell vs Formell"
  },
  "Cargo": {
    ta: "கார்கோ",
    hi: "कार्गो",
    sv: "Cargo",
    no: "Cargo"
  },
  "Exclusive Silk Scarf": {
    ta: "பிரத்தியேக பட்டு தாவணி",
    hi: "विशेष रेशमी दुपट्टा",
    sv: "Exklusiv silkesscarf",
    no: "Eksklusivt silkeskjerf"
  },
  "I phone 15 pro max": {
    ta: "ஐபோன் 15 ப்ரோ மேக்ஸ்",
    hi: "आईफोन 15 प्रो मैक्स",
    sv: "iPhone 15 Pro Max",
    no: "iPhone 15 Pro Max"
  },
  "iPhone 15 pro max": {
    ta: "ஐபோன் 15 ப்ரோ மேக்ஸ்",
    hi: "आईफोन 15 प्रो मैक्स",
    sv: "iPhone 15 Pro Max",
    no: "iPhone 15 Pro Max"
  },
  "Best Seller": {
    ta: "சிறந்த விற்பனை",
    hi: "बेस्ट सेलर",
    sv: "Bästsäljare",
    no: "Bestselger"
  },
  "Trending": {
    ta: "பிரபலமானவை",
    hi: "ट्रेंडिंग",
    sv: "Trendande",
    no: "Populært"
  },
  "Sports": {
    ta: "விளையாட்டு",
    hi: "खेल",
    sv: "Sport",
    no: "Sport"
  },
  "Traditional": {
    ta: "பாரம்பரியம்",
    hi: "पारंपरिक",
    sv: "Traditionell",
    no: "Tradisjonell"
  },
  "I PHONE 17PRO MAX": {
    ta: "ஐபோன் 17 ப்ரோ மேக்ஸ்",
    hi: "आईफोन 17 प्रो मैक्स",
    sv: "iPhone 17 Pro Max",
    no: "iPhone 17 Pro Max"
  },
  "I PHONE 14PRO MAX": {
    ta: "ஐபோன் 14 ப்ரோ மேக்ஸ்",
    hi: "आईफोन 14 प्रो मैक्स",
    sv: "iPhone 14 Pro Max",
    no: "iPhone 14 Pro Max"
  },
  "SAMSUNG S26 ULTRA": {
    ta: "சாம்சங் எஸ்26 அல்ட்ரா",
    hi: "सैमसंग एस26 अल्ट्रा",
    sv: "Samsung S26 Ultra",
    no: "Samsung S26 Ultra"
  },
  "SAMSUNG S24 ULTRA": {
    ta: "சாம்சங் எஸ்24 அல்ட்ரா",
    hi: "सैमसंग एस24 अल्ट्रा",
    sv: "Samsung S24 Ultra",
    no: "Samsung S24 Ultra"
  }
};

/**
 * Translates a given English string to the selected locale.
 * Falls back to the original string if no translation is found.
 */
export function translateString(str, locale) {
  if (!str) return "";
  const cleanedLocale = String(locale).toLowerCase().trim();
  if (!cleanedLocale || cleanedLocale === "en") return str;

  // Handle Norwegian "nw" -> "no" and Swedish "sw" -> "sv" mappings
  const targetLocale = cleanedLocale === "sw" ? "sv" : cleanedLocale === "nw" ? "no" : cleanedLocale;

  const key = str.trim();
  const match = dictionary[key] || Object.values(dictionary).find(d => d[targetLocale] === key);
  
  if (dictionary[key] && dictionary[key][targetLocale]) {
    return dictionary[key][targetLocale];
  }

  // Fallback to case-insensitive match
  const lowercaseKey = key.toLowerCase();
  for (const [engK, val] of Object.entries(dictionary)) {
    if (engK.toLowerCase() === lowercaseKey && val[targetLocale]) {
      return val[targetLocale];
    }
  }

  return str;
}

/**
 * Reverse-translates a given localized string back to English.
 */
export function reverseTranslateString(str, locale) {
  if (!str) return "";
  const cleanedLocale = String(locale).toLowerCase().trim();
  if (!cleanedLocale || cleanedLocale === "en") return str;

  const targetLocale = cleanedLocale === "sw" ? "sv" : cleanedLocale === "nw" ? "no" : cleanedLocale;
  const searchVal = str.trim().toLowerCase();

  for (const [englishKey, translations] of Object.entries(dictionary)) {
    const localizedVal = translations[targetLocale];
    if (localizedVal && localizedVal.toLowerCase() === searchVal) {
      return englishKey;
    }
  }

  return str;
}

/**
 * Translates a complete Product object.
 */
export function translateProduct(product, locale) {
  if (!product) return null;
  const cleanedLocale = String(locale).toLowerCase().trim();
  if (!cleanedLocale || cleanedLocale === "en") return product;

  return {
    ...product,
    name: translateString(product.name, locale),
    title: translateString(product.title || product.name, locale),
    description: translateString(product.description, locale),
    category: translateString(product.category, locale),
    brand: translateString(product.brand, locale),
    colors: (product.colors || []).map(c => translateString(c, locale)),
    tags: (product.tags || []).map(t => translateString(t, locale))
  };
}

/**
 * Translates a Category object.
 */
export function translateCategory(category, locale) {
  if (!category) return null;
  const cleanedLocale = String(locale).toLowerCase().trim();
  if (!cleanedLocale || cleanedLocale === "en") return category;

  return {
    ...category,
    name: translateString(category.name, locale),
    description: translateString(category.description, locale)
  };
}

/**
 * Translates a Tag object.
 */
export function translateTag(tag, locale) {
  if (!tag) return null;
  const cleanedLocale = String(locale).toLowerCase().trim();
  if (!cleanedLocale || cleanedLocale === "en") return tag;

  return {
    ...tag,
    name: translateString(tag.name, locale),
    description: translateString(tag.description, locale)
  };
}

/**
 * Normalizes query / filter parameters by reverse-translating localized filters back to English.
 */
export function reverseTranslateParams(params, locale) {
  if (!params) return {};
  const cleanedLocale = String(locale).toLowerCase().trim();
  if (!cleanedLocale || cleanedLocale === "en") return params;

  const updatedParams = { ...params };

  if (updatedParams.category) {
    updatedParams.category = reverseTranslateString(updatedParams.category, locale);
  }
  if (updatedParams.brand) {
    updatedParams.brand = updatedParams.brand
      .split(",")
      .map(b => reverseTranslateString(b.trim(), locale))
      .join(",");
  }
  if (updatedParams.color) {
    updatedParams.color = updatedParams.color
      .split(",")
      .map(c => reverseTranslateString(c.trim(), locale))
      .join(",");
  }
  if (updatedParams.tag) {
    updatedParams.tag = updatedParams.tag
      .split(",")
      .map(t => reverseTranslateString(t.trim(), locale))
      .join(",");
  }
  if (updatedParams.search) {
    updatedParams.search = reverseTranslateString(updatedParams.search, locale);
  }

  return updatedParams;
}

/**
 * Retrieves all translated values for a given string (including English) from the dictionary.
 */
export function getAllTranslations(str) {
  if (!str) return [];
  const searchVal = str.trim().toLowerCase();

  for (const [englishKey, translations] of Object.entries(dictionary)) {
    if (englishKey.toLowerCase() === searchVal) {
      return Array.from(new Set([englishKey, ...Object.values(translations)].filter(Boolean)));
    }
    for (const localizedVal of Object.values(translations)) {
      if (typeof localizedVal === "string" && localizedVal.toLowerCase() === searchVal) {
        return Array.from(new Set([englishKey, ...Object.values(translations)].filter(Boolean)));
      }
    }
  }

  return [str];
}
