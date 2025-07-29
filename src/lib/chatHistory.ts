import { generateSessionId } from './utils';

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  mimeType: string;
}

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'audio' | 'file';
  audioUrl?: string;
  audioDuration?: number;
  attachments?: FileAttachment[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const CHAT_SESSIONS_KEY = 'hagopai_chat_sessions';
const ACTIVE_CHAT_KEY = 'hagopai_active_chat';

export const saveChatSessions = (sessions: ChatSession[]) => {
  try {
    localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.warn('Could not save chat sessions:', error);
  }
};

export const loadChatSessions = (): ChatSession[] => {
  try {
    const saved = localStorage.getItem(CHAT_SESSIONS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    }
  } catch (error) {
    console.warn('Could not load chat sessions:', error);
  }
  return [];
};

export const getActiveChat = (): string | null => {
  try {
    return localStorage.getItem(ACTIVE_CHAT_KEY);
  } catch {
    return null;
  }
};

export const setActiveChat = (chatId: string) => {
  try {
    localStorage.setItem(ACTIVE_CHAT_KEY, chatId);
  } catch (error) {
    console.warn('Could not set active chat:', error);
  }
};

export const generateChatTitle = (firstMessage: string): string => {
  const cleanMessage = firstMessage.trim();
  const lowerMessage = cleanMessage.toLowerCase();

  // Sophisticated Armenian-specific title generation with better categorization
  const titlePatterns = [
    // Armenian greetings and salutations
    { patterns: ['parev', 'inch bes', 'vonts es', 'lav es'], title: 'Armenian Greeting' },
    { patterns: ['shnorhakaloutyoun', 'mersi', 'thanks'], title: 'Gratitude Chat' },

    // Family and relationships
    { patterns: ['family', 'mama', 'haba', 'tatik', 'babik', 'yeghbayr', 'khoyr', 'entanik'], title: 'Family Discussion' },
    { patterns: ['marriage', 'wedding', 'engagement', 'children', 'kids'], title: 'Family Life' },

    // Food and culture
    { patterns: ['food', 'keretsek', 'hamov', 'dolma', 'pilaf', 'lavash', 'baklava', 'khorovats'], title: 'Armenian Cuisine' },
    { patterns: ['recipe', 'cooking', 'kitchen', 'meal', 'dinner'], title: 'Cooking Chat' },

    // Language and learning
    { patterns: ['learn', 'teach', 'language', 'armenian', 'hayeren', 'pronunciation'], title: 'Language Learning' },
    { patterns: ['translate', 'meaning', 'what does', 'how do you say'], title: 'Translation Help' },

    // Culture and traditions
    { patterns: ['culture', 'tradition', 'customs', 'heritage', 'diaspora'], title: 'Cultural Discussion' },
    { patterns: ['church', 'religion', 'christmas', 'easter', 'religious'], title: 'Faith & Tradition' },
    { patterns: ['music', 'dance', 'art', 'literature', 'poetry'], title: 'Arts & Culture' },

    // History and identity
    { patterns: ['history', 'genocide', 'armenia', 'artsakh', 'historical'], title: 'Historical Discussion' },
    { patterns: ['homeland', 'yerevan', 'ararat', 'homeland', 'motherland'], title: 'Homeland Talk' },

    // Business and career
    { patterns: ['work', 'business', 'job', 'career', 'professional', 'office'], title: 'Career & Business' },
    { patterns: ['entrepreneur', 'startup', 'company', 'client', 'meeting'], title: 'Business Discussion' },

    // Technology and programming
    { patterns: ['code', 'programming', 'software', 'tech', 'computer', 'app'], title: 'Tech Talk' },
    { patterns: ['website', 'development', 'coding', 'javascript', 'python'], title: 'Development Chat' },

    // Questions and help
    { patterns: ['help', 'question', 'how', 'what', 'why', 'where', 'when'], title: 'Help & Questions' },
    { patterns: ['explain', 'tell me', 'about', 'information'], title: 'Information Request' },

    // Location and travel
    { patterns: ['travel', 'visit', 'trip', 'vacation', 'journey'], title: 'Travel Discussion' },
    { patterns: ['armenia', 'yerevan', 'los angeles', 'beirut', 'paris'], title: 'Location Chat' }
  ];

  // Check for pattern matches
  for (const pattern of titlePatterns) {
    if (pattern.patterns.some(p => lowerMessage.includes(p))) {
      const excerpt = cleanMessage.length > 25 ? cleanMessage.slice(0, 25) + '...' : cleanMessage;
      return `${pattern.title}: ${excerpt}`;
    }
  }

  // Special handling for very short messages
  if (cleanMessage.length <= 3) {
    return `Quick Chat: ${cleanMessage}`;
  }

  // Extract key words for a dynamic title
  const words = cleanMessage.split(' ').filter(word =>
    word.length > 3 &&
    !['the', 'and', 'but', 'for', 'you', 'are', 'that', 'this', 'with', 'have', 'will', 'from'].includes(word.toLowerCase())
  );

  if (words.length >= 2) {
    const keyWords = words.slice(0, 3).join(' ');
    return `Chat about ${keyWords}`;
  }

  // Fallback to first part of message
  const fallbackTitle = cleanMessage.length > 35 ? `${cleanMessage.slice(0, 35)}...` : cleanMessage;
  return fallbackTitle || 'New Chat';
};

export const generateContextualTitle = (messages: Message[]): string => {
  if (messages.length === 0) return 'New Chat';

  // Combine all user messages to get conversation context
  const userMessages = messages.filter(m => m.isUser).map(m => m.content).join(' ');
  const aiMessages = messages.filter(m => !m.isUser).map(m => m.content).join(' ');
  const allContent = `${userMessages} ${aiMessages}`.toLowerCase();

  // Advanced topic detection based on conversation content
  const topicScores = {
    'Language Learning': ['learn', 'teach', 'practice', 'pronunciation', 'grammar', 'vocabulary', 'armenian', 'english'].reduce((score, word) => score + (allContent.split(word).length - 1), 0),
    'Family & Relationships': ['family', 'mama', 'haba', 'children', 'marriage', 'relationship', 'love', 'parent'].reduce((score, word) => score + (allContent.split(word).length - 1), 0),
    'Armenian Culture': ['culture', 'tradition', 'heritage', 'diaspora', 'armenian', 'customs', 'identity'].reduce((score, word) => score + (allContent.split(word).length - 1), 0),
    'Food & Cooking': ['food', 'recipe', 'cook', 'meal', 'dolma', 'pilaf', 'lavash', 'kitchen', 'delicious'].reduce((score, word) => score + (allContent.split(word).length - 1), 0),
    'Technology': ['code', 'programming', 'software', 'tech', 'computer', 'development', 'app', 'website'].reduce((score, word) => score + (allContent.split(word).length - 1), 0),
    'Business & Career': ['work', 'business', 'job', 'career', 'professional', 'office', 'company', 'client'].reduce((score, word) => score + (allContent.split(word).length - 1), 0),
    'History & Heritage': ['history', 'genocide', 'armenia', 'historical', 'past', 'ancestor', 'heritage'].reduce((score, word) => score + (allContent.split(word).length - 1), 0),
    'Personal Advice': ['advice', 'help', 'problem', 'issue', 'guidance', 'support', 'suggest', 'recommend'].reduce((score, word) => score + (allContent.split(word).length - 1), 0)
  };

  // Find the topic with the highest score
  const dominantTopic = Object.entries(topicScores).reduce((a, b) => topicScores[a[0]] > topicScores[b[0]] ? a : b)[0];

  // Generate summary based on first user message but with contextual topic
  const firstUserMessage = messages.find(m => m.isUser)?.content || '';
  const shortSummary = firstUserMessage.length > 25 ? firstUserMessage.slice(0, 25) + '...' : firstUserMessage;

  if (topicScores[dominantTopic] > 2) {
    return `${dominantTopic}: ${shortSummary}`;
  }

  // Fallback to original title generation
  return generateChatTitle(firstUserMessage);
};

export const createNewChatSession = (): ChatSession => {
  return {
    id: generateSessionId(),
    title: 'New Chat',
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const updateChatSession = (sessions: ChatSession[], sessionId: string, updates: Partial<ChatSession>): ChatSession[] => {
  return sessions.map(session => 
    session.id === sessionId 
      ? { ...session, ...updates, updatedAt: new Date() }
      : session
  );
};

export const deleteChatSession = (sessions: ChatSession[], sessionId: string): ChatSession[] => {
  return sessions.filter(session => session.id !== sessionId);
};
