import { initializeApp, FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
  Auth
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs, 
  query, 
  where,
  Firestore
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  FirebaseStorage
} from "firebase/storage";
import { User, MessageState } from '../types';

// Configuração Real do Firebase
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Check if config is valid
const isConfigValid = !!firebaseConfig.apiKey;

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (isConfigValid) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
    } catch (e) {
        console.error("Firebase initialization failed:", e);
    }
} else {
    console.warn("⚠️ Firebase Config Missing! App running in UI-only/Mock mode.");
}

// --- Helpers ---

const mapFirebaseUserToUser = (fbUser: FirebaseUser, credits: number = 0): User => {
    return {
        uid: fbUser.uid,
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Convidado',
        email: fbUser.email || '',
        photoURL: fbUser.photoURL || undefined,
        credits: credits
    };
};

// --- LOCAL STORAGE HELPERS (FALLBACK) ---
const LOCAL_STORAGE_KEY_PROJECTS = 'noelvision_local_projects';

const saveLocalProject = (project: MessageState) => {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY_PROJECTS);
        const projects = stored ? JSON.parse(stored) : [];
        const existingIndex = projects.findIndex((p: MessageState) => p.id === project.id);
        
        if (existingIndex >= 0) {
            projects[existingIndex] = project;
        } else {
            projects.push(project);
        }
        localStorage.setItem(LOCAL_STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    } catch (e) {
        console.warn("Erro ao salvar localmente:", e);
    }
};

const getLocalProjects = (userId: string): MessageState[] => {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY_PROJECTS);
        if (!stored) return [];
        const projects = JSON.parse(stored) as MessageState[];
        return projects.filter(p => p.userId === userId);
    } catch (e) {
        return [];
    }
};


// --- Auth Functions ---

export const subscribeToAuth = (callback: (user: User | null) => void) => {
    if (!auth) {
        callback(null); 
        return () => {};
    }
    return onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
            let credits = 2; // Default credits for new users

            // 1. Try to fetch from Firestore
            if (db) {
                try {
                    const userDocRef = doc(db, "users", fbUser.uid);
                    const userSnap = await getDoc(userDocRef);
                    if (userSnap.exists()) {
                        const data = userSnap.data();
                        if (data.credits !== undefined) {
                            credits = data.credits;
                        }
                    } else {
                        // User doesn't exist in DB yet, create it with default credits
                         try {
                            await setDoc(userDocRef, { 
                                email: fbUser.email,
                                displayName: fbUser.displayName,
                                credits: 2 
                            }, { merge: true });
                         } catch (createErr) {
                             console.warn("Failed to create user doc in Firestore:", createErr);
                         }
                    }
                } catch (e) {
                    console.warn("Failed to fetch credits from Firestore:", e);
                }
            }

            // 2. Fallback to LocalStorage if Firestore failed or returned 0 (maybe we want to persist locally too)
            // Actually, let's only use localStorage if we couldn't connect to Firestore or if it's a fallback mode
            try {
                const localCredits = localStorage.getItem(`credits_${fbUser.uid}`);
                if (localCredits !== null && (!db)) {
                    credits = parseInt(localCredits, 10);
                } else if (!db) {
                     // First time local login
                     localStorage.setItem(`credits_${fbUser.uid}`, '2');
                }
            } catch (e) {
                console.warn("Local storage error:", e);
            }

            callback(mapFirebaseUserToUser(fbUser, credits));
        } else {
            callback(null);
        }
    });
};

export const signInWithGoogle = async (): Promise<User> => {
    if (!auth) {
        // Mock login
        console.log("Mock Google Login");
        const mockUser: User = { uid: 'mock-user', displayName: 'Visitante (Demo)', email: 'demo@noel.com' };
        // We can't easily inject this into the subscription without a real auth object.
        // So we might need to rely on the app handling the return value.
        // But App.tsx relies on subscribeToAuth.
        // Let's just throw for now or handle it in App.tsx?
        // Ideally we should implement a full mock auth provider but that's complex.
        // Let's just throw a friendly error.
        alert("Modo Demo: Firebase não configurado. Autenticação simulada não implementada completamente.");
        throw new Error("Firebase não configurado");
    }
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        if (result.user) {
            return mapFirebaseUserToUser(result.user);
        }
        throw new Error("Login falhou");
    } catch (error) {
        console.error("Erro no login Google:", error);
        throw error;
    }
};

export const registerWithEmail = async (email: string, pass: string, name: string): Promise<User> => {
    if (!auth) {
         console.log("Mock Register");
         alert("Modo Demo: Cadastro não disponível sem Firebase.");
         throw new Error("Firebase não configurado");
    }
    try {
        const result = await createUserWithEmailAndPassword(auth, email, pass);
        if (result.user) {
            await updateProfile(result.user, { displayName: name });
            return mapFirebaseUserToUser({ ...result.user, displayName: name } as FirebaseUser);
        }
        throw new Error("Falha ao criar usuário");
    } catch (error) {
        console.error("Erro no cadastro:", error);
        throw error;
    }
};

export const loginWithEmail = async (email: string, pass: string): Promise<User> => {
    if (!auth) {
         console.log("Mock Login");
         alert("Modo Demo: Login não disponível sem Firebase.");
         throw new Error("Firebase não configurado");
    }
    try {
        const result = await signInWithEmailAndPassword(auth, email, pass);
        if (result.user) {
            return mapFirebaseUserToUser(result.user);
        }
        throw new Error("Login falhou");
    } catch (error) {
        console.error("Erro no login:", error);
        throw error;
    }
};

export const logOut = async (): Promise<void> => {
    if (!auth) return;
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Erro ao sair:", error);
    }
};

// --- Firestore Functions ---

export const saveProjectToFirestore = async (project: MessageState): Promise<void> => {
    // Always save locally first as a backup (works even in mock mode)
    saveLocalProject(project);

    if (!db) {
        console.log("Modo Demo: Projeto salvo apenas localmente.");
        return;
    }

    if (!project.id || !project.userId) {
        console.error("Tentativa de salvar projeto inválido (sem ID ou UserID):", project);
        return;
    }

    // CRÍTICO: Firestore lança erro se o objeto contiver campos com valor 'undefined'.
    const cleanData = JSON.parse(JSON.stringify(project));

    try {
        const docRef = doc(db, "projects", project.id);
        await setDoc(docRef, cleanData, { merge: true });
        console.log("Projeto salvo com sucesso no Firestore:", project.id);
    } catch (error: any) {
        console.error("Erro ao salvar projeto no Firestore:", error);
        // If permission denied, we rely on the local save we just did.
        if (error.code === 'permission-denied') {
            console.warn("Permissão negada no Firestore. Usando armazenamento local.");
            // Do not re-throw, treat as success (local)
            return; 
        }
        throw error;
    }
};

export const getUserProjects = async (userId: string): Promise<MessageState[]> => {
    // Merge with local projects (Always work)
    const localProjects = getLocalProjects(userId);

    if (!db) {
        return localProjects.sort((a, b) => b.createdAt - a.createdAt);
    }

    if (!userId) return [];

    let firestoreProjects: MessageState[] = [];
    try {
        const q = query(collection(db, "projects"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
            firestoreProjects.push(doc.data() as MessageState);
        });
    } catch (error: any) {
        console.error("Erro ao buscar projetos do Firestore:", error);
        if (error.code === 'permission-denied') {
            console.warn("Permissão negada (leitura). Usando apenas dados locais.");
        }
    }
    
    // Create a map by ID to merge duplicates (prefer Firestore if available, otherwise local)
    const projectMap = new Map<string, MessageState>();
    
    // Add local first
    localProjects.forEach(p => projectMap.set(p.id, p));
    
    // Add firestore (overwriting local if present)
    firestoreProjects.forEach(p => projectMap.set(p.id, p));

    const mergedProjects = Array.from(projectMap.values());

    // Ordenação em memória para garantir consistência visual
    return mergedProjects.sort((a, b) => b.createdAt - a.createdAt);
};

export const updateUserCredits = async (userId: string, credits: number): Promise<void> => {
    // Save to local storage for demo/fallback
    try {
        localStorage.setItem(`credits_${userId}`, credits.toString());
    } catch (e) {
        console.warn("Error saving credits locally:", e);
    }

    if (!db) {
        console.log(`Demo Mode: Updated credits for ${userId} to ${credits} locally.`);
        return;
    }

    try {
        const userRef = doc(db, "users", userId);
        // We use setDoc with merge to ensure the document exists
        await setDoc(userRef, { credits }, { merge: true });
    } catch (error: any) {
        console.error("Error updating credits in Firestore:", error);
         if (error.code === 'permission-denied') {
            console.warn("Permission denied for credits. Using local fallback.");
        }
    }
};

// --- Storage Functions ---

export const uploadFinalVideo = async (videoBlob: Blob, projectId: string): Promise<string> => {
    if (!storage) {
        console.warn("Modo Demo: Upload de vídeo não disponível.");
        throw new Error("Firebase Storage não configurado");
    }
    try {
        const storageRef = ref(storage, `videos/${projectId}/final.webm`);
        await uploadBytes(storageRef, videoBlob);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error) {
        console.error("Erro no upload do vídeo:", error);
        throw error;
    }
};