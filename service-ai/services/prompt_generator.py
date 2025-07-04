def generate_prompts(profile):
    title = profile.get("title", "")
    description = profile.get("description", "")
    missions = profile.get("mainMissions", "")
    experience = profile.get("yearsOfExperience", "")
    tech_skills = profile.get("technicalSkills", [])
    soft_skills = profile.get("softSkills", [])
    languages = profile.get("languages", [])
    education = profile.get("education", "")
    location = profile.get("location", "")
    start_date = profile.get("startDate", "")
    type_contract = profile.get("typeContract", "")
    outputLangue = profile.get("outputLangue", "français")
    profile_id = str(profile.get("id") or profile.get("_id") or "").strip()

    # Extract options from the profile
    options = profile.get("options", {})
    langue = options.get("langue", "français")
    ton = options.get("ton", "professionnel")
    longueur = options.get("longueur", "moyen")
    emojis = options.get("emojis", "oui")

    print('Generating prompts with the following profile data:', {
        "outputLangue": outputLangue,
        "profile_id": profile_id
    })

    prompt_classique = f"""
    Create a professional job description in {outputLangue.upper()} based on the following input fields and their respective details. Use the information provided to craft a clear and concise description suitable for a job posting. If any field is left blank, remove it from the description. Here are the fields and their potential inputs:
•   job title : {title}
•   Location : {location}
•   Experience: {experience}
•   Start date: {start_date}
•   Contract type: {type_contract}
•   Description: {description}
•   Key responsibilities: {missions}
•   Required education: {education}
•   Technical skills: {tech_skills}
•   Soft skills: {soft_skills}
•   Required languages: {languages}
Ensure the tone is professional and appealing to potential candidates.
    """

    char_limit = 600 if longueur == "petit" else 1000 if longueur == "moyen" else 1300
    emoji_text = "avec émoji" if emojis == "oui" else "sans émoji"
    bullet_style = "avec émojis" if emojis == "oui" else "avec tirets classiques"
    if profile_id:
        form_link = f"http://localhost:5173/profile/{profile_id}/upload-cv"
    prompt_linkedin = f"""
Tu es un expert en communication RH et LinkedIn.

Ta mission est de transformer une description de poste classique en une publication LinkedIn engageante, concise et parfaitement adaptée aux attentes de la plateforme.

📌 Contraintes de génération :
• Rédige le texte intégralement en **{langue.upper()}** (y compris les titres, puces, instructions)
• Ton : {ton}
• Longueur maximale : {longueur}
• Utilisation d’émojis : {emojis}

📋 Format attendu :
1. Titre accrocheur ({emoji_text})
2. Introduction brève et percutante (résumant le poste)
3. Missions principales (présentées sous forme de liste claire {bullet_style})
4. Profil recherché (compétences, soft skills)
5. Informations complémentaires (lieu, conditions comme CDI, stage, remote...)
6. Conclusion avec un appel à l'action

🎯 Objectif : écrire un texte engageant, fluide, lisible, et adapté au style LinkedIn tout en respectant une limite de {char_limit} caractères.
🛑 Le texte final doit impérativement être rédigé en **{langue.upper()}**, sans utiliser aucune autre langue.
puis ajoute forcement cette ligne a la fin de la description:
📩 Pour postuler, cliquez ici 👉 {form_link}

Voici la description de poste classique à transformer :
"""

    prompt_indeed = f"""
Tu es un expert en rédaction d'offres d'emploi adaptées à la plateforme Indeed.

🎯 Objectif :
Transformer une description de poste classique en une offre structurée, professionnelle et claire, optimisée spécifiquement pour Indeed afin de capter l’attention des bons candidats.

📌 Contraintes de génération :
• Rédige le texte intégralement en **{langue.upper()}** (y compris les titres, puces, instructions)
• Ton : {ton}
• Longueur attendue : {longueur}
• Ne pas utiliser d'émojis ou de formulations trop familières

🔧 Structure demandée :
1. Intitulé du poste
2. Localisation
3. Type de contrat et niveau d'expérience requis
4. Brève présentation de l’entreprise (1 à 2 phrases)
5. Missions principales (présentées en liste à puces)
6. Profil recherché (compétences et qualités attendues sous forme de puces)
7. Conditions de travail et avantages éventuels
8. Instructions de candidature claires

🛑 Règles importantes :
- Reste professionnel, informatif et direct
- Garde un ton adapté à une publication sur Indeed
- Ne dépasse pas {char_limit} caractères maximum
- Le texte final doit impérativement être rédigé en **{langue.upper()}**, sans utiliser aucune autre langue.

Voici la description de poste classique à transformer :
"""

    return {
        "classique": prompt_classique,
        "linkedin": prompt_linkedin,
        "indeed": prompt_indeed
    }
