export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  credits?: number;
}

export interface ScriptOption {
  id: string;
  title: string;
  parts: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface MessageState {
  id: string;
  originalText: string;
  refinedText: string;
  scriptParts?: string[]; // The distinct parts used for generation
  status: 'draft' | 'refining' | 'approved' | 'generating' | 'completed' | 'failed';
  videoUrls?: string[]; 
  createdAt: number;
  userId: string; // Vínculo com o usuário
  chatHistory?: ChatMessage[]; // Persistência da interação com o agente
}
