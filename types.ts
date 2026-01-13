
export enum StrategyType {
  FUNNY = 'Funny/Witty',
  PROFESSIONAL = 'Professional',
  ROMANTIC = 'Flirty/Romantic',
  FRIENDLY = 'Casual/Friendly',
  SAVAGE = 'Savage/Comeback',
  POLITE_DECLINE = 'Polite Decline'
}

export interface ReplyOption {
  text: string;
  explanation: string;
}

export interface MessageAnalysis {
  vibe: string;
  subtext: string;
  suggestedReplies: ReplyOption[];
}

export interface AIModel {
  id: string;
  name: string;
  avatar: string;
  description: string;
  systemInstruction: string;
  status: 'online' | 'offline' | 'thinking';
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  isSticker?: boolean;
}

export interface ChatSession {
  id: string;
  model: AIModel;
  messages: Message[];
}
