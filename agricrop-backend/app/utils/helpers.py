"""
AgriCrop Backend - Helper Utilities
Common helpers for API responses, serialization, disease info, and moisture recommendations.
"""

from datetime import datetime

from bson import ObjectId


def format_response(data=None, message="Success", status_code=200):
    """
    Build a consistent JSON-serializable API response dict and status code tuple.
    Merges dictionary data into the root and maps list data to the correct keys
    (reports, fields, alerts) for frontend compatibility.
    """
    response = {
        "success": 200 <= status_code < 300,
        "message": message,
        "data": data,
    }
    
    if data is not None:
        if isinstance(data, dict):
            response.update(data)
        elif isinstance(data, list):
            # Map list elements to expected frontend keys
            key = "items"
            if len(data) > 0:
                first = data[0]
                if isinstance(first, dict):
                    if "disease_name" in first:
                        key = "reports"
                    elif "predicted_moisture" in first or "temperature" in first:
                        # Could be moisture reports or moisture trends
                        key = "reports"
                    elif "crop_type" in first and "area" in first:
                        key = "fields"
                    elif "severity" in first and "title" in first:
                        key = "alerts"
            
            # Map to the specific key so frontend response.data.key works
            response[key] = data
            
            # Fallback keys for empty or unmatched lists to prevent frontend crashes
            if key == "items":
                response["fields"] = data
                response["reports"] = data
                response["alerts"] = data
                
    return response, status_code


def serialize_doc(doc):
    """
    Convert a MongoDB document to a JSON-serializable dict.
    Handles ObjectId → str and datetime → ISO format string conversions recursively.
    """
    if doc is None:
        return None

    if isinstance(doc, list):
        return [serialize_doc(item) for item in doc]

    if not isinstance(doc, dict):
        return doc

    serialized = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            serialized[key] = str(value)
        elif isinstance(value, datetime):
            serialized[key] = value.isoformat()
        elif isinstance(value, dict):
            serialized[key] = serialize_doc(value)
        elif isinstance(value, list):
            serialized[key] = [serialize_doc(item) if isinstance(item, (dict, ObjectId, datetime)) else item for item in value]
        elif isinstance(value, bytes):
            serialized[key] = value.decode("utf-8", errors="replace")
        else:
            serialized[key] = value

    return serialized


def get_disease_info(disease_name):
    """
    Return comprehensive, real agricultural information for the given disease.
    Includes description, symptoms, prevention tips, and treatment options.
    Covers the 5 major crop diseases detected by the AI model.
    """
    disease_database = {
        "Bacterial Blight": {
            "disease_name": "Bacterial Blight",
            "description": (
                "Bacterial blight is a serious plant disease caused by Xanthomonas species bacteria. "
                "It affects a wide range of crops including rice, cotton, beans, and citrus. The bacteria "
                "enter through natural openings like stomata and wounds, spreading rapidly in warm, humid "
                "conditions. Yield losses can reach 20-30% in severe outbreaks and up to 75% in highly "
                "susceptible varieties under favorable environmental conditions."
            ),
            "symptoms": [
                "Water-soaked lesions on leaves that enlarge and turn brown with yellow halos, often following the leaf veins in a streaky pattern.",
                "Wilting and drooping of young leaves, especially at the tips and margins, which later dry out and become papery.",
                "Yellowing (chlorosis) of leaf edges that progresses inward, eventually leading to complete leaf necrosis and defoliation.",
                "Oozing of milky or yellow bacterial exudate from cut stems or leaf lesions, especially visible in early morning dew.",
                "Dark brown to black discoloration of vascular tissue visible when stems are cut longitudinally."
            ],
            "prevention": [
                "Use certified disease-free seeds and resistant crop varieties adapted to local conditions to reduce initial inoculum.",
                "Practice crop rotation with non-host crops (cereals after legumes) for at least 2-3 seasons to break the disease cycle.",
                "Avoid overhead irrigation and working in wet fields; use drip irrigation to minimize leaf wetness duration.",
                "Remove and destroy infected plant debris, crop residues, and volunteer plants promptly after harvest.",
                "Maintain proper plant spacing to ensure good air circulation and reduce humidity in the crop canopy."
            ],
            "treatment": [
                "Apply copper-based bactericides such as copper hydroxide or copper oxychloride at 2-3 g/L at the first sign of symptoms, repeating every 7-10 days.",
                "Use streptomycin sulfate spray (500 ppm) during early infection stages; alternate with copper products to prevent resistance development.",
                "Apply biological control agents such as Pseudomonas fluorescens at 10 g/L as a foliar spray to suppress bacterial populations.",
                "Remove and burn severely infected plants immediately to prevent further spread to healthy neighboring plants.",
                "Boost plant immunity by applying potassium-rich fertilizers and balanced nutrition to help plants resist secondary infections."
            ],
            "severity_guide": {
                "low": "Less than 10% leaf area affected; localized spots on a few leaves.",
                "moderate": "10-25% leaf area affected; multiple leaves showing symptoms.",
                "high": "Over 25% leaf area affected; widespread wilting and defoliation."
            }
        },
        "Brown Spot": {
            "disease_name": "Brown Spot",
            "description": (
                "Brown spot is a fungal disease caused by Bipolaris oryzae (formerly Helminthosporium oryzae). "
                "It is one of the most prevalent rice diseases worldwide and also affects other cereals. The "
                "disease is strongly associated with nutrient-deficient soils, particularly low nitrogen and "
                "potassium. The 1943 Bengal Famine was partly attributed to a severe brown spot epidemic. "
                "Yield losses typically range from 5-45% depending on severity and growth stage."
            ),
            "symptoms": [
                "Small, circular to oval brown spots (2-14 mm) on leaves with gray or whitish centers and distinct dark brown margins.",
                "Lesions on leaf sheaths that appear as dark brown oval spots, which may coalesce to form large necrotic areas.",
                "Infected grains show dark brown to black spots or discoloration, leading to reduced grain quality and shriveled kernels.",
                "Seedling blight with brown lesions on coleoptile and primary leaves, causing poor stand establishment and stunted growth.",
                "In severe cases, entire leaves turn brown and dry up prematurely, resembling drought damage from a distance."
            ],
            "prevention": [
                "Apply balanced fertilization, especially adequate nitrogen (100-120 kg/ha), phosphorus, and potassium to strengthen plant resistance.",
                "Use resistant varieties and treat seeds with fungicide (carbendazim at 2 g/kg seed) before planting to eliminate seed-borne inoculum.",
                "Maintain optimal soil pH (5.5-6.5) and improve soil organic matter through composting and green manuring practices.",
                "Ensure proper water management; avoid both drought stress and prolonged flooding that weakens plant defenses.",
                "Practice clean cultivation by removing infected stubble and straw after harvest; deep plowing helps bury fungal spores."
            ],
            "treatment": [
                "Apply foliar fungicides such as propiconazole (Tilt) at 1 mL/L or carbendazim at 1 g/L at the first appearance of symptoms.",
                "Use mancozeb (Dithane M-45) at 2.5 g/L as a preventive spray at tillering and booting stages, repeating at 10-14 day intervals.",
                "Apply tricyclazole at 0.6 g/L as a systemic fungicide that provides both protective and curative action against brown spot.",
                "Spray potassium silicate (3-5 mL/L) to strengthen cell walls and enhance plant resistance to fungal penetration.",
                "Apply neem oil emulsion (5 mL/L) mixed with Trichoderma viride as a biological control measure for organic farming systems."
            ],
            "severity_guide": {
                "low": "Less than 5% leaf area affected; scattered small spots.",
                "moderate": "5-25% leaf area affected; lesions merging on several leaves.",
                "high": "Over 25% leaf area affected; severe blighting and grain discoloration."
            }
        },
        "Leaf Blast": {
            "disease_name": "Leaf Blast",
            "description": (
                "Leaf blast, caused by the fungus Magnaporthe oryzae (formerly Pyricularia oryzae), is the "
                "most destructive disease of rice worldwide. It can attack at any growth stage and affects "
                "leaves, stems, nodes, and panicles. The pathogen is highly variable with hundreds of races, "
                "making it difficult to breed durable resistance. Under favorable conditions (high humidity, "
                "moderate temperatures of 25-28°C, and heavy nitrogen fertilization), the disease can cause "
                "complete crop failure with losses exceeding 90%."
            ),
            "symptoms": [
                "Diamond-shaped or elliptical lesions on leaves with gray or white centers, dark brown borders, and pointed ends extending 1-3 cm long.",
                "Neck rot (neck blast) causing the panicle base to turn brown-black, leading to partial or complete blanking of grains (white heads).",
                "Node blast with dark brown to black necrotic bands encircling stem nodes, causing stem breakage and lodging.",
                "Collar blast at the junction of leaf blade and sheath, causing the entire leaf to dry up and die prematurely.",
                "In severe cases, large areas of the leaf appear burned or scorched; lesions merge to kill entire leaves within days."
            ],
            "prevention": [
                "Avoid excessive nitrogen fertilization; apply nitrogen in split doses (3-4 splits) to prevent lush susceptible growth.",
                "Use blast-resistant varieties carrying multiple resistance genes (Pi-ta, Pi-b, Pi-z5) and rotate varieties every 2-3 years.",
                "Maintain shallow, continuous flooding (2-5 cm) in paddies to reduce leaf wetness and spore germination on leaf surfaces.",
                "Plant at recommended spacing (20×15 cm) and avoid very dense planting that creates high humidity in the canopy.",
                "Apply silicon-based fertilizers (200 kg/ha calcium silicate) to strengthen cell walls and reduce fungal penetration."
            ],
            "treatment": [
                "Apply tricyclazole (Beam) at 0.6 g/L as a preventive systemic fungicide; it inhibits melanin biosynthesis essential for fungal penetration.",
                "Use isoprothiolane (Fuji-One) at 1.5 mL/L for both preventive and curative action; apply at booting stage to prevent neck blast.",
                "Spray azoxystrobin (Amistar) at 1 mL/L, a strobilurin fungicide that provides broad-spectrum control for up to 3 weeks.",
                "Apply kasugamycin at 2 mL/L as an antibiotic fungicide effective against blast, especially during early infection stages.",
                "Use biological control with Bacillus subtilis-based products as a preventive treatment; apply at tillering and panicle initiation stages."
            ],
            "severity_guide": {
                "low": "Less than 5% leaf area affected; few scattered lesions.",
                "moderate": "5-25% leaf area affected; active sporulating lesions present.",
                "high": "Over 25% leaf area affected; neck blast present; major yield loss expected."
            }
        },
        "Leaf Scald": {
            "disease_name": "Leaf Scald",
            "description": (
                "Leaf scald is a fungal disease caused by Microdochium oryzae (formerly Rhynchosporium oryzae). "
                "It is particularly prevalent in temperate and subtropical rice-growing regions. The disease "
                "primarily affects the leaves and is favored by cool temperatures (20-25°C), high humidity, "
                "and heavy dew. It is often associated with excessive nitrogen application and dense planting. "
                "While typically causing moderate yield losses of 10-20%, severe outbreaks under favorable "
                "conditions can result in losses exceeding 30%."
            ),
            "symptoms": [
                "Oblong or irregular lesions starting from leaf tips or edges with alternating light tan and dark brown banding (zonate pattern).",
                "Scalded or boiled appearance of leaf tips that turn light brown to grayish-white, as if damaged by hot water.",
                "Dark brown diffuse borders on lesions that gradually merge and expand, eventually covering the entire leaf blade.",
                "Fine translucent halos visible around fresh lesions when leaves are held against light, indicating active fungal growth.",
                "In advanced stages, leaves become dry and papery with a bleached appearance; severely affected plants show reduced tillering."
            ],
            "prevention": [
                "Optimize nitrogen application rates (do not exceed 120 kg N/ha); use slow-release fertilizers to avoid sudden flushes of tender growth.",
                "Plant resistant or tolerant varieties and use certified clean seed to reduce primary inoculum sources.",
                "Avoid planting during periods of persistent cool, cloudy weather; adjust planting dates to escape peak disease pressure.",
                "Maintain proper drainage to reduce prolonged leaf wetness; avoid excessive standing water in the field.",
                "Remove weed hosts, particularly grasses in the genera Leersia and Oryza that can harbor the pathogen between seasons."
            ],
            "treatment": [
                "Apply propiconazole (Tilt) at 1 mL/L or tebuconazole at 1.5 mL/L at the first sign of symptoms for effective curative control.",
                "Use carbendazim at 1 g/L combined with mancozeb at 2 g/L as a tank mix for broad-spectrum protection and systemic activity.",
                "Spray edifenphos (Hinosan) at 1 mL/L, which provides both contact and systemic activity against leaf scald.",
                "Apply foliar potassium (KCl at 1%) and zinc sulfate (0.5%) to improve plant vigor and reduce disease severity.",
                "Use Trichoderma harzianum-based biocontrol formulations at 5 g/L as preventive sprays during the vegetative growth stage."
            ],
            "severity_guide": {
                "low": "Less than 10% leaf area affected; symptoms limited to leaf tips.",
                "moderate": "10-25% leaf area affected; scalding spreading across multiple leaves.",
                "high": "Over 25% leaf area affected; severe defoliation and reduced grain filling."
            }
        },
        "Narrow Brown Spot": {
            "disease_name": "Narrow Brown Spot",
            "description": (
                "Narrow brown spot is a fungal disease caused by Cercospora janseana (previously "
                "Cercospora oryzae). It is a common disease in most rice-growing regions worldwide. "
                "The pathogen produces narrow, linear lesions primarily on leaves and leaf sheaths. "
                "While individual lesions are small, severe infections cause significant reduction in "
                "photosynthetic area, leading to yield losses of 10-40%. The disease is favored by "
                "warm temperatures (25-30°C), high humidity, and is more severe in nutrient-deficient soils."
            ),
            "symptoms": [
                "Short, narrow, linear brown lesions (2-10 mm long, 1-2 mm wide) running parallel to the leaf veins, often appearing as fine brown streaks.",
                "Lesions are dark brown to reddish-brown in color, sometimes with a lighter center as they mature and expand.",
                "On leaf sheaths, similar narrow brown spots appear that may merge to form elongated dark brown streaks.",
                "Severely infected leaves show numerous closely spaced lesions that give the leaf a uniformly brown, scorched appearance.",
                "Grain infection causes brown discoloration of the hull surface, reducing market grade and seed viability."
            ],
            "prevention": [
                "Apply balanced fertilization with emphasis on potassium (60-80 kg K2O/ha) and phosphorus to improve plant health and disease resistance.",
                "Use certified disease-free seeds and treat seeds with thiram or captan fungicide at 2-3 g/kg before sowing.",
                "Avoid very close planting; maintain recommended spacing to promote air circulation and reduce canopy humidity levels.",
                "Practice crop rotation with non-rice crops for at least one season to reduce soil-borne inoculum levels.",
                "Remove and destroy infected crop stubble and debris after harvest; burn or compost straw to eliminate overwintering fungal spores."
            ],
            "treatment": [
                "Apply mancozeb (Dithane M-45) at 2.5 g/L as a preventive spray at booting and heading stages for effective contact protection.",
                "Use propiconazole at 1 mL/L or hexaconazole at 2 mL/L as systemic fungicides that halt disease progression and protect new growth.",
                "Spray copper oxychloride at 3 g/L as an alternative broad-spectrum fungicide, particularly effective in early disease stages.",
                "Apply chlorothalonil (Daconil) at 2 g/L for contact protection; especially useful as a rotational fungicide to prevent resistance.",
                "Use neem-based formulations (azadirachtin 0.3%) at 3 mL/L as an eco-friendly option for integrated pest management programs."
            ],
            "severity_guide": {
                "low": "Less than 10% leaf area affected; scattered narrow lesions on lower leaves.",
                "moderate": "10-25% leaf area affected; lesions present on upper and lower leaves.",
                "high": "Over 25% leaf area affected; dense lesions reducing photosynthetic capacity significantly."
            }
        },
        "Healthy": {
            "disease_name": "Healthy",
            "description": (
                "No disease detected. The plant appears healthy with normal growth characteristics. "
                "Healthy plants display uniform green coloration, strong stems, and vigorous growth "
                "appropriate for their growth stage."
            ),
            "symptoms": [],
            "prevention": [
                "Continue regular monitoring and scouting of crops at least twice a week during the growing season.",
                "Maintain balanced fertilization and proper irrigation schedules to keep plants vigorous and disease-resistant.",
                "Practice integrated pest management (IPM) to prevent future disease outbreaks."
            ],
            "treatment": [
                "No treatment required. Continue current crop management practices.",
                "Maintain good field hygiene and monitor for any early signs of stress or disease.",
                "Keep records of crop health for future reference and trend analysis."
            ],
            "severity_guide": {
                "low": "No disease present.",
                "moderate": "N/A",
                "high": "N/A"
            }
        }
    }

    # Case-insensitive lookup with fallback
    for key in disease_database:
        if key.lower() == disease_name.lower():
            return disease_database[key]

    # Default response for unknown diseases
    return {
        "disease_name": disease_name,
        "description": f"Information for '{disease_name}' is not available in the database. Please consult a local agricultural extension officer for expert guidance.",
        "symptoms": [
            "Refer to local crop disease identification guides for symptom details.",
            "Look for abnormal coloration, spots, lesions, or wilting patterns.",
            "Compare affected tissue with images in agricultural disease databases."
        ],
        "prevention": [
            "Maintain good field hygiene and remove infected plant material promptly.",
            "Use certified disease-free seeds and resistant varieties when available.",
            "Practice crop rotation and balanced fertilization to strengthen plant immunity."
        ],
        "treatment": [
            "Consult a local agricultural extension officer or plant pathologist for accurate diagnosis.",
            "Submit samples to a plant disease diagnostic laboratory for confirmation before applying treatments.",
            "Apply broad-spectrum fungicides as a precautionary measure after obtaining expert advice."
        ],
        "severity_guide": {
            "low": "Minor symptoms observed.",
            "moderate": "Moderate symptoms requiring attention.",
            "high": "Severe symptoms requiring immediate intervention."
        }
    }


def get_moisture_recommendations(moisture_level, soil_type="loamy"):
    """
    Return real irrigation recommendations based on predicted soil moisture level
    and soil type. moisture_level is a percentage (0-100).
    """
    soil_type = soil_type.lower() if soil_type else "loamy"

    # Soil-specific water-holding characteristics
    soil_characteristics = {
        "clay": {"retention": "high", "drainage": "slow", "irrigation_interval": "longer"},
        "sandy": {"retention": "low", "drainage": "fast", "irrigation_interval": "shorter"},
        "loamy": {"retention": "medium", "drainage": "moderate", "irrigation_interval": "moderate"},
        "silt": {"retention": "medium-high", "drainage": "moderate", "irrigation_interval": "moderate"},
        "peaty": {"retention": "very high", "drainage": "slow", "irrigation_interval": "longest"},
        "chalky": {"retention": "low-medium", "drainage": "fast", "irrigation_interval": "shorter"},
        "black": {"retention": "high", "drainage": "moderate", "irrigation_interval": "longer"},
        "red": {"retention": "medium", "drainage": "moderate-fast", "irrigation_interval": "moderate"},
        "alluvial": {"retention": "medium-high", "drainage": "moderate", "irrigation_interval": "moderate"},
        "laterite": {"retention": "low", "drainage": "fast", "irrigation_interval": "shorter"},
    }

    soil_info = soil_characteristics.get(soil_type, soil_characteristics["loamy"])

    try:
        moisture = float(moisture_level)
    except (TypeError, ValueError):
        moisture = 50.0

    if moisture < 20:
        level = "critically_low"
        status = "Critical - Immediate Irrigation Required"
        recommendations = [
            f"Soil moisture is critically low at {moisture:.1f}%. Irrigate immediately to prevent permanent crop damage and wilting.",
            f"For {soil_type} soil with {soil_info['retention']} water retention, apply deep irrigation (50-75 mm) to replenish the root zone.",
            "Use drip or furrow irrigation to maximize water delivery to root zones and minimize evaporation losses.",
            "Apply organic mulch (5-10 cm layer of straw, leaves, or crop residue) to reduce further moisture loss from evaporation.",
            "Monitor plant turgor pressure; if leaves are wilting severely, irrigate during cooler hours (early morning or late evening).",
            "Consider applying a soil wetting agent to improve water infiltration, especially in hydrophobic sandy soils.",
        ]
    elif moisture < 30:
        level = "low"
        status = "Low - Irrigation Recommended Soon"
        recommendations = [
            f"Soil moisture is low at {moisture:.1f}%. Schedule irrigation within the next 24 hours to prevent crop stress.",
            f"For {soil_type} soil, apply moderate irrigation (25-40 mm) at {soil_info['irrigation_interval']} intervals.",
            "Increase irrigation frequency but reduce per-session volume to maintain consistent moisture levels.",
            "Add organic mulch around plant bases to conserve existing soil moisture and moderate soil temperature.",
            "Monitor weather forecasts; if rain is expected within 24-48 hours, a lighter irrigation may suffice.",
        ]
    elif moisture < 50:
        level = "moderate_low"
        status = "Moderate-Low - Monitor Closely"
        recommendations = [
            f"Soil moisture is moderately low at {moisture:.1f}%. Current levels are adequate but trending toward stress levels.",
            f"For {soil_type} soil with {soil_info['drainage']} drainage, plan irrigation within the next 2-3 days.",
            "Continue regular monitoring; check soil moisture at 15-20 cm depth to assess root zone conditions.",
            "Ensure mulching is maintained to slow moisture depletion during hot and windy conditions.",
            "Consider foliar application of anti-transpirants if temperatures exceed 35°C to reduce water loss.",
        ]
    elif moisture < 70:
        level = "optimal"
        status = "Optimal - Good Moisture Levels"
        recommendations = [
            f"Soil moisture is at an optimal level of {moisture:.1f}%. Current conditions are favorable for crop growth.",
            "Maintain current irrigation schedule; avoid over-watering which can lead to root rot and nutrient leaching.",
            f"For {soil_type} soil, the next irrigation can be scheduled at the regular {soil_info['irrigation_interval']} interval.",
            "Continue routine monitoring to ensure moisture remains in the optimal 50-70% range throughout the growing season.",
            "This is a good time to apply fertilizers, as adequate moisture ensures proper nutrient uptake by roots.",
        ]
    elif moisture < 85:
        level = "high"
        status = "High - Reduce Irrigation"
        recommendations = [
            f"Soil moisture is high at {moisture:.1f}%. Reduce or skip the next scheduled irrigation to prevent waterlogging.",
            f"For {soil_type} soil with {soil_info['drainage']} drainage, allow natural drainage before the next watering cycle.",
            "Check field drainage systems to ensure excess water can drain away from root zones within 24-48 hours.",
            "Monitor for signs of root stress: yellowing lower leaves, stunted growth, or fungal growth at the soil surface.",
            "Avoid fertilizer application until moisture drops to 60-70%, as nutrients may leach away in saturated soils.",
        ]
    else:
        level = "excessive"
        status = "Excessive - Waterlogging Risk"
        recommendations = [
            f"Soil moisture is excessively high at {moisture:.1f}%. Stop all irrigation immediately to prevent waterlogging and root rot.",
            f"For {soil_type} soil with {soil_info['drainage']} drainage, improve drainage by clearing blocked channels and outlets.",
            "Monitor for anaerobic soil conditions: foul odors, bluish-gray soil color, and wilting despite wet soil indicate oxygen deprivation.",
            "If standing water is present, pump or drain the field to allow root zone aeration within 24 hours.",
            "Apply fungicides preventively, as waterlogged conditions strongly favor root rot pathogens like Pythium and Phytophthora.",
            "After drainage, apply gypsum (250-500 kg/ha) to improve soil structure and prevent surface crusting.",
        ]

    return {
        "moisture_percentage": round(moisture, 2),
        "moisture_level": level,
        "status": status,
        "soil_type": soil_type,
        "soil_characteristics": soil_info,
        "recommendations": recommendations,
    }
