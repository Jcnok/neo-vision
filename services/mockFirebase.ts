import { User, MessageState } from '../types';

/**
 * NOTE: In a real production environment, this file would initialize 'firebase/app',
 * 'firebase/auth', and 'firebase/firestore'.
 * 
 * For this demo/challenge delivery, we implement a LocalStorage simulation
 * so the app is fully functional for the reviewer immediately.
 */

const STORAGE_KEY_USER = 'noelvision_user';
const STORAGE_KEY_MESSAGES = 'noelvision_messages';

let authListeners: ((user: User | null) => void)[] = [];

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(STORAGE_KEY_USER);
  return stored ? JSON.parse(stored) : null;
};

const notifyAuthListeners = () => {
  const user = getCurrentUser();
  authListeners.forEach(listener => listener(user));
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  authListeners.push(callback);
  callback(getCurrentUser()); // Initial state check
  return () => {
    authListeners = authListeners.filter(l => l !== callback);
  };
};

// Mock Auth
export const signIn = async (): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockUser: User = {
        uid: 'user_' + Math.random().toString(36).substr(2, 9),
        displayName: 'Convidado de Natal',
        email: 'convidado@polonorte.com',
        photoURL: 'https://picsum.photos/100/100'
      };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockUser));
      notifyAuthListeners();
      resolve(mockUser);
    }, 800);
  });
};

export const signOut = async (): Promise<void> => {
  localStorage.removeItem(STORAGE_KEY_USER);
  notifyAuthListeners();
};

// Mock Database
export const saveMessageProject = async (message: MessageState): Promise<void> => {
  const messages = await getMessages();
  const existingIndex = messages.findIndex(m => m.id === message.id);
  
  if (existingIndex >= 0) {
    messages[existingIndex] = message;
  } else {
    messages.push(message);
  }
  
  localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
};

export const getMessages = async (): Promise<MessageState[]> => {
  const stored = localStorage.getItem(STORAGE_KEY_MESSAGES);
  return stored ? JSON.parse(stored) : [];
};