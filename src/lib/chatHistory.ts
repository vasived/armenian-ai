export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
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
  const cleanMessage = firstMessage.trim().slice(0, 50);
  
  // Armenian-specific title generation
  if (cleanMessage.toLowerCase().includes('parev')) {
    return `Parev conversation - ${cleanMessage.slice(0, 30)}...`;
  }
  
  if (cleanMessage.toLowerCase().includes('armenian')) {
    return `Armenian chat - ${cleanMessage.slice(0, 30)}...`;
  }
  
  if (cleanMessage.toLowerCase().includes('culture')) {
    return `Cultural discussion - ${cleanMessage.slice(0, 30)}...`;
  }
  
  if (cleanMessage.toLowerCase().includes('family')) {
    return `Family chat - ${cleanMessage.slice(0, 30)}...`;
  }
  
  return cleanMessage.length > 40 ? `${cleanMessage.slice(0, 40)}...` : cleanMessage;
};

export const createNewChatSession = (): ChatSession => {
  return {
    id: Date.now().toString(),
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
