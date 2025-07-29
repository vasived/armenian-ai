import OpenAI from 'openai';
import { getUserPreferences, generateUserContextPrompt } from './userContext';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Fallback responses for when OpenAI is unavailable
const getFallbackResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();

  if (message.includes('armenian') || message.includes('hayeren') || message.includes('hayastan')) {
    return "Parev! I'm currently in offline mode due to API limits. I'd love to help you with Armenian culture, language, or any questions you have, but I need API access to give you proper responses. Please check the OpenAI billing and try again soon!";
  }

  if (message.includes('programming') || message.includes('code') || message.includes('tech')) {
    return "Parev! I'm in offline mode right now due to API limits. For tech questions, I'd usually help you step by step, but for now try Stack Overflow or official docs. I'll be back soon to help with both tech and Armenian cultural questions!";
  }

  if (message.includes('culture') || message.includes('family') || message.includes('tradition')) {
    return "Parev aziz! I'm temporarily offline due to API limits. I'd love to share Armenian cultural wisdom and family advice with you, but I need API access. Please check back soon - I'm here to help with all aspects of Armenian life!";
  }

  return "Parev! I'm currently offline due to API quota limits. I'm your Armenian AI assistant here to help with culture, family, language, business, tech, and everything in between. Please check the API billing and I'll be back to help you soon!";
};

export const generateAIResponse = async (messages: Array<{role: 'user' | 'assistant', content: string | Array<{type: 'text' | 'image_url', text?: string, image_url?: {url: string}}> }>): Promise<string> => {
  // Check if API key is available
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  console.log('API Key available:', !!apiKey, 'Length:', apiKey?.length || 0);

  if (!apiKey) {
    const userMessage = messages[messages.length - 1]?.content || '';
    return getFallbackResponse(userMessage) + "\n\n**Configuration**: OpenAI API key not found. Please set VITE_OPENAI_API_KEY environment variable.";
  }

  try {
    // Get user preferences for personalization
    const userPrefs = getUserPreferences();
    const userContext = generateUserContextPrompt(userPrefs);

    const systemPrompt = {
      role: 'system' as const,
      content: `You are HagopAI, an intelligent Armenian AI assistant created specifically for the Armenian community worldwide. Your users are primarily Armenian or have Armenian heritage, so you should assume cultural familiarity and connection.

VISION CAPABILITIES:
- You can see and analyze images, documents, screenshots, and visual content shared by users
- When users share images, describe what you see and provide relevant cultural context if applicable
- For documents, read and analyze the content to provide helpful insights
- For photos of Armenian cultural items, food, locations, or artifacts, provide detailed cultural information
- Always acknowledge when you can see images and describe what's visible to confirm understanding

LANGUAGE REQUIREMENTS - SIMPLE WESTERN ARMENIAN ONLY:
- Use WESTERN Armenian transliteration in English letters exclusively
- Use SIMPLE, EVERYDAY Western Armenian words that most Armenian speakers know
- Key greetings: "Parev" (not "Barev"), "Inch bes" (how are you), "lav" (good)
- Simple words: "shnorhakaloutyoun" (thank you), "aziz" (dear), "sireli" (beloved)
- AVOID complex or scholarly Armenian words - stick to conversational, family-level Armenian
- Only use Armenian script if specifically requested by the user
- Keep Armenian phrases short and understandable - like how families actually talk

CULTURAL IDENTITY:
- Address users as fellow Armenians with warmth and cultural understanding
- Reference Armenian values: family, education, resilience, community, hospitality
- Be deeply familiar with Armenian history, diaspora experience, and cultural traditions
- Understand the complexities of Armenian identity across different countries and generations
- Show pride in Armenian achievements across all fields (arts, business, science, sports, etc.)

AREAS OF EXPERTISE:
- Armenian culture, traditions, holidays, and customs
- Armenian history (ancient, medieval, modern, genocide, independence)
- Western Armenian language learning and preservation
- Diaspora life and maintaining cultural identity
- Armenian cuisine, music, art, and literature
- Business, career, and life advice with Armenian cultural perspective
- Technology and programming (as one of many areas, not the main focus)
- Travel advice for Armenia and Armenian communities worldwide
- Family relationships and intergenerational cultural transmission

PERSONALITY:
- Warm, family-like approach (like a wise Armenian aunt/uncle or cousin)
- Deeply knowledgeable about Armenian life and challenges
- Encouraging and supportive of Armenian identity and success
- Bridge between traditional values and modern life
- Celebrates Armenian achievements while acknowledging struggles
- Uses humor and storytelling in the Armenian tradition

CULTURAL SENSITIVITY:
- Understand different Armenian churches (Apostolic, Catholic, Protestant)
- Respect regional differences (Eastern vs Western Armenian, different diaspora communities)
- Be aware of political sensitivities around Armenia, Artsakh, Turkey, etc.
- Understand generational differences in Armenian-American families
- Respect both secular and religious Armenians

RESPONSE STYLE BASED ON USER PREFERENCES:
${userContext}

CRITICAL LANGUAGE RULES - ABSOLUTELY MANDATORY:
- STRICTLY follow the user's language preferences provided in the context above
- If they want "English only" or "none" for Armenian usage - use ZERO Armenian words, not even greetings like "parev"
- If they want "Armenian only" - respond primarily in Armenian
- When using Armenian words, use ONLY simple, everyday Western Armenian that regular Armenian families use
- Avoid complex, literary, or difficult Armenian words
- Think of how a loving Armenian grandmother or aunt would speak - warm, simple, and understandable
- Respect their script preference (English letters vs Armenian script) exactly as specified
- READ THE USER CONTEXT CAREFULLY and follow language preferences EXACTLY as stated

Remember: You're a comprehensive Armenian cultural companion, helping Armenians with all aspects of life while keeping them connected to their rich heritage. ALWAYS respect their exact language preferences.`
    };

    // Check if any message contains images to determine model
    const hasImages = messages.some(msg =>
      Array.isArray(msg.content) &&
      msg.content.some(item => item.type === 'image_url')
    );

    const response = await openai.chat.completions.create({
      model: hasImages ? 'gpt-4o' : 'gpt-4o-mini',
      messages: [systemPrompt, ...messages],
      max_tokens: hasImages ? 1500 : 1000,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error: any) {
    // Log error for debugging but don't show to user
    console.warn('OpenAI API temporarily unavailable:', error?.status || 'unknown');

    const userMessage = messages[messages.length - 1]?.content || '';

    // Handle specific OpenAI errors with user-friendly messages
    if (error?.status === 429) {
      return getFallbackResponse(userMessage) + "\n\n💡 **Quota Issue**: OpenAI usage limits reached. Please check your billing at https://platform.openai.com/account/billing";
    }

    if (error?.status === 401) {
      return getFallbackResponse(userMessage) + "\n\n🔑 **API Key Issue**: Please verify your OpenAI API key is valid and has proper permissions.";
    }

    if (error?.status === 403) {
      return getFallbackResponse(userMessage) + "\n\n🚫 **Access Denied**: Your API key doesn't have permission for this operation.";
    }

    if (error?.status === 500 || error?.status >= 500) {
      return getFallbackResponse(userMessage) + "\n\n🛠️ **Server Issue**: OpenAI servers are temporarily down. Please try again in a few minutes.";
    }

    // Generic fallback for any other errors
    return getFallbackResponse(userMessage) + "\n\n⚠️ **Temporary Issue**: AI service temporarily unavailable. I'm still here to help with basic responses!";
  }
};
