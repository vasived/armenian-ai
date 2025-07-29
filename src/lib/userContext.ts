interface UserPreferences {
  preferredLanguage: 'english' | 'armenian' | 'mixed';
  responseStyle: 'formal' | 'casual' | 'family-like' | 'elder-like';
  armenianUsage: 'none' | 'occasional' | 'frequent' | 'armenian-only';
  armenianScript: 'transliteration' | 'armenian-letters';
  culturalDepth: 'minimal' | 'moderate' | 'deep' | 'scholarly';
  name?: string;
  location?: string;
  techBackground?: string;
  armenianLevel?: 'native' | 'learning' | 'basic' | 'advanced';
  interests?: string[];
  lastInteraction?: Date;
  // TTS preferences
  ttsEnabled?: boolean;
  ttsAutoSpeak?: boolean;
  ttsVoice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  ttsSpeed?: number;
}

const STORAGE_KEY = 'hagopai_user_preferences';

export const getUserPreferences = (): UserPreferences => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const prefs = JSON.parse(stored);
      return {
        ...prefs,
        lastInteraction: prefs.lastInteraction ? new Date(prefs.lastInteraction) : undefined
      };
    }
  } catch (error) {
    console.warn('Could not load user preferences:', error);
  }
  
  // Default preferences for Armenian users
  return {
    preferredLanguage: 'armenian',
    responseStyle: 'family-like',
    armenianUsage: 'frequent',
    armenianScript: 'transliteration',
    culturalDepth: 'moderate',
    armenianLevel: 'native',
    ttsEnabled: true,
    ttsAutoSpeak: false,
    ttsVoice: 'alloy',
    ttsSpeed: 1.0
  };
};

export const saveUserPreferences = (preferences: Partial<UserPreferences>) => {
  try {
    const current = getUserPreferences();
    const updated = {
      ...current,
      ...preferences,
      lastInteraction: new Date()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('Could not save user preferences:', error);
  }
};

export const generateUserContextPrompt = (preferences: UserPreferences): string => {
  const contextParts = [];

  if (preferences.name) {
    contextParts.push(`The user's name is ${preferences.name}.`);
  }

  if (preferences.location) {
    contextParts.push(`They are located in ${preferences.location}.`);
  }

  if (preferences.techBackground) {
    contextParts.push(`Their technical background: ${preferences.techBackground}.`);
  }

  if (preferences.interests && preferences.interests.length > 0) {
    contextParts.push(`Their interests include: ${preferences.interests.join(', ')}.`);
  }

  // Armenian language proficiency
  switch (preferences.armenianLevel) {
    case 'native':
      contextParts.push('They are a native Western Armenian speaker, fully comfortable with complex discussions in Armenian.');
      break;
    case 'advanced':
      contextParts.push('They have advanced Western Armenian skills and enjoy sophisticated Armenian conversations.');
      break;
    case 'learning':
      contextParts.push('They are actively learning Western Armenian and appreciate patient, educational help with the language.');
      break;
    case 'basic':
      contextParts.push('They have basic Armenian knowledge but prefer English for complex topics.');
      break;
  }

  // Response style preference
  switch (preferences.responseStyle) {
    case 'formal':
      contextParts.push('Use a respectful, formal tone similar to addressing an elder or professional.');
      break;
    case 'casual':
      contextParts.push('Use a relaxed, friendly tone like talking to a peer.');
      break;
    case 'family-like':
      contextParts.push('Use a warm, familial tone like talking to a beloved cousin or close family friend.');
      break;
    case 'elder-like':
      contextParts.push('Use a wise, nurturing tone like a respected Armenian elder sharing wisdom.');
      break;
  }

  // Armenian usage preference with strong enforcement
  switch (preferences.armenianUsage) {
    case 'none':
      contextParts.push('IMPORTANT: Do NOT use any Armenian words or phrases. Respond in English only. This is a strict requirement.');
      break;
    case 'occasional':
      contextParts.push('Use Armenian words and phrases occasionally for warmth and cultural connection.');
      break;
    case 'frequent':
      contextParts.push('Use Armenian words and phrases frequently throughout responses.');
      break;
    case 'armenian-only':
      contextParts.push('CRITICAL: Respond primarily or exclusively in Western Armenian. Use Armenian words, phrases, and sentence structures as the primary language of communication. Only use English for technical terms or when absolutely necessary.');
      break;
  }

  // Armenian script preference with strict enforcement
  switch (preferences.armenianScript) {
    case 'transliteration':
      contextParts.push('MANDATORY: When using Armenian words, ALWAYS use English letters (transliteration) like "parev", "shnorhakaloutyoun". NEVER use Armenian script letters.');
      break;
    case 'armenian-letters':
      contextParts.push('MANDATORY: When using Armenian words, ALWAYS use proper Armenian script letters like "Պարեւ", "շնոր��ակալություն". NEVER use English letters for Armenian words.');
      break;
  }

  // Cultural depth preference
  switch (preferences.culturalDepth) {
    case 'minimal':
      contextParts.push('Keep cultural references light and accessible.');
      break;
    case 'moderate':
      contextParts.push('Include moderate cultural context and references.');
      break;
    case 'deep':
      contextParts.push('Provide rich cultural context, history, and deep Armenian cultural insights.');
      break;
    case 'scholarly':
      contextParts.push('Include scholarly level cultural analysis, historical details, and academic depth.');
      break;
  }

  // Language preference with strong enforcement
  switch (preferences.preferredLanguage) {
    case 'armenian':
      contextParts.push('RESPOND PRIMARILY IN WESTERN ARMENIAN. Use Armenian as the main language of response. Structure sentences in Armenian and only supplement with English when necessary.');
      break;
    case 'english':
      contextParts.push('RESPOND PRIMARILY IN ENGLISH. Use English as the main language of response, minimizing Armenian unless specifically requested.');
      break;
    case 'mixed':
      contextParts.push('They enjoy natural code-switching between Armenian and English in balanced conversations.');
      break;
  }

  return contextParts.length > 0
    ? `\nUSER CONTEXT & PREFERENCES:\n${contextParts.join(' ')}\n`
    : '';
};
