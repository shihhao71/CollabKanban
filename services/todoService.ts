import { Todo, Status } from '../types';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  Firestore
} from 'firebase/firestore';

// --- CONFIGURATION ---
// 1. Go to Firebase Console -> Project Settings -> General -> Your apps
// 2. Copy the config object properties and paste them below.
const firebaseConfig = {
  apiKey: "AIzaSyCoP1hLOOwj29CKyV9QIB_ij2qU6l-tvJs",
  authDomain: "to-do-list-facfe.firebaseapp.com",
  projectId: "to-do-list-facfe",
  storageBucket: "to-do-list-facfe.firebasestorage.app",
  messagingSenderId: "115766297812",
  appId: "1:115766297812:web:6491c39eb5a0adbf1ea741",
  measurementId: "G-SZ0TM3E3WR" 
};

// We use a fixed collection path for this demo.
// In a real app, you might separate data by user or organization ID.
const DATA_COLLECTION = "kanban_todos";

// --- INIT ---
let db: Firestore | null = null;
let useLocalStorage = true;

const initFirebase = () => {
  try {
    // Check if config is valid (basic check)
    const hasConfig = firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("REACT_APP");
    
    if (hasConfig && !getApps().length) {
      const app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      useLocalStorage = false;
      console.log("🔥 Firebase initialized successfully. Using Cloud Firestore.");
    } else if (getApps().length) {
       // App already initialized (hot reload support)
       db = getFirestore(getApps()[0]);
       useLocalStorage = false;
       console.log("🔥 Firebase already initialized. Using Cloud Firestore.");
    } else {
      console.warn("⚠️ Firebase config is missing or incomplete. Using LocalStorage simulation mode.");
      useLocalStorage = true;
    }
  } catch (e) {
    console.error("Firebase init failed, falling back to local storage", e);
    useLocalStorage = true;
  }
};

initFirebase();

// --- SERVICE API ---

export const subscribeToTodos = (callback: (todos: Todo[]) => void) => {
  if (!useLocalStorage && db) {
    // Cloud Mode
    const q = query(collection(db, DATA_COLLECTION), orderBy('createdAt', 'desc'));
    
    // Real-time listener
    return onSnapshot(q, (snapshot) => {
      const todos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Todo));
      callback(todos);
    }, (error) => {
      console.error("Firestore sync error:", error);
      if (error.code === 'permission-denied') {
        alert("🔴 Database Error: Permission Denied.\n\nPlease go to Firebase Console -> Firestore Database -> Rules.\nChange 'allow read, write: if false;' to 'if true;' (for testing only).");
      }
    });
  } else {
    // LocalStorage Simulation Mode
    const load = () => {
      try {
        const raw = localStorage.getItem(DATA_COLLECTION);
        const todos: Todo[] = raw ? JSON.parse(raw) : [];
        todos.sort((a, b) => b.createdAt - a.createdAt);
        callback(todos);
      } catch (e) {
        console.error("Local load error", e);
        callback([]);
      }
    };
    
    load(); // Initial load
    
    // Listen for cross-tab updates
    const handler = (e: StorageEvent) => {
      if (e.key === DATA_COLLECTION) load();
    };
    window.addEventListener('storage', handler);
    // Custom event for same-tab updates
    window.addEventListener('local-data-change', load);
    
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('local-data-change', load);
    };
  }
};

export const addTodo = async (todo: Omit<Todo, 'id'>) => {
  try {
    if (!useLocalStorage && db) {
      await addDoc(collection(db, DATA_COLLECTION), todo);
    } else {
      const raw = localStorage.getItem(DATA_COLLECTION);
      const todos: Todo[] = raw ? JSON.parse(raw) : [];
      const newTodo: Todo = { ...todo, id: crypto.randomUUID() };
      todos.push(newTodo);
      localStorage.setItem(DATA_COLLECTION, JSON.stringify(todos));
      window.dispatchEvent(new Event('local-data-change'));
    }
  } catch (error: any) {
    console.error("Error adding task:", error);
    alert(`Failed to add task: ${error.message}`);
    throw error;
  }
};

export const updateTodo = async (id: string, updates: Partial<Todo>) => {
  try {
    if (!useLocalStorage && db) {
      const docRef = doc(db, DATA_COLLECTION, id);
      await updateDoc(docRef, updates);
    } else {
      const raw = localStorage.getItem(DATA_COLLECTION);
      let todos: Todo[] = raw ? JSON.parse(raw) : [];
      todos = todos.map(t => t.id === id ? { ...t, ...updates } : t);
      localStorage.setItem(DATA_COLLECTION, JSON.stringify(todos));
      window.dispatchEvent(new Event('local-data-change'));
    }
  } catch (error: any) {
    console.error("Error updating task:", error);
    if (!updates.status) { 
        alert(`Failed to update task: ${error.message}`); 
    }
    throw error;
  }
};

export const deleteTodo = async (id: string) => {
  try {
    if (!useLocalStorage && db) {
      console.log("Attempting to delete doc from Cloud:", id);
      await deleteDoc(doc(db, DATA_COLLECTION, id));
      console.log("Delete successful");
    } else {
      const raw = localStorage.getItem(DATA_COLLECTION);
      let todos: Todo[] = raw ? JSON.parse(raw) : [];
      todos = todos.filter(t => t.id !== id);
      localStorage.setItem(DATA_COLLECTION, JSON.stringify(todos));
      window.dispatchEvent(new Event('local-data-change'));
    }
  } catch (error: any) {
    console.error("Error deleting task:", error);
    const msg = error.code === 'permission-denied' 
      ? "🔴 Permission Denied: Your Firestore rules block deletion.\n\nPlease Check Firebase Console -> Firestore -> Rules tab."
      : `Delete failed: ${error.message}`;
    alert(msg);
    throw error;
  }
};